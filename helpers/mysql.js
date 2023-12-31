const MysqlService = require("../services/mysql")
const _ = require('lodash');
const bsv20 = require("../consts/bsv20");

const _mysqlService = new MysqlService()

class MysqlHelper {


      async getValidationQueue(limit) {
        return new Promise((resolve, reject) => {
          _mysqlService._poolBsv20.query(
            `

            SELECT * FROM main WHERE state = -1 ORDER BY CASE WHEN height IS NOT NULL AND idx IS NOT NULL THEN height WHEN height IS NULL AND idx IS NOT NULL THEN idx ELSE createdAt END ASC, height ASC, idx ASC LIMIT ?;

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
                main WHERE type = ? AND LOWER(tick) = LOWER(?) AND state = ?
                ORDER BY
                  CASE
                      WHEN height IS NOT NULL AND idx IS NOT NULL THEN height
                      WHEN height IS NULL AND idx IS NOT NULL THEN idx
                      ELSE createdAt
                  END ASC
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
                           WHEN LOWER(tick) = LOWER(?) AND outpoint = ? THEN 1
                           ELSE 0
                        END
            WHERE LOWER(tick) = LOWER(?) AND type = 0;
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
            WHERE LOWER(tick) = LOWER(?) AND type = ? AND outpoint != ?;
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

      async getTokenSupply(tick,type,state) {
        return new Promise((resolve, reject) => {
          _mysqlService._poolBsv20.query(
            `
              SELECT SUM(amt) AS supply FROM main WHERE LOWER(tick) = LOWER(?) AND type = ? AND state = ?;

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

      async getTokenSupplyMint(tick,type,mintState) {
        return new Promise((resolve, reject) => {
          _mysqlService._poolBsv20.query(
            `
              SELECT SUM(amt) AS supply FROM main WHERE LOWER(tick) = LOWER(?) AND type = ? AND mintState = ?;

            `,
            [tick,type,mintState],
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
              SELECT txid,vout,outpoint,amt,tick,type as op,subType as subOp,insc,scriptPubKeyHex as script,state FROM main WHERE LOWER(tick) = LOWER(?) AND owner = ? AND state = ?;

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
              SELECT txid,vout,outpoint,owner,tick,insc,type as op,subType as subOp,amt,scriptPubKeyHex as script,state,reason FROM main WHERE outpoint = ?;

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

      async getTokensByAddress(address) {
        return new Promise((resolve, reject) => {
          _mysqlService._poolBsv20.query(
            `
              SELECT DISTINCT tick
              FROM main
              WHERE owner = ?;
            `,
            [address],
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

      async getBalanceByAddress(tick,address,state) {
        return new Promise((resolve, reject) => {
          _mysqlService._poolBsv20.query(
            `
              SELECT SUM(amt) AS balance FROM main WHERE LOWER(tick) = LOWER(?) AND owner = ? AND state = ?;

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

      async getBalanceByAddressAndSubType(tick,address,state,subType) {
        return new Promise((resolve, reject) => {
          _mysqlService._poolBsv20.query(
            `
              SELECT SUM(amt) AS balance FROM main WHERE LOWER(tick) = LOWER(?) AND owner = ? AND state = ? AND subType = ?;

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


      async getOrders(tick, state, limit, offset) {
        return new Promise((resolve, reject) => {
          _mysqlService._poolBsv20.query(
            `
            SELECT
              txid, vout, outpoint, owner, tick, amt, state,
              type as op, subType as subOp, orderLockInfo as orderlock,
              scriptPubKeyHex as script,
              IFNULL(price / amt, 0) as pricePerTick
            FROM main
            WHERE subType = ? AND LOWER(tick) = LOWER(?) AND state = ?
            ORDER BY pricePerTick ASC
            LIMIT ? OFFSET ?;

            `,
            [bsv20.op.subOp.list, tick, state, limit, offset],
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

      async getOrdersByAddress(address,tick,state) {
        return new Promise((resolve, reject) => {
          _mysqlService._poolBsv20.query(
            `
              SELECT txid,vout,outpoint,owner,tick,amt,state,type as op,subType as subOp,orderLockInfo as orderlock,scriptPubKeyHex as script FROM main WHERE owner = ? AND subType = ? AND LOWER(tick) = LOWER(?) AND state = ?;

            `,
            [address,bsv20.op.subOp.list,tick,state],
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
            FROM main WHERE LOWER(tick) = LOWER(?);
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
            WHERE LOWER(tick) = LOWER(?) AND type = ? AND outpoint = ?;
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

      async updateSpend(outpoint,spend) {
        return new Promise((resolve, reject) => {
          _mysqlService._poolBsv20.query(
            `
            UPDATE main
            SET spend = ?
            WHERE outpoint = ?;
            `,
            [spend,outpoint],
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

      async updateStateOneByMint(tick,type,state,mintState,outpoint,reason) {
        return new Promise((resolve, reject) => {
          _mysqlService._poolBsv20.query(
            `
            UPDATE main
            SET state = ?, mintState = ?, reason = ?
            WHERE LOWER(tick) = LOWER(?) AND type = ? AND outpoint = ?;
            `,
            [state,mintState,reason,tick,type,outpoint],
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

      async updateAmtOne(outpoint,amt) {
        return new Promise((resolve, reject) => {
          _mysqlService._poolBsv20.query(
            `
            UPDATE main
            SET amt = ? WHERE outpoint = ?;
            `,
            [amt,outpoint],
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

      async updateAmtMintOne(amt,state,mintState,outpoint) {
        return new Promise((resolve, reject) => {
          _mysqlService._poolBsv20.query(
            `
            UPDATE main
            SET amt = ?, state = ?, mintState = ? WHERE outpoint = ?;
            `,
            [amt,state,mintState,outpoint],
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


      async updateMintStateManyExcept(tick,type,state,mintStateNew,outpoint,mintStateOld,reason) {
        return new Promise((resolve, reject) => {
          _mysqlService._poolBsv20.query(
            `
            UPDATE main
            SET state = ?, mintState = ?, reason = ?
            WHERE LOWER(tick) = LOWER(?) AND type = ? AND mintState = ? AND outpoint != ?;
            `,
            [state,mintStateNew,reason,tick,type,mintStateOld,outpoint],
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

      async updateMintStateMany(tick,type,state,mintStateNew,mintStateOld,reason) {


        return new Promise((resolve, reject) => {
          _mysqlService._poolBsv20.query(
            `
            UPDATE main
            SET state = ?, mintState = ?, reason = ?
            WHERE LOWER(tick) = LOWER(?) AND type = ? AND mintState = ?;
            `,
            [state,mintStateNew,reason,tick,type,mintStateOld],
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
          const _dateTime = new Date();


          data["createdAt"] = _dateTime.getTime();

          _mysqlService._poolBsv20.query(
            `
            INSERT INTO main SET ? 
            ON DUPLICATE KEY UPDATE
              outpoint = VALUES(outpoint),
              height = IF(ISNULL(VALUES(height)), height, VALUES(height)),
              idx = IF(ISNULL(VALUES(idx)), idx, VALUES(idx));
            
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

          const _dateTime = new Date();
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
            WHERE outpoint IN (?) ;
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


