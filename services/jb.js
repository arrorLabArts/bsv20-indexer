const { JungleBusClient } = require('@gorillapool/js-junglebus') ;

const JBHelper = require("../helpers/jb")
const _jbHelper = new JBHelper();





class JBService {
   
  _client;  

   init(){
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
      this._client.Subscribe(
        process.env.JB_SUB_ID,
        process.env.JB_SUB_HEIGHT,
        async function onPublish(tx) {
          await _jbHelper.indexTx(tx);
      
        },
        function onStatus(ctx) {

        },
        function onError(ctx) {
          console.log(ctx);
        },
        async function onMempool(tx) {
          console.log("found tx : ",tx["id"]);
          await _jbHelper.indexTx(tx);
          console.log("mempool tx : ",tx["id"])

        });
   }

}

module.exports = JBService;