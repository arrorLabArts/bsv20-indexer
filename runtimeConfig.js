require('dotenv').config()
const apiServer = require("./services/api");
const cluster = require('cluster');
const os = require('os');
const MysqlService = require("./services/mysql");
const JBService = require("./services/jb");
const ValidationService = require("./services/bsv20_validator")

const jbService = new JBService();
const mysqlService = new MysqlService();
const validationService = new ValidationService()


const runtimeConfig = {
    async init(){
        try{
            if (cluster.isMaster) {          
                const numCPUs = os.cpus().length;
              
                if(numCPUs>=3){
                    cluster.fork();
                    cluster.fork();
                    cluster.fork();
                }
              
            } else {
                if (cluster.worker.id === 1) {
                    await mysqlService.init("Junglebus");
                    jbService.init();
                } else if(cluster.worker.id === 2) {
                    await mysqlService.init("Api Server");
                    apiServer.start();
                } else if(cluster.worker.id === 3){
                    await mysqlService.init("Validation Service");
                    await validationService.init();
                }
            }
        }catch(e){
            // Handle initialization errors
            console.error('Cluster initialization error:', e);
            process.exit(1);
        }        

    }
}

module.exports = runtimeConfig;