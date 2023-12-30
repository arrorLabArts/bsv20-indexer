const MysqlHelper = require("./mysql");
const IndexerHelper = require("./indexer");
const indexer = require("../consts/indexer");
const { updateIndexerLog } = require("../utils/misc");
const { OrderLockDecodeError } = require("../shared/data/exceptions");

const _indexerHelper = new IndexerHelper();
const _mysqlHelper = new MysqlHelper();
const _dateTime = new Date();

const indexingQueue = [];
let indexingRunning = false;

let processedTxCount = 0;



class JBHelper {
    _crawl = true;

    _dateTime = new Date();

     async indexTx(tx){

        if(this._crawl){
            try{
                indexingQueue.push(tx);
                if(!indexingRunning){
                    await this.processIndexingQueue();
                }
            }catch(e){
                console.log("something went wrong for txid : ",tx["id"]);
                console.log(e);
                if(!(e instanceof OrderLockDecodeError)){
                    this._crawl = false;
                }
                await _mysqlHelper.updateIndexerStatus({"lastErrorLog":e.toString()});
                await _mysqlHelper.updateIndexerStatus({"lastErrorLogTimestamp":this._dateTime.getTime()});
                await _mysqlHelper.updateIndexerStatus({"state":indexer.states.stalled});
            }
        }

    }
    async processIndexingQueue(){
        if (!indexingRunning && indexingQueue.length > 0) {

            let tx = indexingQueue.shift();
            await _indexerHelper.indexBsv20(tx["transaction"],tx["block_height"],tx["block_index"]);
            await _mysqlHelper.updateIndexerStatus({"indexHeight":tx["block_height"]});
            await _mysqlHelper.updateIndexerStatus({"indexIdx":tx["block_index"]});
            await _mysqlHelper.updateIndexerStatus({"state":indexer.states.action});
            updateIndexerLog(`lastIndexTs : ${_dateTime.getTime()}`);
            processedTxCount = processedTxCount+1;
            indexingRunning = false;
            this.processIndexingQueue();

        }
    }

}

module.exports = JBHelper;