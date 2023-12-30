const IndexerHelper = require("../helpers/indexer");
const indexer = require("../consts/indexer");
const { updateIndexerLog } = require("../utils/misc");

const _indexerHelper = new IndexerHelper();

const indexingQueue = [];
let indexingRunning = false;

const _dateTime = new Date();


class FsMempool {
    async indexTx(txRaw){

        try{
            indexingQueue.push(txRaw);
            if(!indexingRunning){
                await this.processIndexingQueue();
            }
        }catch(e){
            console.log(e);
        }
        

    } 

    async processIndexingQueue(){
        if (!indexingRunning && indexingQueue.length > 0) {
            let tx = indexingQueue.shift();
            await _indexerHelper.indexBsv20(tx,null,null);
            updateIndexerLog(`ts : ${_dateTime.getTime()}`);
            indexingRunning = false;
            this.processIndexingQueue();

        }
    }
}

module.exports = FsMempool;