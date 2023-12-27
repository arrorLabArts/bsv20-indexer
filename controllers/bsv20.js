const bsv20 = require("../consts/bsv20");
const errors = require("../consts/errors");
const MysqlHelper = require("../helpers/mysql");
const { isSupportedTick } = require("../utils/platform");

const _mysqlHelper = new MysqlHelper();

const getTickInfo = async(req,res)=>{

    try{
        let tick = req.params["tick"];
        let resDeployInfo = await _mysqlHelper.getInscByTick(bsv20.op.deploy,tick,bsv20.states.valid);

        if(isSupportedTick(tick) && resDeployInfo.length>0){
            let deployInfo = JSON.parse(resDeployInfo);
            let resConfirmedSupply = await _mysqlHelper.getTokenSupply(tick,bsv20.op.mint,bsv20.states.valid);
            let resPendingSupply = await _mysqlHelper.getTokenSupply(tick,bsv20.op.mint,bsv20.states.pending);
            let resOwnersCount = await _mysqlHelper.getOwnersCountByTick(tick);
        
            let tmp = {
                tick : tick,
                lim : deployInfo[0]["lim"],
                max : deployInfo[0]["max"],
                supply : resConfirmedSupply[0]["supply"],
                pending : resPendingSupply[0]["supply"],
                accounts : resOwnersCount[0]["ownersCount"]
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

        if(isSupportedTick(tick)){
            let orders = await _mysqlHelper.getOrders(tick,bsv20.states.valid);
    
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

const getBalanceByAddress = async(req,res)=>{

    try{
        let address = req.params["address"];
        let tick = req.params["tick"];

        if(isSupportedTick(tick)){
            let balanceConfirmed = await _mysqlHelper.getBalanceByAddress(tick,address,bsv20.states.valid);
            let balancePending = await _mysqlHelper.getBalanceByAddress(tick,address,bsv20.states.pending);
            let balanceListed = await _mysqlHelper.getBalanceByAddressAndSubType(tick,address,bsv20.states.valid,bsv20.op.subOp.list);
            
            let tmp = {
                confirmed : balanceConfirmed,
                pending : balancePending,
                listed : balanceListed
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
            code : errors.api.getBalance.code,
            message : e.toString()
        }) 
    }



    
}

const getOutpoint = async(req,res)=>{

    try{
        let address = req.params["address"];
        let tick = req.params["tick"];

        if(isSupportedTick(tick)){
            let utxos = await _mysqlHelper.getUtxo(tick,address,bsv20.states.valid);
            
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
            code : errors.api.getBalance.code,
            message : e.toString()
        }) 
    }



    
}




module.exports = {
    getTickInfo,
    getMarketOrders,
    getBalanceByAddress,
    getUtxoByAddress,
    getOutpoint
}