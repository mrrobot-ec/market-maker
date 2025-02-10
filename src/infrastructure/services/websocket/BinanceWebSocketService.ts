import axios from 'axios';
import winston from 'winston';
import { WebSocket } from 'ws';
import { LoggerSymbol } from '../../../domain/SymbolsForDI';
import { injectable, postConstruct, inject } from 'inversify';
import { OrderBook } from '../../../domain/entities/OrderBook';
import { IExchangeService } from '../../../domain/interfaces/IExchangeService';
import { AskEntry, BidEntry, BinanceDataType } from '../../../domain/entities/Binance';

@injectable()
export class BinanceWebSocketService implements IExchangeService {

    private ws: WebSocket | null;
    private orderBook: OrderBook = { asks: [], bids: [] };

    constructor(private readonly symbol: string,
        @inject(LoggerSymbol) private readonly logger: winston.Logger,
        @inject('WebSocket') private readonly createWebSocket: () => WebSocket) {
        this.ws = null;
    }

    @postConstruct()
    public async initialize(): Promise<void> {
        this.ws = this.createWebSocket();
        await this.initializeSnapshot();
        this.initializeWebSocket();
    }

    async fetchOrderBook(): Promise<OrderBook> {
        return { ...this.orderBook };
    }

    private async initializeSnapshot() {
        try {
            const response = await axios.get('https://api.binance.us/api/v3/depth', {
                params: { symbol: this.symbol.toUpperCase(), limit: 10 },
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                    'Accept': 'application/json'
                }
            });
            const data = response.data;
            this.logger.info('FIRST SNAPSHOT',data)
            this.orderBook = {
                bids: data.bids.map(([price, volume]: BidEntry) => ({
                    price: parseFloat(price),
                    volume: parseFloat(volume),
                })),
                asks: data.asks.map(([price, volume]: AskEntry) => ({
                    price: parseFloat(price),
                    volume: parseFloat(volume),
                })),
            };

            this.logger.info(`Snapshot initialized for ${this.symbol}`);
        } catch (error) {
            this.logger.error('Error initializing snapshot:', error);
        }
    }

    private initializeWebSocket() {
        this.ws = this.createWebSocket();
        this.ws.on('message', (message: Buffer) => this.handleMessage(message));
        this.ws.on('error', (error) => this.logger.error('WebSocket error:', error));
        this.ws.on('close', () => this.logger.info('WebSocket closed.'));
    }

    private handleMessage(message: Buffer): void {
        try {
            const data: BinanceDataType = JSON.parse(message.toString());

            if (!data.u || !data.b || !data.a) return;

            this.orderBook = {
                bids: data.b.map(([price, volume]) => ({
                    price: parseFloat(price),
                    volume: parseFloat(volume),
                })),
                asks: data.a.map(([price, volume]) => ({
                    price: parseFloat(price),
                    volume: parseFloat(volume),
                })),
            };
            this.logger.info(`Snapshot updated for ${this.symbol} ${JSON.stringify(this.orderBook, null, 2)}`);
        } catch (error) {
            this.logger.error('Failed to handle message:', error);
        }
    }
}