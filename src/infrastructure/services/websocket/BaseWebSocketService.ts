import winston from "winston";
import { WebSocket } from 'ws';
import {injectable} from "inversify";

import {IExchangeService} from "../../../domain/interfaces/IExchangeService";
import {OrderBook} from "../../../domain/entities/OrderBook";

@injectable()
export abstract class BaseWebSocketService implements IExchangeService {

    protected ws: WebSocket | null = null;
    protected orderBook: OrderBook = { asks: [], bids: [] };
    protected isConnected: boolean = false;
    protected reconnectAttempt: number = 0;
    protected maxReconnectAttempts: number = 10;
    protected baseReconnectDelay: number = 1000; // 1 second
    protected maxReconnectDelay: number = 30000; // 30 seconds
    protected reconnectTimer: NodeJS.Timeout | null = null;

    constructor(
        protected readonly symbol: string,
        protected readonly logger: winston.Logger,
        protected readonly createWebSocket: () => WebSocket
    ) {}

    public abstract initialize(): Promise<void>;

    public async fetchOrderBook(): Promise<OrderBook> {
        return { ...this.orderBook };
    }

    protected abstract handleMessage(message: Buffer): void;

    protected initializeWebSocket() {
        // Clear any existing connection
        if (this.ws) {
            this.cleanupWebSocket();
        }

        this.ws = this.createWebSocket();

        this.ws.on('open', () => {
            this.isConnected = true;
            this.reconnectAttempt = 0;
            this.logger.info(`WebSocket connected for ${this.symbol}`);
        });

        this.ws.on('message', (message: Buffer) => this.handleMessage(message));

        this.ws.on('error', (error) => {
            this.logger.error('WebSocket error:', error);
            this.isConnected = false;
            this.attemptReconnect();
        });

        this.ws.on('close', () => {
            this.logger.info('WebSocket closed.');
            this.isConnected = false;
            this.attemptReconnect();
        });
    }

    protected cleanupWebSocket() {
        if (this.ws) {
            this.ws.removeAllListeners();
            if (this.ws.readyState === WebSocket.OPEN) {
                this.ws.close();
            }
            this.ws = null;
        }

        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    }

    protected attemptReconnect() {
        if (this.reconnectTimer) {
            return; // Already attempting to reconnect
        }

        if (this.reconnectAttempt >= this.maxReconnectAttempts) {
            this.logger.error(`Maximum reconnection attempts (${this.maxReconnectAttempts}) reached. Giving up.`);
            return;
        }

        // Calculate delay with exponential backoff and jitter
        const delay = Math.min(
            this.maxReconnectDelay,
            this.baseReconnectDelay * Math.pow(2, this.reconnectAttempt) * (0.5 + Math.random() * 0.5)
        );

        this.reconnectAttempt++;
        this.logger.info(`Attempting to reconnect (attempt ${this.reconnectAttempt}) in ${Math.round(delay)}ms`);

        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.logger.info(`Reconnecting to WebSocket (attempt ${this.reconnectAttempt})...`);
            this.initializeWebSocket();
        }, delay);
    }

    public dispose(): void {
        this.logger.info(`Disposing WebSocket service for ${this.symbol}`);
        this.cleanupWebSocket();
    }
}