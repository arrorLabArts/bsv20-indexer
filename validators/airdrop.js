const { Validator } = require('node-input-validator');

module.exports = {

    validateClaimAirdropReq: async function (data) {
        let {type,name,amount,txid,destination,sig} = data
        const v = new Validator(data, {
            type : 'required|integer',
            name : 'required|string',
            destination : 'required|string',
            amount : 'required|numeric',
            txid : 'required|string',
            sig : 'required|string',

        });

        let matched = await v.check();
        if (!matched) {
            console.log(data)
            throw new Error("Invalid Request")
        } else {
            return {
                type,name,amount,txid,destination,sig
            }
        }
    },

}