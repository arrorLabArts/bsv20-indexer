const MysqlHelper = require("./mysql");
const IndexerHelper = require("./indexer")

const _indexerHelper = new IndexerHelper();
const _mysqlHelper = new MysqlHelper();

const indexingQueue = [];
let validationRunning = false;



class JBHelper {
    _crawl = true;

    _dateTime = new Date();

     async indexTx(tx){

        if(this._crawl){
            try{
                let status = await _mysqlHelper.getIndexerStatus();
                if(status[0]["settledHeight"] <= tx["block_height"] && status[0]["settledIdx"] < tx["block_index"]){
                    indexingQueue.push(tx);
                    await this.processIndexingQueue();
                }
            }catch(e){
                console.log("something went wrong");
                console.log(e);
                this._crawl = false;
                await _mysqlHelper.updateIndexerStatus({lastErrorLog:e.toString()});
                await _mysqlHelper.updateIndexerStatus({lastErrorLogTimestamp:this._dateTime.getTime()});
                await _mysqlHelper.updateIndexerStatus({state:2});
            }
        }

    }
    async processIndexingQueue(){
        if (!validationRunning && indexingQueue.length > 0) {
            let tx = indexingQueue.shift();
            validationRunning = true;
            //await _indexerHelper.indexBsv20(tx["transaction"],tx["block_height"],tx["block_index"]);
            //await _mysqlHelper.updateIndexerStatus({"height":tx["block_height"]});
            //await _mysqlHelper.updateIndexerStatus({"index":tx["block_index"]});
            //await _mysqlHelper.updateIndexerStatus({"state":1});
            validationRunning = false;
            this.processIndexingQueue();

        }
    }

}

module.exports = JBHelper;