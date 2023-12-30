const { wocApiBaseUrl, bitailsApiBaseUrl } = require("../consts/api");
const HttpService = require("../services/http");

const _httpService = new HttpService()

class TransactionHelper{
    
    async getRawTx(txid){

        let txRaw;

        try{
            txRaw = await _httpService.getReqText(`${wocApiBaseUrl}/tx/${txid}/hex`);
        }catch(e){
            txRaw = await _httpService.getReqText(`${bitailsApiBaseUrl}/download/tx/${txid}/hex`);
        }finally{
            return txRaw;
        }

    }
}

module.exports = TransactionHelper;