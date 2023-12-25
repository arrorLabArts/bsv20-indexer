const { indexOf } = require("lodash");
const { supportedTickBsv20 } = require("../consts/platform");

function isSupportedTick(tick){
    let i = indexOf(supportedTickBsv20,tick.toLowerCase());
    return i!=-1;
}

module.exports = {
    isSupportedTick
}