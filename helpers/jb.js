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
let processingQueue = false;  // Flag to track if the queue is being processed

let processedTxCount = 0;

class JBHelper {
    _crawl = true;
    _dateTime = new Date();

    async indexTx(tx) {
        if (this._crawl) {
            try {
                indexingQueue.push(tx);
                if (!processingQueue) {
                    await this.processIndexingQueue();
                }
            } catch (e) {
                console.log("something went wrong for txid : ", tx["id"]);
                console.log(e);
                if (!(e instanceof OrderLockDecodeError)) {
                    this._crawl = false;
                }
                await _mysqlHelper.updateIndexerStatus({
                    "lastErrorLog": e.toString(),
                    "lastErrorLogTimestamp": this._dateTime.getTime(),
                    "state": indexer.states.stalled
                });
            }
        }
    }

    async processIndexingQueue() {
        if (indexingQueue.length > 0) {
            if (processingQueue) {
                // Queue is already being processed, return
                return;
            }

            processingQueue = true;
            let tx = indexingQueue.shift();
            try {
                // Perform indexing operations here
                await _indexerHelper.indexBsv20(tx["transaction"], tx["block_height"], tx["block_index"]);
                await _mysqlHelper.updateIndexerStatus({
                    "indexHeight": tx["block_height"],
                    "indexIdx": tx["block_index"],
                    "state": indexer.states.action
                });
                updateIndexerLog(`lastIndexTs : ${_dateTime.getTime()}`);
                processedTxCount += 1;
            } finally {
                processingQueue = false;
                await this.processIndexingQueue(); // Continue processing the queue
            }
        } else {
            indexingRunning = false;
        }
    }
}

module.exports = JBHelper;
