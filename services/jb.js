const { JungleBusClient } = require('@gorillapool/js-junglebus') ;
const MysqlHelper = require("../helpers/mysql")
const JBHelper = require("../helpers/jb")

const _mysqlHelper = new MysqlHelper();
const _jbHelper = new JBHelper();

const environment = process.env.NODE_ENV || 'local';

let jbSubHeight = process.env.JB_SUB_HEIGHT;
const jbSubId = environment == "prod"? process.env.JB_SUB_ID_PROD : process.env.JB_SUB_ID_LOCAL



class JBService {
   
  _client;  

   async init(){
     
    let resIndexerStatus = await _mysqlHelper.getIndexerStatus();
    jbSubHeight = resIndexerStatus[0]["settledHeight"]>jbSubHeight?resIndexerStatus[0]["settledHeight"]:jbSubHeight;

     this._client = new JungleBusClient(process.env.JB_BASE_URL, {
        onConnected(ctx) {
          console.log("Crawler connected");
          console.log(ctx);
        },
        onConnecting(ctx) {
          console.log("Crawler connecting..");
          console.log(ctx);
        },
        onDisconnected(ctx) {
          // add your own code here
          console.log("Crawler disconnected");
          console.log(ctx);
        },
        onError(ctx) {
          console.log("Crawling error");
          console.error(ctx);
        }
      });

      this.initSubBsv20()
   }


   initSubBsv20(){
      console.log(`Initializing JB Sub - id : ${jbSubId} at height ${jbSubHeight} `)
      this._client.Subscribe(
        jbSubId,
        jbSubHeight,
        async function onPublish(tx) {
          console.log("tx found");
          await _jbHelper.indexTx(tx);
      
        },
        function onStatus(ctx) {

        },
        function onError(ctx) {
          console.log(ctx);
        },
        async function onMempool(tx) {
          console.log("mempool tx found");
          await _jbHelper.indexTx(tx);

        });
   }

}

module.exports = JBService;