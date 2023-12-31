module.exports = Object.freeze({
    states : {
        "pending" : -1,
        "invalid" : 0,
        "valid" : 1,
        "spent" : 2,
        "burned" : 3,
        "listed" : 4,
        "nullOwner" : 5
    },
    mintStates : {
        "pending" : -1,
        "valid" : 1,
        "invalid" : 0
    },
    op : {
       deploy : 0,
       mint : 1,
       transfer : 2,
       subOp : {
          list : 1
       }
    },
    

})