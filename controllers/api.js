const bsv20 = require("../consts/bsv20");
const errors = require("../consts/errors");
const MysqlHelper = require("../helpers/mysql");
const WocHelper = require("../helpers/woc")
const FsMempoolService = require("../services/fs_mempool")
const { isSupportedTick } = require("../utils/platform");
const { sanitizeBsv20Insc } = require("../utils/bsv20");

const _mysqlHelper = new MysqlHelper();
const _fsMempoolService = new FsMempoolService();
const _wocHelper = new WocHelper();

const getTickInfo = async(req,res)=>{

    try{
        let tick = req.params["tick"];
        let resDeployInfo = await _mysqlHelper.getInscByTick(bsv20.op.deploy,tick,bsv20.states.valid);
        

        if(isSupportedTick(tick) && resDeployInfo.length>0){
            let deployInfo = JSON.parse(resDeployInfo[0]["insc"]);
            let deplayInfoSantized = sanitizeBsv20Insc(deployInfo);
            let resConfirmedSupply = await _mysqlHelper.getTokenSupply(tick,bsv20.op.mint,bsv20.states.valid);
            let resPendingSupply = await _mysqlHelper.getTokenSupply(tick,bsv20.op.mint,bsv20.states.pending);
            let resOwnersCount = await _mysqlHelper.getOwnersCountByTick(tick);
        
            let tmp = {
                tick : tick,
                lim : deplayInfoSantized["lim"],
                max : deplayInfoSantized["max"],
                supply : resConfirmedSupply[0]["supply"]||0,
                pending : resPendingSupply[0]["supply"]||0,
                accounts : resOwnersCount[0]["ownersCount"]||0
            }
    
            _handleResponse(res,null,{
                error : false,
                data : tmp
            }) 
        }else{
            _handleResponse(res,null,{
                error : false,
                data : []
            })  
        }

    }catch(e){
        _handleResponse(res,null,{
            error : true,
            code : errors.api.getTokenInfo.code,
            message : e.toString()
        }) 
    }



    
}

const getMarketOrders = async(req,res)=>{

    try{
        let tick = req.params["tick"];
        let limit = req.query["limit"]||100;
        let offset = req.query["offset"]||0;

        if(isSupportedTick(tick)){
            let orders = await _mysqlHelper.getOrders(tick,bsv20.states.valid,limit,offset);
    
            _handleResponse(res,null,{
                error : false,
                data : orders
            }) 
        }else{
            _handleResponse(res,null,{
                error : false,
                data : []
            })  
        }

    }catch(e){
        _handleResponse(res,null,{
            error : true,
            code : errors.api.getMarketOrders.code,
            message : e.toString()
        }) 
    }
}

const getMarketOrdersByAddress = async(req,res)=>{

    try{
        let address = req.params["address"];
        let tick = req.params["tick"];

        if(isSupportedTick(tick)){
            let orders = await _mysqlHelper.getOrdersByAddress(address,tick,bsv20.states.valid);
    
            _handleResponse(res,null,{
                error : false,
                data : orders
            }) 
        }else{
            _handleResponse(res,null,{
                error : false,
                data : []
            })  
        }

    }catch(e){
        _handleResponse(res,null,{
            error : true,
            code : errors.api.getMarketOrders.code,
            message : e.toString()
        }) 
    }
}

const getBalanceByAddressAndTick = async(req,res)=>{

    try{
        let address = req.params["address"];
        let tick = req.params["tick"];

        if(isSupportedTick(tick)){
            let balanceConfirmed = await _mysqlHelper.getBalanceByAddress(tick,address,bsv20.states.valid);
            let balancePending = await _mysqlHelper.getBalanceByAddress(tick,address,bsv20.states.pending);
            let balanceListed = await _mysqlHelper.getBalanceByAddressAndSubType(tick,address,bsv20.states.valid,bsv20.op.subOp.list);
            
            let tmp = {
                confirmed : balanceConfirmed[0]["balance"]||0,
                pending : balancePending[0]["balance"]||0,
                listed : balanceListed[0]["balance"]||0
            }
            _handleResponse(res,null,{
                error : false,
                data : tmp
            }) 
        }else{
            _handleResponse(res,null,{
                error : false,
                data : []
            })  
        }

    }catch(e){
        _handleResponse(res,null,{
            error : true,
            code : errors.api.getBalance.code,
            message : e.toString()
        }) 
    }



    
}

const getBalanceByAddress = async(req,res)=>{

    try{
        let address = req.params["address"];
        let resTokens = await _mysqlHelper.getTokensByAddress(address)
        let balanaces = [];

        let i;
        for(i=0;i<resTokens.length;i++){
            if(isSupportedTick(resTokens[i]["tick"])){
                let balanceConfirmed = await _mysqlHelper.getBalanceByAddress(resTokens[i]["tick"],address,bsv20.states.valid);
                console.log(balanceConfirmed);
                let balancePending = await _mysqlHelper.getBalanceByAddress(resTokens[i]["tick"],address,bsv20.states.pending);
                let balanceListed = await _mysqlHelper.getBalanceByAddressAndSubType(resTokens[i]["tick"],address,bsv20.states.valid,bsv20.op.subOp.list);
                
                let tmp = {
                    tick : resTokens[i]["tick"],
                    confirmed : balanceConfirmed[0]["balance"]||0,
                    pending : balancePending[0]["balance"]||0,
                    listed : balanceListed[0]["balance"]||0
                }
                balanaces.push(tmp);
            }
        }

        _handleResponse(res,null,{
            error : false,
            data : balanaces
        })  

    }catch(e){
        _handleResponse(res,null,{
            error : true,
            code : errors.api.getBalance.code,
            message : e.toString()
        }) 
    }



    
}

const getUtxoByAddress = async(req,res)=>{

    try{
        let address = req.params["address"];
        let tick = req.params["tick"];

        if(isSupportedTick(tick)){
            let utxos = await _mysqlHelper.getUtxosByAddress(tick,address,bsv20.states.valid);
            
            _handleResponse(res,null,{
                error : false,
                data : utxos
            }) 
        }else{
            _handleResponse(res,null,{
                error : false,
                data : []
            })  
        }

    }catch(e){
        _handleResponse(res,null,{
            error : true,
            code : errors.api.getTxos.code,
            message : e.toString()
        }) 
    }



    
}

const getOutpoint = async(req,res)=>{

    try{
        let outpoint = req.params["outpoint"];

        let utxos = await _mysqlHelper.getTxo(outpoint);
        
        _handleResponse(res,null,{
            error : false,
            data : utxos
        }) 
        
    }catch(e){
        _handleResponse(res,null,{
            error : true,
            code : errors.api.getOutpoint.code,
            message : e.toString()
        }) 
    }



    
}

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
           message : e.toString()
       })
    }
}

const submitTx = async(req,res)=>{
    try{
        let txid = req.params["txid"];
        let txHex = await _wocHelper.getRawTx(txid);
        await _fsMempoolService.indexTx(txHex);
       _handleResponse(res,null,{
           error : false,
       })
    }catch(e){
       _handleResponse(res,null,{
           error : true,
           code : errors.api.submitTx.code,
           message : e.toString()
       })
    }
}




module.exports = {
    getTickInfo,
    getMarketOrders,
    getMarketOrdersByAddress,
    getBalanceByAddress,
    getBalanceByAddressAndTick,
    getUtxoByAddress,
    getOutpoint,
    getStatus,
    submitTx

}