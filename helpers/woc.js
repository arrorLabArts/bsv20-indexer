const { wocApiBaseUrl } = require("../consts/api");
const HttpService = require("../services/http");

const _httpService = new HttpService()

class WocHelper{
    async getRawTx(txid){
        let res = await _httpService.getReqText(`${wocApiBaseUrl}/tx/${txid}/hex`);
        return res;
    } 
}

module.exports = WocHelper