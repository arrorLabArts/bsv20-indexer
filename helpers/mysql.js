const MysqlService = require("../services/mysql")
const { bitcoinToSatoshis, calculatePercentageChange, satoshisToBitcoin } = require("../utils/misc")
const _ = require('lodash');

const _dateTime = new Date();


const _mysqlService = new MysqlService()

class MysqlHelper {


      // lrc 20 operations

      async getMintInfoByDeployId(id) {
        return new Promise((resolve, reject) => {
          _mysqlService._poolBsv20.query(
            `
            SELECT
                tick,
                deployId,
                SUM(amt) AS total_amt,
                SUM(burn) AS total_burn
            FROM
                mints WHERE deployId = ? AND state = ?
                ORDER BY createdAt DESC
            GROUP BY
                tick, deployId
            `,
            [id,1],
            (err, result) => {
              if (err) {
                console.error(err);
                _mysqlService._poolBsv20.end();
                _mysqlService._poolBsv20 = _mysqlService.createConnectionBsv20();
                reject(err);
              } else {
                resolve(result)
                
              }
            }
          );
        });
      }


      async getDeployInscBsv20(outpoint) {
        return new Promise((resolve, reject) => {
          _mysqlService._poolBsv20.query(
            `
            SELECT *
            FROM deploys WHERE outpoint = ? AND state = ?
            ORDER BY createdAt DESC
            `,
            [outpoint,1],
            (err, result) => {
              if (err) {
                console.error(err);
                _mysqlService._poolBsv20.end();
                _mysqlService._poolBsv20 = _mysqlService.createConnectionBsv20();
                reject(err);
              } else {
                resolve(result)
                
              }
            }
          );
        });
      }

      async getMintCountByTick(tick) {
        return new Promise((resolve, reject) => {
          _mysqlService._poolBsv20.query(
            `
            SELECT COUNT(id) 
            FROM mints WHERE tick = ? AND state = ?
            ORDER BY createdAt DESC
            `,
            [tick,1],
            (err, result) => {
              if (err) {
                console.error(err);
                _mysqlService._poolBsv20.end();
                _mysqlService._poolBsv20 = _mysqlService.createConnectionBsv20();
                reject(err);
              } else {
                resolve(result)
                
              }
            }
          );
        });
      }

      async addDeployInsc(data) {
        return new Promise((resolve, reject) => {

          data["createdAt"] = _dateTime.getTime();

          _mysqlService._poolBsv20.query(
            `
            INSERT INTO deploys SET ? ON DUPLICATE KEY UPDATE outpoint = outpoint
            `,
            [data],
            (err, result) => {
              if (err) {
                console.error(err);
                _mysqlService._poolBsv20.end();
                _mysqlService._poolBsv20 = _mysqlService.createConnectionBsv20();
                reject(err);
              } else {
                resolve(result)
                
              }
            }
          );
        });
      }

      async indexTx(data) {
        return new Promise((resolve, reject) => {

          data["createdAt"] = _dateTime.getTime();

          _mysqlService._poolBsv20.query(
            `
            INSERT INTO indexed SET ?`,
            [data],
            (err, result) => {
              if (err) {
                console.error(err);
                _mysqlService._poolBsv20.end();
                _mysqlService._poolBsv20 = _mysqlService.createConnectionBsv20();
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
            INSERT INTO txs SET ? ON DUPLICATE KEY UPDATE outpoint = outpoint
            `,
            [data],
            (err, result) => {
              if (err) {
                console.error(err);
                _mysqlService._poolBsv20.end();
                _mysqlService._poolBsv20 = _mysqlService.createConnectionBsv20();
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
                _mysqlService._poolBsv20 = _mysqlService.createConnectionBsv20();
                reject(err);
              } else {
                resolve(result)
                
              }
            }
          );
        });
      }

      async getIndexerStatus(txid) {
        return new Promise((resolve, reject) => {
          
          _mysqlService._poolBsv20.query(
            `SELECT * FROM status WHERE id = 1`,
            [txid],
            (err, result) => {
              if (err) {
                console.error(err);
                _mysqlService._poolBsv20.end();
                _mysqlService._poolBsv20 = _mysqlService.createConnectionBsv20();
                reject(err);
              } else {
                resolve(result)
                
              }
            }
          );
        });
      }
      async updateIndexerStatus(data,id) {
        return new Promise((resolve, reject) => {
          
          _mysqlService._poolBsv20.query(
            `
             UPDATE indexed SET ? WHERE ID=?
            `,
            [data,id],
            (err, result) => {
              if (err) {
                console.error(err);
                _mysqlService._poolBsv20.end();
                _mysqlService._poolBsv20 = _mysqlService.createConnectionBsv20();
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


