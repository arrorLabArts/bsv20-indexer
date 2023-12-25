const { Validator } = require('node-input-validator');

module.exports = {

    validatePushAlertReq: async function (data) {
        let {platform,name,type,outpoint,price,amount,txid} = data
        const v = new Validator(data, {
            platform : 'required|string',
            name : 'required|string',
            type : 'string',
            outpoint : 'string',
            price : 'required|numeric',
            amount : 'numeric',
            txid : 'required|string',


        });

        let matched = await v.check();
        if (!matched) {
            console.log(data)
            throw new Error("Invalid Request")
        } else {
            return {
                platform,name,type,outpoint,price,amount,txid
            }
        }
    },

}