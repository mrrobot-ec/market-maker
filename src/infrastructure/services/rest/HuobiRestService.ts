import winston from 'winston';
import axios, { AxiosResponse } from 'axios';
import { inject, injectable } from 'inversify';
import { LoggerSymbol } from '../../../domain/SymbolsForDI';
import { OrderBook, PriceLevel } from '../../../domain/entities/OrderBook';
import { IExchangeService } from '../../../domain/interfaces/IExchangeService';

@injectable()
export class HuobiRestService implements IExchangeService {
    constructor(@inject(LoggerSymbol) private readonly logger: winston.Logger) {}

    async fetchOrderBook(): Promise<OrderBook> {
      const response: AxiosResponse = await axios.get(`https://api.huobi.pro/market/depth?symbol=btcusdt&depth=10&type=step0`);
      const processLevel = (level: [string, string]): PriceLevel => {
        const price = parseFloat(level[0]);
        const volume = parseFloat(level[1]);

        if (isNaN(price) || isNaN(volume)) {
            throw new Error(`Invalid level format in Huobi order book: ${JSON.stringify(level)}`);
        }

        return { price, volume };
    };

    const processedAsks = (response.data.tick.asks as [string, string][]).map( (level) => processLevel(level) );
    const processedBids = (response.data.tick.bids as [string, string][]).map( (level) => processLevel(level) );

    return {
        asks: processedAsks,
        bids: processedBids
    };
    }
}