const {Transaction, TxOut} = require("bsv-wasm");
const bsv20 = require("../consts/bsv20");
const { getInscDetails,getOrderLockDetails, getOrderLockDetailsV2 } = require("../utils/bsv20");
const { is1SatScript, getOrdEnvelope, getAddressP2pkhScript, getP2pkhScript, isOrderLockScript, isP2pkhScript } = require("../utils/ord");
const { isSupportedTick } = require("../utils/platform");
const MysqlHelper = require("./mysql");

const _mysqlHelper = new MysqlHelper();

class IndexerHelper{

    async indexBsv20(txHex,height,idx){

        let i;
        let ordOutputs = [];
 

        let tx = Transaction.from_hex(txHex)

        for(i=0;i<tx.get_noutputs();i++){
           let output = tx.get_output(i);
           let outpoint = `${tx.get_id_hex()}_${i}`;
           let scriptPubKeyAsm = output.get_script_pub_key().to_asm_string();
           let scriptPubKeyHex = output.get_script_pub_key().to_hex();
           let value = output.get_satoshis();

           if(value ==1 && is1SatScript(scriptPubKeyAsm)){
               let envelope = getOrdEnvelope(scriptPubKeyAsm);
               let p2pkhScript = isP2pkhScript(scriptPubKeyAsm)?getP2pkhScript(scriptPubKeyAsm):null;
               let inscDetails = getInscDetails(envelope);
               if(inscDetails["type"] == "bsv-20" && isSupportedTick(inscDetails["insc"]["tick"])){
                  let ordOutput = {
                    vout : i,
                    outpoint,
                    inscDetails : getInscDetails(envelope),
                    scriptPubKeyHex,
                    scriptPubKeyAsm,
                    address : p2pkhScript?getAddressP2pkhScript(p2pkhScript) : null
                  };

                  ordOutputs.push(ordOutput);

               }

           }
           
        }
       
        for(i=0;i<ordOutputs.length;i++){
              let payload = {
                  txid : tx.get_id_hex(),
                  height : height,
                  vout : ordOutputs[i]["vout"],
                  idx : idx,
                  outpoint : ordOutputs[i]["outpoint"],
                  origin : ordOutputs[i]["outpoint"],
                  insc : JSON.stringify(ordOutputs[i]["inscDetails"]["insc"]),
                  owner : ordOutputs[i]["address"],
                  scriptPubKeyHex : ordOutputs[i]["scriptPubKeyHex"],
                  tick : ordOutputs[i]["inscDetails"]["insc"]["tick"],
                  state : -1
              };

              if(ordOutputs[i]["inscDetails"]["insc"]["op"] == "deploy"){
                  payload["amt"] = 0;
                  payload["type"] = bsv20.op.deploy;
              }
              
              if(ordOutputs[i]["inscDetails"]["insc"]["op"] == "mint"){
                  payload["amt"] = ordOutputs[i]["inscDetails"]["insc"]["amt"];
                  payload["type"] = bsv20.op.mint;
              }else if(ordOutputs[i]["inscDetails"]["insc"]["op"] == "transfer"){
                  payload["type"] = bsv20.op.transfer;
                  if(isOrderLockScript(ordOutputs[i]["scriptPubKeyHex"])){
                    let orderDetails = getOrderLockDetailsV2(ordOutputs[i]["scriptPubKeyAsm"]);
                    payload["orderLockInfo"] = JSON.stringify(orderDetails);
                    payload["subType"] = bsv20.op.subOp.list;
                    let outpoint = `${tx.get_input(i).get_prev_tx_id_hex()}_${i}`
                    let outpointDetails = await _mysqlHelper.getTxo(outpoint);
                    if(outpointDetails.length>0){
                        payload["amt"] = ordOutputs[i]["inscDetails"]["insc"]["amt"];
                        payload["owner"] = outpointDetails[0]["owner"];
                    }else{
                        payload["owner"] = "n/a";
                        payload["state"] = bsv20.states.nullOwner;
                    }
                    
                  }
              }

              await _mysqlHelper.indexInscOutpoint(payload);

          
        }

        if(ordOutputs.length>0){
            let payloadTx = {
               txid : tx.get_id_hex(),
               rawHex : txHex,
            }
            await _mysqlHelper.addTx(payloadTx);

        }


       

    }

}

module.exports = IndexerHelper;