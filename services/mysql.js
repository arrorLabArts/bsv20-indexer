const mysql = require('mysql');
const util = require('util');


class MySqlService {

  constructor(){
     if(MySqlService.instance){
      return MySqlService.instance;
     }
     this._poolBsv20 = null;
     MySqlService.instance = this;
     return this;
  }

  async init(serviceName) {
    await this.createPoolBsv20();
    await this.createTablesBsv20();
    console.log(`Database service initiated by ${serviceName}`);
  }


  async createPoolBsv20() {
    const poolConfig = {
      host: '127.0.0.1',
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_ROOT_PASSW,
      database: process.env.MYSQL_DB_BSV20,
      waitForConnections: true,
      connectionLimit: process.env.MYSQL_POOL_CONN_MAX, // Adjust according to your application needs
      queueLimit: 0, // No limit on the connection queue
    };

    this._poolBsv20 = mysql.createPool(poolConfig);

  }


  async createTablesBsv20() {

    const query0 = `
        CREATE TABLE IF NOT EXISTS txs (
            id BIGINT AUTO_INCREMENT PRIMARY KEY,
            txid TEXT NOT NULL,
            rawHex TEXT NOT NULL,
            state INT DEFAULT 1,
            createdAt BIGINT NOT NULL,
            UNIQUE KEY unique_txid (txid(255))
        );
    `;
    
    const query1 = `
        CREATE TABLE IF NOT EXISTS main (
           id BIGINT AUTO_INCREMENT PRIMARY KEY,
           txid TEXT NOT NULL,
           vout INT NOT NULL,
           origin TEXT NOT NULL,
           outpoint TEXT NOT NULL,
           height BIGINT NULL,
           idx BIGINT NULL,
           owner TEXT NOT NULL,
           tick TEXT NOT NULL,
           state INT DEFAULT -1,
           type INT NOT NULL,
           subType INT DEFAULT 0,
           orderLockInfo TEXT NULL,
           scriptPubKeyHex TEXT NOT NULL,
           insc TEXT NOT NULL,
           spend TEXT NULL,
           reason TEXT NULL,
           createdAt BIGINT NOT NULL,
           UNIQUE KEY unique_outpoint (outpoint(255))
        );
    `;

    // const query2 = `
    //     CREATE TABLE IF NOT EXISTS balance (
    //         id BIGINT AUTO_INCREMENT PRIMARY KEY,
    //         address TEXT NOT NULL,
    //         tick TEXT NOT NULL,
    //         pending BIGINT DEFAULT 0,
    //         confirmed BIGINT DEFAULT 0,
    //         updatedAt BIGINT DEFAULT 0,
    //         UNIQUE KEY unique_tick_address (tick, address)
    //     );
    // `;
    const query3 = `
        CREATE TABLE IF NOT EXISTS status (
            id BIGINT AUTO_INCREMENT PRIMARY KEY,
            indexHeight BIGINT DEFAULT 0,
            indexIdx BIGINT DEFAULT 0,
            settledHeight BIGINT DEFAULT 0,
            settledIdx BIGINT DEFAULT 0,
            state INT DEFAULT 0,
            lastErrorLog TEXT NULL,
            lastErrorLogTimestamp BIGINT DEFAULT 0
        );
    `;





    const query0Async = util.promisify(this._poolBsv20.query).bind(this._poolBsv20);
    const query1Async = util.promisify(this._poolBsv20.query).bind(this._poolBsv20);
    //const query2Async = util.promisify(this._poolBsv20.query).bind(this._poolBsv20);
    const query3Async = util.promisify(this._poolBsv20.query).bind(this._poolBsv20);


    return Promise.all([

      query0Async(query0).catch(err => {
        console.error('Error creating table "txs":', err);
      }),
      query1Async(query1).catch(err => {
        console.error('Error creating table "main":', err);
      }),
      // query2Async(query2).catch(err => {
      //   console.error('Error creating table "balance":', err);
      // }),
      query3Async(query3).catch(err => {
        console.error('Error creating table "status":', err);
      }),

    ]);
  }


}

module.exports = MySqlService;



