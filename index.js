const runtimeConfig = require("./runtimeConfig");
global.__basedir = __dirname;

async function runApp(){
    await runtimeConfig.init();
}

runApp()
