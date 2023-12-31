const mysql = require('mysql');
const util = require('util');

class MySqlService {

  constructor() {
    if (MySqlService.instance) {
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
    const createTableQueries = [
      `
      CREATE TABLE IF NOT EXISTS txs (
          id BIGINT AUTO_INCREMENT PRIMARY KEY,
          txid TEXT NOT NULL,
          rawHex LONGBLOB NOT NULL,
          state INT DEFAULT 1,
          createdAt BIGINT NOT NULL,
          UNIQUE KEY unique_txid (txid(255))
      );
      `,
      `
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
         amt DOUBLE DEFAULT 0,
         price BIGINT DEFAULT 0,
         state INT DEFAULT -1,
         mintState INT NULL,
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
      `,
      // Add other table creation queries as needed
      `
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
      `,
    ];

    const insertStatusQuery = `
      INSERT INTO status (indexHeight, indexIdx, settledHeight, settledIdx, state, lastErrorLog, lastErrorLogTimestamp)
      SELECT 
          0 AS indexHeight,
          0 AS indexIdx,
          0 AS settledHeight,
          0 AS settledIdx,
          0 AS state,
          NULL AS lastErrorLog,
          0 AS lastErrorLogTimestamp
      FROM dual
      WHERE NOT EXISTS (SELECT 1 FROM status);
    `;

    // const createIndexQueries = `
    
    //     CREATE INDEX IF NOT EXISTS idx_state ON main (state);
    //     CREATE INDEX IF NOT EXISTS idx_type_tick_state ON main (type, tick, state);
    //     CREATE INDEX IF NOT EXISTS idx_tick_outpoint ON main (tick, outpoint);
    //     CREATE INDEX IF NOT EXISTS idx_tick_type_outpoint ON main (tick, type, outpoint);
    //     CREATE INDEX IF NOT EXISTS idx_outpoint ON main (outpoint);
    //     CREATE INDEX IF NOT EXISTS idx_tick_type_state ON main (tick, type, state);
    //     CREATE INDEX IF NOT EXISTS idx_tick_type_state_mintState ON main (tick, type, state, mintState);
    //     CREATE INDEX IF NOT EXISTS idx_tick_owner_state ON main (tick, owner, state);
    //     CREATE INDEX IF NOT EXISTS idx_outpoint ON main (outpoint);
    //     CREATE INDEX IF NOT EXISTS idx_owner ON main (owner);
    //     CREATE INDEX IF NOT EXISTS idx_tick_address_state ON main (tick, address, state);
    //     CREATE INDEX IF NOT EXISTS idx_tick_address_state_subtype ON main (tick, address, state, subType);
    //     CREATE INDEX IF NOT EXISTS idx_subtype_tick_state ON main (subType, tick, state);
    //     CREATE INDEX IF NOT EXISTS idx_tick ON main (tick);
    //     CREATE INDEX IF NOT EXISTS idx_tick_type_outpoint ON main (tick, type, outpoint);
    //     CREATE INDEX IF NOT EXISTS idx_tick_type_outpoint_mintState ON main (tick, type, outpoint, mintState);
    //     CREATE INDEX IF NOT EXISTS idx_txid ON txs (txid);
            
    // `;

    const executeQueryAsync = util.promisify(this._poolBsv20.query).bind(this._poolBsv20);

    // Execute table creation queries
    const createTableResults = await Promise.all(createTableQueries.map(query => executeQueryAsync(query).catch(err => {
      console.error(`Error creating table: ${err}`);
    })));

    // Execute the insert status query
    await executeQueryAsync(insertStatusQuery).catch(err => {
      console.error(`Error initializing table "status": ${err}`);
    });

    // Execute index creation queries
    // await executeQueryAsync(createIndexQueries).catch(err => {
    //   console.error(`Error creating indexes: ${err}`);
    // });

    return createTableResults;
  }
}

module.exports = MySqlService;
