const { Transaction } = require("bsv-wasm");
const bsv20 = require("../consts/bsv20");
const errors = require("../consts/errors");
const MysqlHelper = require("../helpers/mysql");
const { sanitizeBsv20Insc, hasDecimalIntegrity } = require("../utils/bsv20");
const { binToHex } = require("../utils/misc");

const _mysqlHelper = new MysqlHelper();

class Bsv20Validator {
    constructor() {
        this.validationRunning = false;
    }

    async init() {
        setInterval(async () => {
            if (!this.validationRunning) {
                try {
                    await this.validate();
                } catch (e) {
                    let date = new Date();
                    _mysqlHelper.updateIndexerStatus({
                        "lastErrorLog": e.toString(),
                        "lastErrorLogTimestamp": date.getTime(),
                        "state": indexer.states.validatorStalled
                    });
                }
            }
        }, 10000);
    }

    async validate() {
            try {
                this.validationRunning = true;
                let i;
                let queue = await _mysqlHelper.getValidationQueue(1000);

                for(i=0;i<queue.length;i++){
                    if(queue[i]["type"] == bsv20.op.deploy){
                        let res = await _mysqlHelper.getInscByTick(queue[i]["type"],queue[i]["tick"],bsv20.states.valid);
                        if(res.length == 0){
                            await _mysqlHelper.updateStateOne(queue[i]["tick"],queue[i]["type"],bsv20.states.valid,queue[i]["outpoint"]);
                        }else{
                            await _mysqlHelper.updateStateOne(queue[i]["tick"],queue[i]["type"],bsv20.states.invalid,queue[i]["outpoint"],errors.bsv20.deploy.reduntantDeploy.message);
                        }
                    }
                    
                    if(queue[i]["type"] == bsv20.op.mint){

                        let resDeployInsc = await _mysqlHelper.getInscByTick(bsv20.op.deploy,queue[i]["tick"],bsv20.states.valid);
                        if(resDeployInsc.length > 1){
                            await _mysqlHelper.updateStateOne(queue[i]["tick"],queue[i]["type"],bsv20.states.invalid,queue[i]["outpoint"],errors.bsv20.deploy.reduntantDeploy.message)
                        }else if(resDeployInsc.length == 0){
                            await _mysqlHelper.updateStateOne(queue[i]["tick"],queue[i]["type"],bsv20.states.invalid,queue[i]["outpoint"],errors.bsv20.mint.nullDeploy.message)
                        }else{
                            let deployInscSanitized = sanitizeBsv20Insc(JSON.parse(resDeployInsc[0]["insc"]));
                            let resSupply = await _mysqlHelper.getTokenSupplyMint(queue[i]["tick"],queue[i]["type"],bsv20.mintStates.valid);
                            let supply = resSupply[0]["supply"] || 0;
                            let mintInscSanitized = sanitizeBsv20Insc(JSON.parse(queue[i]["insc"]));
                            let isAmtExceedingLimit = mintInscSanitized["amt"] > deployInscSanitized["lim"];
                            let isSupplyWithinMax = (supply + mintInscSanitized["amt"]) <= deployInscSanitized["max"];
                            

                            if (isAmtExceedingLimit) {
                                await _mysqlHelper.updateStateOneByMint(
                                    queue[i]["tick"],
                                    queue[i]["type"],
                                    bsv20.states.invalid,
                                    bsv20.mintStates.invalid,
                                    queue[i]["outpoint"],
                                    errors.bsv20.mint.limitOverflow.message
                                );
                            }else{
                                if (isSupplyWithinMax) {
                                    await _mysqlHelper.updateStateOneByMint(
                                        queue[i]["tick"],
                                        queue[i]["type"],
                                        bsv20.states.valid,
                                        bsv20.mintStates.valid,
                                        queue[i]["outpoint"]
                                    );
                                } else {
                                    let delta = deployInscSanitized["max"] - supply;
                                    if(delta != 0){
                                        await _mysqlHelper.updateAmtMintOne(delta,bsv20.states.valid,bsv20.mintStates.valid,queue[i]["outpoint"]);
                                        await _mysqlHelper.updateMintStateManyExcept(
                                            queue[i]["tick"],
                                            queue[i]["type"],
                                            bsv20.states.invalid,
                                            bsv20.mintStates.invalid,
                                            queue[i]["outpoint"],
                                            bsv20.mintStates.pending,
                                            errors.bsv20.mint.supplyOverflow.message
                                        );
                                    }else{
                                        await _mysqlHelper.updateMintStateMany( 
                                            queue[i]["tick"],
                                            queue[i]["type"], 
                                            bsv20.states.invalid,
                                            bsv20.mintStates.invalid,
                                            bsv20.mintStates.pending,
                                            errors.bsv20.mint.supplyOverflow.message
                                        );
                                    }
                
                                }

                            }


                        }
                        
                    }
                    
                    if(queue[i]["type"] == bsv20.op.transfer){

                        let resDeployInsc = await _mysqlHelper.getInscByTick(bsv20.op.deploy,queue[i]["tick"],bsv20.states.valid);

                        if(resDeployInsc.length > 1){
                            await _mysqlHelper.updateStateOne(queue[i]["tick"],queue[i]["type"],bsv20.states.invalid,queue[i]["outpoint"],errors.bsv20.deploy.reduntantDeploy.message)
                        }else if(resDeployInsc.length == 0){
                            await _mysqlHelper.updateStateOne(queue[i]["tick"],queue[i]["type"],bsv20.states.invalid,queue[i]["outpoint"],errors.bsv20.deploy.nullDeploy.message)
                        }else{

                            let deployInscSanitized = sanitizeBsv20Insc(JSON.parse(resDeployInsc[0]["insc"]));
                            let dec = deployInscSanitized["dec"] || 0;
                            let decimalIntegrity = hasDecimalIntegrity(dec,queue[i]["amt"]);
                            if(decimalIntegrity){
                                let j;
                                let resTxBin = await _mysqlHelper.getTx(queue[i]["txid"]);
                                let txRawHex = binToHex(resTxBin[0]["rawHex"])
                                let tx = Transaction.from_hex(txRawHex);
                                let nInputs = tx.get_ninputs();
                                let nOutputs = tx.get_noutputs();
                
                                let outpointsTxIn = [];
                                let outpointsTxOut = [];
                
                                let totalAmtInputs = 0;
                                let totalAmtOutputs = 0;
                
                                for(j=0;j<nInputs;j++){
                                    let outpoint = `${tx.get_input(j).get_prev_tx_id_hex()}_${tx.get_input(j).get_vout()}`;
                                    let resOutpoint = await _mysqlHelper.getTxo(outpoint);
                                    if(resOutpoint.length>0){
                                        if(resOutpoint[0]["tick"].toLowerCase() == queue[i]["tick"].toLowerCase() && resOutpoint[0]["state"] == bsv20.states.valid ){
                
                                            if(resOutpoint[0]["subOp"] == bsv20.op.subOp.list){
                                                if(queue[i]["subOp"] != bsv20.op.subOp.list){
                                                    totalAmtInputs = totalAmtInputs + resOutpoint[0]["amt"];
                                                }
                                            }else{
                                                totalAmtInputs = totalAmtInputs + resOutpoint[0]["amt"];
                                            }
                                            
                                        }
                
                                        outpointsTxIn.push(outpoint);
                                    }
                                }
                                for(j=0;j<nOutputs;j++){
                                    let outpoint = `${tx.get_id_hex()}_${j}`
                                    let resOutpoint = await _mysqlHelper.getTxo(outpoint);
                                    if(resOutpoint.length>0){
                
                                        if(resOutpoint[0]["tick"].toLowerCase() == queue[i]["tick"].toLowerCase() && resOutpoint[0]["state"] == bsv20.states.pending && resOutpoint[0]["op"] == bsv20.op.transfer){
                                            totalAmtOutputs = totalAmtOutputs + resOutpoint[0]["amt"];
                                        }
                
                                        outpointsTxOut.push(outpoint);
                                    }
                                }

                                if(totalAmtInputs>0){
                                    if(totalAmtOutputs>0){
                                        if(totalAmtInputs<totalAmtOutputs){
                                            await _mysqlHelper.updateStateMany(outpointsTxIn,bsv20.states.burned,errors.bsv20.transfer.lowerInputAmt.message);
                                            await _mysqlHelper.updateStateMany(outpointsTxOut,bsv20.states.invalid,errors.bsv20.transfer.lowerInputAmt.message);
                        
                                        }else{
                                            await _mysqlHelper.updateStateMany(outpointsTxIn,bsv20.states.spent);
                                            await _mysqlHelper.updateStateMany(outpointsTxOut,bsv20.states.valid);
                                            await _mysqlHelper.updateSpend(queue[i]["outpoint"],JSON.stringify(outpointsTxIn));
                                        }
                                    }else{
                                        await _mysqlHelper.updateStateOne(queue[i]["tick"],queue[i]["type"],bsv20.states.invalid,queue[i]["outpoint"],errors.bsv20.transfer.missingOutput.message);
                                    }
                                }else{
                                    await _mysqlHelper.updateStateOne(queue[i]["tick"],queue[i]["type"],bsv20.states.invalid,queue[i]["outpoint"],errors.bsv20.transfer.missingInput.message);

                                }

                            }else{
                                await _mysqlHelper.updateStateOne(queue[i]["tick"],queue[i]["type"],bsv20.states.invalid,queue[i]["outpoint"],errors.bsv20.insc.dec.message)
                            }


                        }

                    }

                    if(queue[i]["height"] != null){
                        await _mysqlHelper.updateIndexerStatus({
                            "settledHeight" : queue[i]["height"],
                            "settledIdx" : queue[i]["idx"]
                        })
                    }
                }

            } finally {
                this.validationRunning = false;
            }
        }
}

module.exports = Bsv20Validator;





























































// const { Transaction } = require("bsv-wasm");
// const bsv20 = require("../consts/bsv20");
// const errors = require("../consts/errors");
// const MysqlHelper = require("../helpers/mysql");
// const { sanitizeBsv20Insc, hasDecimalIntegrity } = require("../utils/bsv20");
// const { binToHex } = require("../utils/misc");

// const _mysqlHelper = new MysqlHelper();

// let validationRunning = false;



// class Bsv20Validator{
//     async init(){

          
//           setInterval(async()=>{
//             if(!validationRunning){
//                 try{
//                     await this.validate();
//                 }catch(e){
//                     let date = new Date();
//                     _mysqlHelper.updateIndexerStatus({"lastErrorLog":e.toString(),"lastErrorLogTimestamp":date.getTime(),"state":indexer.states.validatorStalled});
//                 }
//             }
//           },10000)
        
//     }

//     async validate(){
//         let i;
//         let queue = await _mysqlHelper.getValidationQueue(1000);
//         validationRunning = true;
//         for(i=0;i<queue.length;i++){
//             if(queue[i]["type"] == bsv20.op.deploy){
//                 let res = await _mysqlHelper.getInscByTick(queue[i]["type"],queue[i]["tick"],bsv20.states.valid);
//                 if(res.length == 0){
//                     await _mysqlHelper.updateStateOne(queue[i]["tick"],queue[i]["type"],bsv20.states.valid,queue[i]["outpoint"]);
//                 }else{
//                     await _mysqlHelper.updateStateOne(queue[i]["tick"],queue[i]["type"],bsv20.states.invalid,queue[i]["outpoint"],errors.bsv20.deploy.reduntantDeploy.message);
//                 }
//             }
            
//             if(queue[i]["type"] == bsv20.op.mint){

//                 let resDeployInsc = await _mysqlHelper.getInscByTick(bsv20.op.deploy,queue[i]["tick"],bsv20.states.valid);
//                 if(resDeployInsc.length > 1){
//                     await _mysqlHelper.updateStateOne(queue[i]["tick"],queue[i]["type"],bsv20.states.invalid,queue[i]["outpoint"],errors.bsv20.deploy.reduntantDeploy.message)
//                 }else if(resDeployInsc.length == 0){
//                     await _mysqlHelper.updateStateOne(queue[i]["tick"],queue[i]["type"],bsv20.states.invalid,queue[i]["outpoint"],errors.bsv20.mint.nullDeploy.message)
//                 }else{
//                     let deployInscSanitized = sanitizeBsv20Insc(JSON.parse(resDeployInsc[0]["insc"]));
//                     let resSupply = await _mysqlHelper.getTokenSupplyMint(queue[i]["tick"],queue[i]["type"],bsv20.mintStates.valid);
//                     let supply = resSupply[0]["supply"] || 0;
//                     let mintInscSanitized = sanitizeBsv20Insc(JSON.parse(queue[i]["insc"]));
//                     let isAmtExceedingLimit = mintInscSanitized["amt"] > deployInscSanitized["lim"];
//                     let isSupplyWithinMax = (supply + mintInscSanitized["amt"]) <= deployInscSanitized["max"];
                    

//                     if (isAmtExceedingLimit) {
//                         await _mysqlHelper.updateStateOneByMint(
//                             queue[i]["tick"],
//                             queue[i]["type"],
//                             bsv20.states.invalid,
//                             bsv20.mintStates.invalid,
//                             queue[i]["outpoint"],
//                             errors.bsv20.mint.limitOverflow.message
//                         );
//                     }else{
//                         if (isSupplyWithinMax) {
//                             await _mysqlHelper.updateStateOneByMint(
//                                 queue[i]["tick"],
//                                 queue[i]["type"],
//                                 bsv20.states.valid,
//                                 bsv20.mintStates.valid,
//                                 queue[i]["outpoint"]
//                             );
//                         } else {
//                             let delta = deployInscSanitized["max"] - supply;
//                             if(delta != 0){
//                                 await _mysqlHelper.updateAmtMintOne(delta,bsv20.states.valid,bsv20.mintStates.valid,queue[i]["outpoint"]);
//                                 await _mysqlHelper.updateMintStateManyExcept(
//                                     queue[i]["tick"],
//                                     queue[i]["type"],
//                                     bsv20.states.invalid,
//                                     bsv20.mintStates.invalid,
//                                     queue[i]["outpoint"],
//                                     bsv20.mintStates.pending,
//                                     errors.bsv20.mint.supplyOverflow.message
//                                 );
//                             }else{
//                                 await _mysqlHelper.updateMintStateMany( 
//                                     queue[i]["tick"],
//                                     queue[i]["type"], 
//                                     bsv20.states.invalid,
//                                     bsv20.mintStates.invalid,
//                                     bsv20.mintStates.pending,
//                                     errors.bsv20.mint.supplyOverflow.message
//                                 );
//                             }
        
//                         }

//                     }


//                 }
                
//             }
            
//             if(queue[i]["type"] == bsv20.op.transfer){

//                 let resDeployInsc = await _mysqlHelper.getInscByTick(bsv20.op.deploy,queue[i]["tick"],bsv20.states.valid);

//                 if(resDeployInsc.length > 1){
//                     await _mysqlHelper.updateStateOne(queue[i]["tick"],queue[i]["type"],bsv20.states.invalid,queue[i]["outpoint"],errors.bsv20.deploy.reduntantDeploy.message)
//                 }else if(resDeployInsc.length == 0){
//                     await _mysqlHelper.updateStateOne(queue[i]["tick"],queue[i]["type"],bsv20.states.invalid,queue[i]["outpoint"],errors.bsv20.deploy.nullDeploy.message)
//                 }else{

//                     let deployInscSanitized = sanitizeBsv20Insc(JSON.parse(resDeployInsc[0]["insc"]));
//                     let dec = deployInscSanitized["dec"] || 0;
//                     let decimalIntegrity = hasDecimalIntegrity(dec,queue[i]["amt"]);
//                     if(decimalIntegrity){
//                         let j;
//                         let resTxBin = await _mysqlHelper.getTx(queue[i]["txid"]);
//                         let txRawHex = binToHex(resTxBin[0]["rawHex"])
//                         let tx = Transaction.from_hex(txRawHex);
//                         let nInputs = tx.get_ninputs();
//                         let nOutputs = tx.get_noutputs();
        
//                         let outpointsTxIn = [];
//                         let outpointsTxOut = [];
        
//                         let totalAmtInputs = 0;
//                         let totalAmtOutputs = 0;
        
//                         for(j=0;j<nInputs;j++){
//                             let outpoint = `${tx.get_input(j).get_prev_tx_id_hex()}_${tx.get_input(j).get_vout()}`;
//                             let resOutpoint = await _mysqlHelper.getTxo(outpoint);
//                             if(resOutpoint.length>0){
//                                 if(resOutpoint[0]["tick"].toLowerCase() == queue[i]["tick"].toLowerCase() && resOutpoint[0]["state"] == bsv20.states.valid ){
        
//                                     if(resOutpoint[0]["subOp"] == bsv20.op.subOp.list){
//                                         if(queue[i]["subOp"] != bsv20.op.subOp.list){
//                                             totalAmtInputs = totalAmtInputs + resOutpoint[0]["amt"];
//                                         }
//                                     }else{
//                                         totalAmtInputs = totalAmtInputs + resOutpoint[0]["amt"];
//                                     }
                                    
//                                 }
        
//                                 outpointsTxIn.push(outpoint);
//                             }
//                         }
//                         for(j=0;j<nOutputs;j++){
//                             let outpoint = `${tx.get_id_hex()}_${j}`
//                             let resOutpoint = await _mysqlHelper.getTxo(outpoint);
//                             if(resOutpoint.length>0){
        
//                                 if(resOutpoint[0]["tick"].toLowerCase() == queue[i]["tick"].toLowerCase() && resOutpoint[0]["state"] == bsv20.states.pending && resOutpoint[0]["op"] == bsv20.op.transfer){
//                                     totalAmtOutputs = totalAmtOutputs + resOutpoint[0]["amt"];
//                                 }
        
//                                 outpointsTxOut.push(outpoint);
//                             }
//                         }

//                         if(totalAmtInputs>0){
//                             if(totalAmtOutputs>0){
//                                 if(totalAmtInputs<totalAmtOutputs){
//                                     await _mysqlHelper.updateStateMany(outpointsTxIn,bsv20.states.burned,errors.bsv20.transfer.lowerInputAmt.message);
//                                     await _mysqlHelper.updateStateMany(outpointsTxOut,bsv20.states.invalid,errors.bsv20.transfer.lowerInputAmt.message);
                
//                                 }else{
//                                     await _mysqlHelper.updateStateMany(outpointsTxIn,bsv20.states.spent);
//                                     await _mysqlHelper.updateStateMany(outpointsTxOut,bsv20.states.valid);
//                                     await _mysqlHelper.updateSpend(queue[i]["outpoint"],JSON.stringify(outpointsTxIn));
//                                 }
//                             }else{
//                                 await _mysqlHelper.updateStateOne(queue[i]["tick"],queue[i]["type"],bsv20.states.invalid,queue[i]["outpoint"],errors.bsv20.transfer.missingOutput.message);
//                             }
//                         }else{
//                             await _mysqlHelper.updateStateOne(queue[i]["tick"],queue[i]["type"],bsv20.states.invalid,queue[i]["outpoint"],errors.bsv20.transfer.missingInput.message);

//                         }

//                     }else{
//                         await _mysqlHelper.updateStateOne(queue[i]["tick"],queue[i]["type"],bsv20.states.invalid,queue[i]["outpoint"],errors.bsv20.insc.dec.message)
//                     }


//                 }

//             }

//             if(queue[i]["height"] != null){
//                 await _mysqlHelper.updateIndexerStatus({
//                     "settledHeight" : queue[i]["height"],
//                     "settledIdx" : queue[i]["idx"]
//                 })
//             }
//         }
//         validationRunning = false;

//     }
// }

// module.exports = Bsv20Validator;