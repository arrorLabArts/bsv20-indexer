const {Transaction} = require("bsv-wasm");
const bsv20 = require("../consts/bsv20");
const { getInscDetails,getOrderLockDetails } = require("../utils/bsv20");
const { is1SatScript, getOrdEnvelope, getAddressP2pkhScript, getP2pkhScript, isOrderLockScript } = require("../utils/ord");
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
               let p2pkhScript = getP2pkhScript(scriptPubKeyAsm);
               let inscDetails = getInscDetails(envelope);
               if(inscDetails["type"] == "bsv-20" && isSupportedTick(inscDetails["insc"]["tick"])){
                  let ordOutput = {
                    vout : i,
                    outpoint,
                    inscDetails : getInscDetails(envelope),
                    scriptPubKeyHex,
                    address : getAddressP2pkhScript(p2pkhScript)
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
              }else if(ordOutputs[i]["inscDetails"]["insc"]["op"] == "mint"){
                  payload["amt"] = ordOutputs[i]["inscDetails"]["insc"]["amt"];
                  payload["type"] = bsv20.op.mint;
              }else if(ordOutputs[i]["inscDetails"]["insc"]["op"] == "transfer"){
                  payload["type"] = bsv20.op.transfer;
                  if(isOrderLockScript(ordOutputs[i]["scriptPubKeyHex"])){
                    let orderDetails = getOrderLockDetails(ordOutputs[i]["scriptPubKeyHex"]);
                    payload["orderLockInfo"] = JSON.stringify(orderDetails);
                    payload["subType"] = bsv20.op.subOp.list;
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