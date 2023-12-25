require('dotenv').config()
const apiServer = require("./services/api");
const cluster = require('cluster');
const os = require('os');
const MysqlService = require("./services/mysql");
const JBService = require("./services/jb");

const jbService = new JBService();
const mysqlService = new MysqlService();


const runtimeConfig = {
    async init(){
        try{
            if (cluster.isMaster) {          
                const numCPUs = os.cpus().length;
              
                if(numCPUs>=2){
                    cluster.fork();
                    cluster.fork();
                }
              
            } else {
                if (cluster.worker.id === 1) {
                    await mysqlService.init("Junglebus");
                    jbService.init();
                } else {
                    await mysqlService.init("Api Server");
                    apiServer.start();
                }
            }
        }catch(e){
            // Handle initialization errors
            console.error('Cluster initialization error:', error);
            process.exit(1);
        }        

    }
}

module.exports = runtimeConfig;