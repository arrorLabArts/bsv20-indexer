var express = require('express');
var router = express.Router();
const { getStatus } = require('../controllers/api');



/**
 * @swagger
 * components:
 *   schemas:   
 *      Status:
 *        type: object
 *        properties:
 *          indexHeight:
 *              type: number
 *          indexIdx:
 *              type: number
 *          settledHeight:
 *              type: number
 *          settledIdx:
 *              type: number
 *          status:
 *              type: number
 *          lastErrorLog:
 *              type: string
 *          lastErrorLogTimestamp:
 *              type: string
 */


/**
 * @swagger
 * /api/indexer/status:
 *   get:
 *     summary: Get indexer status
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *          application/json:
 *              schema:
 *                  $ref: '#/components/schemas/Status'
 * 
 */
router.get('/status', getStatus);



module.exports = router;
