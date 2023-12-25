const { regexOrdEnvelope, regexLockPrefix, regexLockSuffix, regexP2pkh, regexOrderLockPrefix, regexOrderLockSuffix, regexScriptSigUnlist, regexScriptSigBuy, regexOrderLock } = require("../shared/data/regex");
const {P2PKHAddress} = require("bsv-wasm");

function is1SatScript(scriptPubKeyAsm){
    return  regexOrdEnvelope.test(scriptPubKeyAsm) && regexP2pkh.test(scriptPubKeyAsm);
}

function isOrderLockScript(scriptPubKeyHex){
    return  regexOrderLock.test(scriptPubKeyHex);
}


function isUnlistScript(scriptSigHex){
    return  regexScriptSigUnlist.test(scriptSigHex);
}

function isBuyScript(scriptSigHex){
    return  regexScriptSigBuy.test(scriptSigHex);
}

function getAddressFromLockScript(script){

    let tokens = script.split(" ");
    let pubkeyHash = tokens[5];
    return P2PKHAddress.from_pubkey_hash(Buffer.from(pubkeyHash,"hex")).to_string();
}

function getAddressP2pkhScript(script){
    let tokens = script.split(" ");
    let pubkeyHash = tokens[2];
    return P2PKHAddress.from_pubkey_hash(Buffer.from(pubkeyHash,"hex")).to_string();
}


function getOrdEnvelope(scriptPubKeyAsm){

    

    let match = regexOrdEnvelope.exec(scriptPubKeyAsm);
    
    return match !== null? match[0] : null
  
    
  
}

function getP2pkhScript(scriptPubKeyAsm){

    

    let match = regexP2pkh.exec(scriptPubKeyAsm);
    
    return match !== null? match[0] : null
  
    
  
}

function getSerializedInscFromOrdInputs(ordInputs){
    let i;
    let arrInsc = [];
    for(i=0;i<ordInputs.length;i++){
        arrInsc.push(ordInputs[i]["insc"]);
    }
    return JSON.stringify(arrInsc);
}

function getNetAmtFromInscList(inscList){
    let i;
    let amt = 0;
    for(i=0;i<inscList.length;i++){
        amt = amt + Number.parseInt(inscList[i]["insc"]["amt"]);
    }
    return amt;
}



module.exports = {
    is1SatScript,
    getOrdEnvelope,
    getAddressFromLockScript,
    getAddressP2pkhScript,
    getP2pkhScript,
    getSerializedInscFromOrdInputs,
    getNetAmtFromInscList,
    isOrderLockScript,
    isUnlistScript,
    isBuyScript
}