const { Validator } = require('node-input-validator');

module.exports = {

    validateSaveBsv20Order: async function (data) {
        let {ticker,orderlockTxid,price,amount,inscriptionTxid,scriptHashSeller,scriptHashBuyer} = data
        const v = new Validator(data, {
            ticker : 'required|string',
            orderlockTxid : 'required|string',
            price : 'required|numeric',
            amount : 'required|numeric',
            inscriptionTxid : 'required|string',
            scriptHashSeller : 'required|string',
            scriptHashBuyer : 'required|string',

        });

        let matched = await v.check();
        if (!matched) {
            console.log(data)
            throw new Error("Invalid Request")
        } else {
            return {
                ticker,orderlockTxid,price,amount,inscriptionTxid,scriptHashSeller,scriptHashBuyer
            }
        }
    },
    validateGetTokenHistoryReq: async function (data) {
        let {tick} = data
        const v = new Validator(data, {
            tick : 'required|string',

        });

        let matched = await v.check();
        if (!matched) {
            console.log(data)
            throw new Error("Invalid Request")
        } else {
            return {
                tick
            }
        }
    },
    validateGetTokenMarketHistoryReq: async function (data) {
        let {tick} = data
        const v = new Validator(data, {
            tick : 'required|string',

        });

        let matched = await v.check();
        if (!matched) {
            console.log(data)
            throw new Error("Invalid Request")
        } else {
            return {
                tick
            }
        }
    },

}