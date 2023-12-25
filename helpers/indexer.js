const {Transaction} = require("bsv-wasm");
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
           let scriptPubKeyAsm = output.get_script_pub_key().to_asm_string();
           let scriptPubKeyHex = output.get_script_pub_key().to_hex();
           let value = output.get_satoshis();

           if(value ==1 && is1SatScript(scriptPubKeyAsm)){
               let envelope = getOrdEnvelope(scriptPubKeyAsm);
               let p2pkhScript = getP2pkhScript(scriptPubKeyAsm);
               let inscDetails = getInscDetails(envelope);
               if(inscDetails["type"] == "bsv-20" && isSupportedTick(inscDetails["insc"]["tick"])){
                  console.log("tick supported ",inscDetails["insc"]["tick"]);
                  let address = getAddressP2pkhScript(p2pkhScript);
                  inscDetails["vout"] = output.get_vout();
                  inscDetails["address"] = address;
                  inscDetails["scriptPubKeyHex"] = scriptPubKeyHex
                  ordOutputs.push(inscDetails);

               }

           }
           
        }
       
        for(i=0;i<ordOutputs.length;i++){

              let outpoint = `${tx.get_id_hex()}_${ordOutputs[i]["vout"]}`;

              let payload = {
                  txid : tx.get_id_hex(),
                  height : height,
                  idx : idx,
                  outpoint : outpoint,
                  origin : outpoint,
                  inscription : JSON.stringify(ordOutputs[i]["insc"]),
                  owner : ordOutputs[i]["address"],
                  tick : ordOutputs[i]["insc"]["tick"],
                  state : -1
              };

              if(ordOutputs[i]["insc"]["op"] == "deploy"){
                  payload["amt"] = 0;
                  payload["type"] = 0;
              }else if(ordOutputs[i]["insc"]["op"] == "mint"){
                  payload["amt"] = ordOutputs[i]["insc"]["amt"];
                  payload["type"] = 1;
              }else if(ordOutputs[i]["insc"]["op"] == "transfer"){
                  if(isOrderLockScript(ordOutputs[i]["scriptPubKeyHex"])){
                    let orderDetails = getOrderLockDetails(ordOutputs[i]["scriptPubKeyHex"]);
                    payload["orderLockInfo"] = JSON.stringify(orderDetails);
                    payload["type"] = 1;
                  }
              }

              //await _mysqlHelper.indexTx(payload);

          
        }
       

    }

}

module.exports = IndexerHelper;