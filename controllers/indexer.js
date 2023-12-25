const errors = require("../consts/errors");
const MysqlHelper = require("../helpers/mysql");

const _mysqlHelper = new MysqlHelper();

const getStatus = async(req,res)=>{
     try{
        let statusInfo = await _mysqlHelper.getIndexerStatus();
        _handleResponse(res,null,{
            error : false,
            data : statusInfo[0]
        })
     }catch(e){
        _handleResponse(res,null,{
            error : true,
            code : errors.indexer.status.code,
            message : errors.indexer.status.message
        })
     }
}

module.exports = {
    getStatus
}