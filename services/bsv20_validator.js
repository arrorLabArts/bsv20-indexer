const { Transaction } = require("bsv-wasm");
const bsv20 = require("../consts/bsv20");
const errors = require("../consts/errors");
const MysqlHelper = require("../helpers/mysql");

const _mysqlHelper = new MysqlHelper();



class Bsv20Validator{
    async init(){
        
    }

    async validate(){
        let i;
        let queue = await _mysqlHelper.getValidationQueue(100);
        for(i=0;i<queue.length;i++){
            if(queue[i]["type"] == bsv20.op.deploy){
                let res = await _mysqlHelper.getInscByTick(queue[i]["type"],queue[i]["tick"],bsv20.states.valid);
                if(res.length == 0){
                    await _mysqlHelper.updateStateOne(queue[i]["tick"],queue[i]["type"],bsv20.states.valid,queue[i]["outpoint"]);
                }else{
                    await _mysqlHelper.updateStateOne(queue[i]["tick"],queue[i]["type"],bsv20.states.invalid,queue[i]["outpoint"],errors.bsv20.deploy.reduntantDeploy.message);
                }
            }else if(queue[i]["type"] == bsv20.op.mint){

                let deployInsc = await _mysqlHelper.getInscByTick(0,queue[i]["tick"],bsv20.states.valid);
                if(deployInsc.length > 1){
                    await _mysqlHelper.updateStateOne(queue[i]["tick"],queue[i]["type"],bsv20.states.invalid,queue[i]["outpoint"],errors.bsv20.deploy.reduntantDeploy.message)
                }else if(deployInsc.length == 0){
                    await _mysqlHelper.updateStateOne(queue[i]["tick"],queue[i]["type"],bsv20.states.invalid,queue[i]["outpoint"],errors.bsv20.mint.nullDeploy.message)
                }else{
                    let res = await _mysqlHelper.getTokenSupply(queue[i]["tick"],queue[i]["type"],bsv20.states.valid);
                    if(res[0]["supply"] <= deployInsc["max"] ){
                        await _mysqlHelper.updateStateOne(queue[i]["tick"],queue[i]["type"],bsv20.states.valid,queue[i]["outpoint"]);
                    }else{
                        await _mysqlHelper.updateStateOne(queue[i]["tick"],queue[i]["type"],bsv20.states.invalid,queue[i]["outpoint"],errors.bsv20.mint.supplyOverflow.message);
                    }
                }
                
            }else if(queue[i]["type"] == bsv20.op.transfer){
                let i;
                let res = await _mysqlHelper.getTx(queue[i]["txid"]);
                let tx = Transaction.from_hex(res[0]["rawHex"]);
                let nInputs = tx.get_ninputs();
                let nOutputs = tx.get_noutputs();
                let outpointsTxIn = [];
                let outpointsTxOut = [];
                for(i=0;i<nInputs;i++){
                    outpointsTxIn.push(tx.get_input(i).get_outpoint_hex(true))
                }
                for(i=0;nOutputs;i++){
                    outpointsTxOut.push(`${tx.get_id_hex()}_${i}`);
                }

                let totalAmtInputs = await _mysqlHelper.getTotalAmtByOutpoints(outpointsTxIn,queue[i]["owner"],bsv20.states.valid);
                let totalAmtOutputs = await _mysqlHelper.getTotalAmtByOutpoints(outpointsTxOut,queue[i]["owner"],bsv20.states.valid);

                if(totalAmtInputs<totalAmtOutputs){
                    await _mysqlHelper.updateStateMany(outpointsTxIn,bsv20.states.burned,errors.bsv20.transfer.lowerInputAmt.message);
                    await _mysqlHelper.updateStateMany(outpointsTxOut,bsv20.states.invalid,errors.bsv20.transfer.lowerInputAmt.message);

                }else{
                    await _mysqlHelper.updateStateMany(outpointsTxIn,bsv20.states.spent);
                    await _mysqlHelper.updateStateMany(outpointsTxOut,bsv20.states.valid);
                }
            }
            
        }

    }
}