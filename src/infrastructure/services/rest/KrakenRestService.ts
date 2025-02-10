import winston from 'winston';
import axios, { AxiosResponse } from 'axios';
import { inject, injectable } from 'inversify';
import { LoggerSymbol } from '../../../domain/SymbolsForDI';
import { IExchangeService } from '../../../domain/interfaces/IExchangeService';
import { AskLevel, BidLevel, OrderBook } from '../../../domain/entities/OrderBook';

@injectable()
export class KrakenRestService implements IExchangeService {
    constructor(@inject(LoggerSymbol) private readonly logger: winston.Logger) {}

    async fetchOrderBook(): Promise<OrderBook> {
        try{
        const response: AxiosResponse = await axios.get(`https://api.kraken.com/0/public/Depth?pair=BTCUSDT&count=10`);
        const data = response.data.result.XBTUSDT;

        if (response.data.error.length > 0 ) {
            throw new Error('Invalid order book data');
        }
        const { asks, bids } = data;
        const processedAsks = asks.map((level: [string, string]): AskLevel => {
            return {
                price: parseFloat(level[0]),
                volume: parseFloat(level[1])
            };
        });

        const processedBids = bids.map((level: [string, string]): BidLevel => {
                return {
                    price: parseFloat(level[0]),
                    volume: parseFloat(level[1])
                };

        });
        return { asks: processedAsks, bids: processedBids };

        } catch (error) {
            this.logger.error(`Error fetching Kraken order book: ${error}`)
            throw error;
        }
    }
}