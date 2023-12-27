module.exports = Object.freeze({
    internalServerError : {
        code : 500,
        message : "INTERNAL SERVER ERROR"
    },
    indexer : {
        status : {
            code : 10,
            message : "ERROR READING STATUS"
        }

    },
    api : {
        getTokenInfo : {
            code : 20
        },
        getMarketOrders : {
            code : 21
        },
        getBalance : {
            code : 22
        }
    },
    bsv20:{
        insc : {
            format : {
                message : "INVALID FORMAT"
            }
        },
        mint : {
            supplyOverflow : {
                message : "SUPPLY OVERFLOW"
            },
            nullDeploy : {
                message : "TICK DOESN'T EXIST"
            }
        },
        deploy : {
            reduntantDeploy : {
                message : "REDUNDANT DEPLOY"
            }
        },
        transfer : {
            lowerInputAmt: {
                message : "INPUT AMT LOWER THAN OUTPUT AMT"
            }
        },
        list : {

        }
    }
    
})