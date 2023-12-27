const { P2PKHAddress, TxOut } = require("bsv-wasm");
const { regexOrderLock, regexTxOutHex } = require("../shared/data/regex");
const { hexToText, hexToDecimalLittleEndian } = require("./misc");

function getInscDetails(envelope){
    let tokens = envelope.split(" ");
    let mimeType = hexToText(tokens[4]);
    let returnVal = {
        type :  "unknown",
        insc : tokens[6],
    }

    if(mimeType == "application/bsv-20"){
        
        let inscJson = JSON.parse(hexToText(tokens[6]));
        console.log(inscJson)
        if(isDeployInsc(inscJson) || isMintInsc(inscJson) || isTransferInsc(inscJson)){
           returnVal = {
              type : "bsv-20",
              insc : inscJson
           }
        }
        
        
    }

    return returnVal;

}


function getLockDetails(lockScript){

    let tokens = lockScript.split(" ");
    
    return {
        blockHeight : hexToDecimalLittleEndian(tokens[6]),
        address : P2PKHAddress.from_pubkey_hash(Buffer.from(tokens[5],"hex")),
    }

    


}

function getOrderLockDetails(scriptPubkeyHex){
    var match = regexOrderLock.exec(scriptPubkeyHex);
    let returnVal;

    // Check if there is a match
    if (match && match.length > 1) {
        let order = match[1];
        let matchPayout = regexTxOutHex.exec(order);
        if(matchPayout && matchPayout.length>0){
            let payOutHex = matchPayout[0];
            let txOutPayOut = TxOut.from_hex(payOutHex).to_json();
            let tmp = {
                "payOutHex" : payOutHex,
                "orderValue" : txOutPayOut["value"],
            }
            returnVal = tmp;
        }
       
    }
    return returnVal;
   
}


function isDeployInsc(jsonObj){

    // Define the set of required keys
    const requiredKeys = new Set(["p", "op", "tick", "max", "lim"]);


    // Check if any keys other than the required ones exist
    for (const key in jsonObj) {
        if (!requiredKeys.has(key)) {
            return false;
        }
    }


    // Check if the required keys are present
    if (jsonObj.p == null || jsonObj.op == null || jsonObj.tick == null || jsonObj.max == null || jsonObj.lim == null) {
        return false;
    }


    // Check the protocol
    if (jsonObj.p !== "bsv-20") {
        return false;
    }

    // Check the operation
    if (jsonObj.op !== "deploy") {
        return false;
    }

    // Check ticker length
    if (jsonObj.tick.length > 4) {
        return false;
    }


    // Check max, lim, sats, and blocks are non-negative integers
    if (!Number.isInteger(jsonObj.max) || !Number.isInteger(jsonObj.lim)) {
        return false;
    }


    // Check dec if present is a non-negative integer
    if (jsonObj.dec && !Number.isInteger(jsonObj.dec)) {
        return false;
    }

    // Check max, dec, limit, sats, and blocks are within valid ranges
    if (jsonObj.max < 0 || jsonObj.lim < 0 ) {
        return false;
    }

    // Maximum supply and decimals constraints
    if (jsonObj.max > 2**64 - 1 || (jsonObj.dec && (jsonObj.dec < 0 || jsonObj.dec > 18))) {
        return false;
    }

    return true;

}

function isMintInsc(jsonObj){
        // Define the set of required keys
        const requiredKeys = new Set(["p", "op", "tick", "amt"]);

        // Check if any keys other than the required ones exist
        for (const key in jsonObj) {
            if (!requiredKeys.has(key)) {
                return false;
            }
        }
    
        // Check if all required keys are present
        if (jsonObj.p == null || jsonObj.op == null || jsonObj.tick == null || jsonObj.amt == null) {
            return false;
        }
    
        // Check the protocol
        if (jsonObj.p !== "bsv-20") {
            return false;
        }
    
        // Check the operation
        if (jsonObj.op !== "mint") {
            return false;
        }
    
        // Check id is a non-empty string and follows the format txid_vout
        if (typeof jsonObj.tick !== "string" || jsonObj.tick.length>4) {
            return false;
        }
    
        // Check amt is a non-negative integer
        if (!Number.isInteger(jsonObj.amt) || jsonObj.amt < 0) {
            return false;
        }
    
        return true;
}

function isTransferInsc(jsonObj){

    // Define the set of required keys
    const requiredKeys = new Set(["p", "op", "tick", "amt"]);

    // Check if any keys other than the required ones exist
    for (const key in jsonObj) {
        if (!requiredKeys.has(key)) {
            return false;
        }
    }

    // Check if all required keys are present
    if (jsonObj.p == null || jsonObj.op == null || jsonObj.tick == null || jsonObj.amt == null) {
        return false;
    }

    // Check the protocol
    if (jsonObj.p !== "bsv-20") {
        return false;
    }

    // Check the operation
    if (jsonObj.op !== "transfer") {
        return false;
    }

    // Check id is a non-empty string and follows the format txid_vout
    if (typeof jsonObj.tick !== "string" || jsonObj.tick.length>4) {
        return false;
    }

    // Check amt is a non-negative integer
    if (!Number.isInteger(jsonObj.amt) || jsonObj.amt < 0) {
        return false;
    }

    return true;

}


module.exports = {
    getInscDetails,
    getLockDetails,
    getOrderLockDetails,
}