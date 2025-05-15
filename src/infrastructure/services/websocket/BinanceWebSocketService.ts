import winston from 'winston';
import { WebSocket } from 'ws';
import { injectable, postConstruct, inject } from 'inversify';

import { BinanceResponse } from './types/BinanceTypes';
import {LoggerSymbol} from '../../di/symbols';
import {BinanceOrderBookMapper} from "./mappers/BinanceOrderBookMapper";
import {BaseWebSocketService} from "./BaseWebSocketService";

@injectable()
export class BinanceWebSocketService extends BaseWebSocketService {
    constructor(
        symbol: string,
        @inject(LoggerSymbol) logger: winston.Logger,
        @inject('WebSocket') createWebSocket: () => WebSocket
    ) {
        super(symbol, logger, createWebSocket);
    }

    @postConstruct()
    public async initialize(): Promise<void> {
        try {
            this.initializeWebSocket();
        } catch (error) {
            this.logger.error('Failed to initialize BinanceWebSocketService:', error);
            throw error;
        }
    }


    protected handleMessage(message: Buffer): void {
        try {
            const data: BinanceResponse = JSON.parse(message.toString());
            if (!data.u || !data.b || !data.a) return;

            this.orderBook = BinanceOrderBookMapper.toOrderBook(data);
            this.logger.info(`Snapshot updated for ${this.symbol}`);
        } catch (error) {
            this.logger.error('Failed to handle message:', error);
        }
    }
}
