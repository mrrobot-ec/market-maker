import { Router, Request, Response } from 'express';
import {GlobalMidPrice} from "../../domain/entities/GlobalMidPrice";
import { IMidPriceService } from '../../domain/interfaces/IMidPriceService';

const router = Router();

/**
 * @openapi
 * v1/global-mid-price:
 *   get:
 *     summary: Get the global mid-price
 *     description: Returns the computed global mid-price from multiple exchanges.
 *     responses:
 *       200:
 *         description: Successfully retrieved the mid-price.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 globalMidPrice:
 *                   type: number
 *       500:
 *         description: Internal server error.
 */
router.get('/global-mid-price', async (req: Request, res: Response) => {
    try {
        const midPriceService: IMidPriceService = req.app.locals.midPriceService;
        const midPrice: GlobalMidPrice = await midPriceService.calculateGlobalMidPrice();
        res
            .status(200)
            .json(midPrice);
    } catch (error) {
        res
            .status(500)
            .json({ error: error instanceof Error ? error.message : String(error) });
    }
});

/**
 * @openapi
 * v1/global-mid-price/stream:
 *   get:
 *     summary: Stream real-time updates of the global mid-price
 *     description: Returns a continuous stream of global mid-price updates from multiple exchanges using Server-Sent Events (SSE).
 *     responses:
 *       200:
 *         description: Successfully connected to the mid-price stream.
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 *               example: "data: {\"globalMidPrice\": 50000.0}\n\n"
 *       500:
 *         description: Internal server error.
 */
router.get('/global-mid-price/stream', async (req: Request, res: Response) => {
    try {
        // Set headers for SSE
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Periodic update simulation
        const midPriceService: IMidPriceService = req.app.locals.midPriceService;

        const updateMidPrice = async () => {
            const midPrice: GlobalMidPrice = await midPriceService.calculateGlobalMidPrice();
            res.write(`${JSON.stringify(midPrice)} \n\n`);
        };

        // Send an update every 5 seconds
        const interval = setInterval(updateMidPrice, 5000);

        // Handle client disconnection
        req.on('close', () => {
            clearInterval(interval);
            res.end();
        });

    } catch (error) {
        res
            .status(500)
            .json({ error: error instanceof Error ? error.message : String(error) });
    }
});

export default router;
