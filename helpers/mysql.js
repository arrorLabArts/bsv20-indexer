const MysqlService = require("../services/mysql")
const _ = require('lodash');
const bsv20 = require("../consts/bsv20");

const _dateTime = new Date();


const _mysqlService = new MysqlService()

class MysqlHelper {


      async getValidationQueue(limit) {
        return new Promise((resolve, reject) => {
          _mysqlService._poolBsv20.query(
            `
            SELECT
                *
            FROM
                main WHERE state = -1
                ORDER BY createdAt ASC LIMIT ?
            `,
            [limit],
            (err, result) => {
              if (err) {
                console.error(err);
                _mysqlService._poolBsv20.end();
                _mysqlService._poolBsv20 = _mysqlService.createPoolBsv20();
                reject(err);
              } else {
                resolve(result)
                
              }
            }
          );
        });
      }

      async getInscByTick(type,tick,state) {
        return new Promise((resolve, reject) => {
          _mysqlService._poolBsv20.query(
            `
            SELECT
                insc
            FROM
                main WHERE type = ? AND tick = ? AND state = ?
                ORDER BY createdAt ASC
            `,
            [type,tick,state],
            (err, result) => {
              if (err) {
                console.error(err);
                _mysqlService._poolBsv20.end();
                _mysqlService._poolBsv20 = _mysqlService.createPoolBsv20();
                reject(err);
              } else {
                resolve(result)
                
              }
            }
          );
        });
      }

      async updateDeployState(tick,outpoint) {
        return new Promise((resolve, reject) => {
          _mysqlService._poolBsv20.query(
            `
            UPDATE main
            SET state = CASE 
                           WHEN tick = ? AND outpoint = ? THEN 1
                           ELSE 0
                        END
            WHERE tick = ? AND type = 0;
            `,
            [tick,outpoint,tick],
            (err, result) => {
              if (err) {
                console.error(err);
                _mysqlService._poolBsv20.end();
                _mysqlService._poolBsv20 = _mysqlService.createPoolBsv20();
                reject(err);
              } else {
                resolve(result)
                
              }
            }
          );
        });
      }

      async updateStateExcept(tick,type,state,outpoint) {
        return new Promise((resolve, reject) => {
          _mysqlService._poolBsv20.query(
            `
            UPDATE main
            SET state = ? 
            WHERE tick = ? AND type = ? AND outpoint != ?;
            `,
            [state,tick,type,outpoint],
            (err, result) => {
              if (err) {
                console.error(err);
                _mysqlService._poolBsv20.end();
                _mysqlService._poolBsv20 = _mysqlService.createPoolBsv20();
                reject(err);
              } else {
                resolve(result)
                
              }
            }
          );
        });
      }

      async updateStateMany(outpoints,state,reason) {
        return new Promise((resolve, reject) => {
          _mysqlService._poolBsv20.query(
            `
            UPDATE main
            SET state = ?, reason = ? 
            WHERE outpoint IN (?);
            `,
            [state,reason,outpoints],
            (err, result) => {
              if (err) {
                console.error(err);
                _mysqlService._poolBsv20.end();
                _mysqlService._poolBsv20 = _mysqlService.createPoolBsv20();
                reject(err);
              } else {
                resolve(result)
                
              }
            }
          );
        });
      }

      async updateBalConfirmed(tick, address, amt, op) {
        return new Promise((resolve, reject) => {
          _mysqlService._poolBsv20.query(
            `
            INSERT INTO balance (tick, address, confirmed)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE confirmed = confirmed ${op == "inc" ? "+" : "-"} ?;
            `,
            [tick, address, amt, amt],
            (err, result) => {
              if (err) {
                console.error(err);
                _mysqlService._poolBsv20.end();
                _mysqlService._poolBsv20 = _mysqlService.createPoolBsv20();
                reject(err);
              } else {
                resolve(result);
              }
            }
          );
        });
      }

      async updateBalPending(tick, address, amt, op) {
        return new Promise((resolve, reject) => {
          _mysqlService._poolBsv20.query(
            `
            INSERT INTO balance (tick, address, pending)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE pending = pending ${op == "inc" ? "+" : "-"} ?;
            `,
            [tick, address, amt, amt],
            (err, result) => {
              if (err) {
                console.error(err);
                _mysqlService._poolBsv20.end();
                _mysqlService._poolBsv20 = _mysqlService.createPoolBsv20();
                reject(err);
              } else {
                resolve(result);
              }
            }
          );
        });
      }
      

      async getTokenSupply(tick,type,state) {
        return new Promise((resolve, reject) => {
          _mysqlService._poolBsv20.query(
            `
              SELECT SUM(amt) AS supply FROM main WHERE tick = ? AND type = ? AND state = ?;

            `,
            [tick,type,state],
            (err, result) => {
              if (err) {
                console.error(err);
                _mysqlService._poolBsv20.end();
                _mysqlService._poolBsv20 = _mysqlService.createPoolBsv20();
                reject(err);
              } else {
                resolve(result)
                
              }
            }
          );
        });
      }

      
      async getUtxosByAddress(tick,address,state) {
        return new Promise((resolve, reject) => {
          _mysqlService._poolBsv20.query(
            `
              SELECT txid,vout,outpoint,amt,tick,script FROM main WHERE tick = ? AND address = ? AND state = ?;

            `,
            [tick,address,state],
            (err, result) => {
              if (err) {
                console.error(err);
                _mysqlService._poolBsv20.end();
                _mysqlService._poolBsv20 = _mysqlService.createPoolBsv20();
                reject(err);
              } else {
                resolve(result)
                
              }
            }
          );
        });
      }

      async getTxo(outpoint) {
        return new Promise((resolve, reject) => {
          _mysqlService._poolBsv20.query(
            `
              SELECT txid,vout,outpoint,tick,insc,type,subType,amt,script,op,state FROM main WHERE outpoint = ?;

            `,
            [outpoint],
            (err, result) => {
              if (err) {
                console.error(err);
                _mysqlService._poolBsv20.end();
                _mysqlService._poolBsv20 = _mysqlService.createPoolBsv20();
                reject(err);
              } else {
                resolve(result)
                
              }
            }
          );
        });
      }

      async getBalanceByAddressAndSubType(tick,address,state,subType) {
        return new Promise((resolve, reject) => {
          _mysqlService._poolBsv20.query(
            `
              SELECT SUM(amt) AS balance FROM main WHERE tick = ? AND address = ? AND state = ? AND subType = ?;

            `,
            [tick,address,state,subType],
            (err, result) => {
              if (err) {
                console.error(err);
                _mysqlService._poolBsv20.end();
                _mysqlService._poolBsv20 = _mysqlService.createPoolBsv20();
                reject(err);
              } else {
                resolve(result)
                
              }
            }
          );
        });
      }


      async getOrders(tick,state) {
        return new Promise((resolve, reject) => {
          _mysqlService._poolBsv20.query(
            `
              SELECT * FROM main where subType = ? AND tick = ? AND state = ?;

            `,
            [bsv20.op.subOp.list,tick,state],
            (err, result) => {
              if (err) {
                console.error(err);
                _mysqlService._poolBsv20.end();
                _mysqlService._poolBsv20 = _mysqlService.createPoolBsv20();
                reject(err);
              } else {
                resolve(result)
                
              }
            }
          );
        });
      }

      async getOwnersCountByTick(tick) {
        return new Promise((resolve, reject) => {
          _mysqlService._poolBsv20.query(
            `
            SELECT COUNT(DISTINCT owner) AS ownersCount
            FROM main WHERE tick = ?;
            `,
            [tick],
            (err, result) => {
              if (err) {
                console.error(err);
                _mysqlService._poolBsv20.end();
                _mysqlService._poolBsv20 = _mysqlService.createPoolBsv20();
                reject(err);
              } else {
                resolve(result);
              }
            }
          );
        });
      }
      

      async updateStateOne(tick,type,state,outpoint,reason) {
        return new Promise((resolve, reject) => {
          _mysqlService._poolBsv20.query(
            `
            UPDATE main
            SET state = ?, reason = ?
            WHERE tick = ? AND type = ? AND outpoint = ?;
            `,
            [state,reason,tick,type,outpoint],
            (err, result) => {
              if (err) {
                console.error(err);
                _mysqlService._poolBsv20.end();
                _mysqlService._poolBsv20 = _mysqlService.createPoolBsv20();
                reject(err);
              } else {
                resolve(result)
                
              }
            }
          );
        });
      }

      async indexInscOutpoint(data) {
        return new Promise((resolve, reject) => {

          data["createdAt"] = _dateTime.getTime();

          _mysqlService._poolBsv20.query(
            `
            INSERT INTO main SET ? 
            ON DUPLICATE KEY UPDATE 
              height = VALUES(height),
              idx = VALUES(idx),
              outpoint = VALUES(outpoint);
            
            `,
            [data],
            (err, result) => {
              if (err) {
                console.error(err);
                _mysqlService._poolBsv20.end();
                _mysqlService._poolBsv20 = _mysqlService.createPoolBsv20();
                reject(err);
              } else {
                resolve(result)
                
              }
            }
          );
        });
      }

      async addTx(data) {
        return new Promise((resolve, reject) => {

          data["createdAt"] = _dateTime.getTime();

          _mysqlService._poolBsv20.query(
            `
            INSERT INTO txs SET ? ON DUPLICATE KEY UPDATE txid = VALUES(txid);
            `,
            [data],
            (err, result) => {
              if (err) {
                console.error(err);
                _mysqlService._poolBsv20.end();
                _mysqlService._poolBsv20 = _mysqlService.createPoolBsv20();
                reject(err);
              } else {
                resolve(result)
                
              }
            }
          );
        });
      }

      async getTx(txid) {
        return new Promise((resolve, reject) => {
          
          _mysqlService._poolBsv20.query(
            `
            SELECT * FROM txs WHERE txid = ?
            `,
            [txid],
            (err, result) => {
              if (err) {
                console.error(err);
                _mysqlService._poolBsv20.end();
                _mysqlService._poolBsv20 = _mysqlService.createPoolBsv20();
                reject(err);
              } else {
                resolve(result)
                
              }
            }
          );
        });
      }

      async getTotalAmtByOutpoints(outpoints,address,state) {
        return new Promise((resolve, reject) => {
          _mysqlService._poolBsv20.query(
            `
            SELECT SUM(amt) AS totalAmt
            FROM main
            WHERE outpoint IN (?) AND owner = ? AND state = ?;
            `,
            [outpoints,address,state],
            (err, result) => {
              if (err) {
                console.error(err);
                _mysqlService._poolBsv20.end();
                _mysqlService._poolBsv20 = _mysqlService.createPoolBsv20();
                reject(err);
              } else {
                // Resolve with the totalAmt, which might be null if there are no matching rows
                resolve(result);
              }
            }
          );
        });
      }
      

      async getIndexerStatus() {
        return new Promise((resolve, reject) => {
          
          _mysqlService._poolBsv20.query(
            `SELECT * FROM status WHERE id = 1`,
            (err, result) => {
              if (err) {
                console.error(err);
                _mysqlService._poolBsv20.end();
                _mysqlService._poolBsv20 = _mysqlService.createPoolBsv20();
                reject(err);
              } else {
                resolve(result)
                
              }
            }
          );
        });
      }
      async updateIndexerStatus(data) {
        return new Promise((resolve, reject) => {
          
          _mysqlService._poolBsv20.query(
            `
             UPDATE status SET ? WHERE ID = ?
            `,
            [data,1],
            (err, result) => {
              if (err) {
                console.error(err);
                _mysqlService._poolBsv20.end();
                _mysqlService._poolBsv20 = _mysqlService.createPoolBsv20();
                reject(err);
              } else {
                resolve(result)
                
              }
            }
          );
        });
      }


      




      



}


module.exports = MysqlHelper


