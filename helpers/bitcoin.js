const {BSM, P2PKHAddress, Signature} = require("bsv-wasm")

class BitcoinHelper {
    isValidSig(message,sig,address){
       let messageBuffer = Buffer.from(message,"utf-8");
       let sigBytes = Buffer.from(sig,"base64");
       let p2pkhAddress = P2PKHAddress.from_string(address);
       let signature = Signature.from_compact_bytes(sigBytes);
       return BSM.is_valid_message(messageBuffer,signature,p2pkhAddress);
    }
}

module.exports = BitcoinHelper;