var express = require('express');
var router = express.Router();
const { getTickInfo, getMarketOrders, getBalanceByAddress, getUtxoByAddress, getOutpoint  } = require('../controllers/bsv20');



/**
 * @swagger
 * components:
 *   schemas:   
 *      Order:
 *        type: object
 *        properties:
 *          tick:
 *              type: string
 *          owner:
 *              type: string
 *          txid:
 *              type: string
 *          outpoint:
 *              type: string
 *          amt:
 *              type: number
 *          price:
 *              type: number
 *          pricePerToken:
 *              type: number
 *          status:
 *              type: number
 *          payout:
 *              type: string
 *          script:
 *              type: string
 *      Token:
 *        type: object
 *        properties:
 *          tick:
 *              type: string
 *          max:
 *              type: number
 *          lim:
 *              type: number
 *          supply:
 *              type: number
 *          pctMinted:
 *              type: number
 *          available:
 *              type: number
 *          accounts:
 *              type: number
 *          outpoint:
 *              type: string
 *      TokenBalance:
 *        type: object
 *        properties:
 *          tick:
 *              type: string
 *          all:
 *              type: number
 *          pending:
 *              type: number
 *          listed:
 *              type: number
 *          available:
 *              type: number
 *      TokenUtxo:
 *        type: object
 *        properties:
 *          txid:
 *              type: string
 *          vout:
 *              type : number
 *          outpoint:
 *              type: string
 *          tick:
 *              type: string
 *          amt:
 *              type: number
 *          script:
 *              type: string
 *          op:
 *              type: string
 *          state:
 *              type: number
 *      InscTxo:
 *        type: object
 *        properties:
 *          txid:
 *              type: string
 *          vout:
 *              type : number
 *          outpoint:
 *              type: string
 *          tick:
 *              type: string
 *          insc:
 *              type : object
 *          type:
 *              type : number
 *          subType:
 *              type : number
 *          amt:
 *              type: number
 *          script:
 *              type: string
 *          op:
 *              type: string
 *          state:
 *              type: number
 */


/**
 * @swagger
 * /api/bsv20/market/{tick}:
 *   get:
 *     summary: Get market orders of a token
 *     parameters:
 *       - in: path
 *         name: tick
 *         required: true
 *         description: The ticker symbol
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort
 *         description: Sort parameter
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         description: Limit parameter
 *         schema:
 *           type: integer
 *       - in: query
 *         name: offset
 *         description: Offset parameter
 *         schema:
 *           type: integer
 *       - in: query
 *         name: valid
 *         description: Valid parameter
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *          application/json:
 *              schema:
 *                  $ref: '#/components/schemas/Order'
 * 
 */
router.get('/market/:tick', getMarketOrders);

/**
 * @swagger
 * /api/bsv20/tick/{tick}:
 *   get:
 *     summary: Get tick data
 *     parameters:
 *       - in: path
 *         name: tick
 *         required: true
 *         description: The ticker symbol
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *          application/json:
 *              schema:
 *                  $ref: '#/components/schemas/Token'
 * 
 */
router.get('/tick/:tick',getTickInfo);

/**
 * @swagger
 * /api/bsv20/address/{address}/balance/{tick}:
 *   get:
 *     summary: Get balance data for a specific address and tick
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         description: The address
 *         schema:
 *           type: string
 *       - in: path
 *         name: tick
 *         required: true
 *         description: The ticker symbol
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *          application/json:
 *              schema:
 *                  $ref: '#/components/schemas/TokenBalance'
 */
router.get('/address/:address/balance/:tick', getBalanceByAddress);

/**
 * @swagger
 * /api/bsv20/address/{address}/utxos/{tick}:
 *   get:
 *     summary: Get UTXOs for a specific address and tick
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         description: The address
 *         schema:
 *           type: string
 *       - in: path
 *         name: tick
 *         required: true
 *         description: The ticker symbol
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *          application/json:
 *              schema:
 *                  $ref: '#/components/schemas/TokenUtxo'
 */
router.get('/address/:address/utxos/:tick', getUtxoByAddress);

/**
 * @swagger
 * /api/bsv20/outpoint/{outpoint}:
 *   get:
 *     summary: Get information for an outpoint
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         description: The address
 *         schema:
 *           type: string
 *       - in: path
 *         name: tick
 *         required: true
 *         description: The ticker symbol
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *          application/json:
 *              schema:
 *                  $ref: '#/components/schemas/InscTxo'
 */
router.get('/outpoint/:outpoint', getOutpoint);

module.exports = router;
