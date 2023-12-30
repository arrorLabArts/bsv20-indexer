const SupabaseSservice = require("../services/supabase");

const _supabseService = new SupabaseSservice();

class SupabaseHelper {
    _date = new Date();
    async writeTx(txid,rawHex){
         let timestamp = this._date.getTime();
         let payload = {
            "txid":txid,
            "rawHex":rawHex,
            "createdAt":timestamp
         }
         await _supabseService.client.from(process.env.SB_TAB_TXS).insert(payload);
    }
    async readTx(txid){
         let res = await _supabseService.client.from(process.env.SB_TAB_TXS).select().eq("txid",txid).eq("state",1);
         return res;
    }
}

module.exports = SupabaseHelper;