const { P2PKHAddress, TxOut } = require("bsv-wasm");
const { OrderLockDecodeError } = require("../shared/data/exceptions");
const { regexOrderLock, regexTxOutHex, regexNumber } = require("../shared/data/regex");
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
        let inscSanitized = sanitizeBsv20Insc(inscJson);
        
        if(isDeployInsc(inscSanitized) || isMintInsc(inscSanitized) || isTransferInsc(inscSanitized)){
           returnVal = {
              type : "bsv-20",
              insc : inscSanitized
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

function sanitizeBsv20Insc(obj) {
    const keysToCheck = ["lim", "max", "amt", "dec"];
  
    // Iterate over each key in the object
    for (const key in obj) {
      // Check if the current key is one of the specified keys
      if (keysToCheck.includes(key)) {
        // Check if the value is a string-encoded number
        if (typeof obj[key] === "string" && !isNaN(parseFloat(obj[key]))) {
          // Convert the string to a number using parseFloat
          obj[key] = parseFloat(obj[key]);
        }
      }
    }
  
    // Return the modified object
    return obj;
  }


  function getOrderLockDetailsV2(scriptPubkeyAsm){

    try{
        let tokens = scriptPubkeyAsm.split(" ")
        let payOutHex = tokens[6]
        let txOutPayOut = TxOut.from_hex(tokens[6]);
        let scriptPubKey = txOutPayOut.get_script_pub_key().to_asm_string().split(" ");
        let orderValue = txOutPayOut.get_satoshis();
        //let hasBigInt = typeof orderValue === 'bigint';
        
        let tmp = {
                 payOutHex,
                 orderValue,
                 "order" : {
                    "payOutHex" : payOutHex,
                    "orderValue" : txOutPayOut.get_satoshis().toString(),
                    "address" : P2PKHAddress.from_pubkey_hash(Buffer.from(scriptPubKey[2],"hex")).to_string(),
                 }

    
        }
    
        return tmp;
    }catch(e){
        console.log(e);
        throw new OrderLockDecodeError();
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


    // Check max, lim are non-negative integers
    if(typeof jsonObj.lim === 'number'){
        if(jsonObj.lim <= 0){
           return false;
        }
    }else if(typeof jsonObj.lim === 'string'){
       if(regexNumber.test(jsonObj.lim)){
          if(parseFloat(jsonObj.lim) <= 0){
           return false;
          }
       }else{
           return false;
       }
    }

    if(typeof jsonObj.max === 'number'){
         if(jsonObj.max <= 0 || jsonObj.max > 2**64 - 1){
            return false;
         }
    }else if(typeof jsonObj.max === 'string'){
        if(regexNumber.test(jsonObj.max)){
           if(parseFloat(jsonObj.max) <= 0 || parseFloat(jsonObj.max) > 2**64 - 1){
            return false;
           }
        }else{
            return false;
        }
    }



    // Check dec if present is a non-negative integer
    if(jsonObj.dec){
        return Number.isInteger(jsonObj.dec) && jsonObj.dec > 0 && jsonObj.dec <= 18;
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
        if(typeof jsonObj.amt === 'number'){
            if(jsonObj.amt <= 0){
                return false;
            }
        }else if(typeof jsonObj.amt === 'string'){
            if(regexNumber.test(jsonObj.amt)){
                if(parseFloat(jsonObj.amt) <= 0){
                    return false;
                }
            }else{
                return false;
            }
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
    if(typeof jsonObj.amt === 'number'){
         if(jsonObj.amt <= 0){
            return false;
         }
    }else if(typeof jsonObj.amt === 'string'){
        if(regexNumber.test(jsonObj.amt)){
           if(parseFloat(jsonObj.amt) <= 0){
            return false;
           }
        }else{
            return false;
        }
    }

    return true;

}

function hasDecimalIntegrity(decimal, number) {
    // Check if the input is valid (non-negative decimal and number)
    if (decimal < 0 || number < 0) {
        throw new Error('Both numbers must be non-negative.');
    }

    // Convert numbers to strings to get decimal places
    const decimalPlaces = (number % 1 === 0) ? 0 : number.toString().split('.')[1].length;

    return decimalPlaces <= decimal;
}

function formatAmt(decimal,number){
    if(decimal>0){
       
    }else{
        return number;
    }
}


module.exports = {
    getInscDetails,
    getLockDetails,
    getOrderLockDetails,
    getOrderLockDetailsV2,
    sanitizeBsv20Insc,
    hasDecimalIntegrity
}