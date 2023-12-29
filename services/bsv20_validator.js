const { Transaction } = require("bsv-wasm");
const chokidar = require("chokidar")
const path = require("path");
const bsv20 = require("../consts/bsv20");
const errors = require("../consts/errors");
const MysqlHelper = require("../helpers/mysql");
const { sanitizeBsv20Insc } = require("../utils/bsv20");
const { delay } = require("../utils/misc");

const _mysqlHelper = new MysqlHelper();

const logPath = path.join(__dirname, '../logs', 'indexer.log');

let validationRunning = false;



class Bsv20Validator{
    async init(){

          const watcher = chokidar.watch(logPath, {
            persistent: true,
          }); 
          watcher
          .on('change', path => {
            if(!validationRunning){
                this.validate();
            }
          })
          watcher.on('error', error => console.error(`Watcher error: ${error}`));
          process.on('SIGINT', () => {
            watcher.close();
            process.exit(0);
          });

          while(!validationRunning){
             await delay(10000);
             this.validate();
          }
        
    }

    async validate(){
        let i;
        let queue = await _mysqlHelper.getValidationQueue(100);
        for(i=0;i<queue.length;i++){
            validationRunning = true;
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
                    let resSupply = await _mysqlHelper.getTokenSupply(queue[i]["tick"],queue[i]["type"],bsv20.states.valid);
                    let supply = resSupply[0]["supply"] || 0;
                    let mintInscSanitized = sanitizeBsv20Insc(JSON.parse(queue[i]["insc"]));
                    let isAmtExceedingLimit = mintInscSanitized["amt"] > deployInscSanitized["lim"];
                    let isSupplyWithinMax = (supply + mintInscSanitized["amt"]) <= deployInscSanitized["max"];
                    
                    if (isAmtExceedingLimit) {
                        await _mysqlHelper.updateStateOne(
                            queue[i]["tick"],
                            queue[i]["type"],
                            bsv20.states.invalid,
                            queue[i]["outpoint"],
                            errors.bsv20.mint.limitOverflow.message
                        );
                    } else if (isSupplyWithinMax) {
                        await _mysqlHelper.updateStateOne(
                            queue[i]["tick"],
                            queue[i]["type"],
                            bsv20.states.valid,
                            queue[i]["outpoint"]
                        );
                    } else {
                        await _mysqlHelper.updateStateOne(
                            queue[i]["tick"],
                            queue[i]["type"],
                            bsv20.states.invalid,
                            queue[i]["outpoint"],
                            errors.bsv20.mint.supplyOverflow.message
                        );
                    }
                }
                
            }
            
            if(queue[i]["type"] == bsv20.op.transfer){
                let j;
                let res = await _mysqlHelper.getTx(queue[i]["txid"]);
                let tx = Transaction.from_hex(res[0]["rawHex"]);
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

                        if(resOutpoint[0]["state"] == bsv20.states.valid || resOutpoint[0]["state"] == bsv20.states.listed){
                            if(resOutpoint[0]["state"] == bsv20.states.listed){
                                if(queue[i]["subType"] != bsv20.op.subOp.list){
                                    totalAmtInputs = totalAmtInputs + resOutpoint[0]["amt"];
                                }
                            }
                        }else{
                            totalAmtInputs = totalAmtInputs + resOutpoint[0]["amt"];
                        }


                        outpointsTxIn.push(outpoint);
                    }
                }
                for(j=0;j<nOutputs;j++){
                    let outpoint = `${tx.get_id_hex()}_${j}`
                    let resOutpoint = await _mysqlHelper.getTxo(outpoint);
                    if(resOutpoint.length>0){

                        if(resOutpoint[0]["state"] == bsv20.states.pending){
                            totalAmtOutputs = totalAmtOutputs + resOutpoint[0]["amt"];
                        }

                        outpointsTxOut.push(outpoint);
                    }
                }

                if(totalAmtInputs<totalAmtOutputs){
                    await _mysqlHelper.updateStateMany(outpointsTxIn,bsv20.states.burned,errors.bsv20.transfer.lowerInputAmt.message);
                    await _mysqlHelper.updateStateMany(outpointsTxOut,bsv20.states.invalid,errors.bsv20.transfer.lowerInputAmt.message);

                }else{
                    await _mysqlHelper.updateStateMany(outpointsTxIn,bsv20.states.spent);
                    await _mysqlHelper.updateStateMany(outpointsTxOut,bsv20.states.valid);
                }
            }

            if(queue[i]["height"] != null){
                await _mysqlHelper.updateIndexerStatus({
                    "settledHeight" : queue[i]["height"],
                    "settledIdx" : queue[i]["idx"]
                })
            }
        }
        validationRunning = false;

    }
}

module.exports = Bsv20Validator;