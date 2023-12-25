var express = require('express');
var router = express.Router();
// const {  } = require('../controllers/bsv20');



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
 *          tick:
 *              type: string
 *          amt:
 *              type: number
 *          outpoint:
 *              type: string
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
router.get('/market/:tick', (req, res) => {
    const tick = req.params["tick"];
    const sort = req.query["sort"];
    const limit = req.query["limit"];
    const offset = req.query["offset"];
    const valid = req.query["valid"];
    res.send("success");
});

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
router.get('/tick/:tick', (req, res) => {
    const tick = req.params["tick"];
    res.send("success");
});

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
router.get('/address/:address/balance/:tick', (req, res) => {
    const address = req.params["address"];
    const tick = req.params["tick"];
    res.send("success");
});

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
router.get('/address/:address/utxos/:tick', (req, res) => {
    const address = req.params["address"];
    const tick = req.params["tick"];
    res.send("success");
});

module.exports = router;
