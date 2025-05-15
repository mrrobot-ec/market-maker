import winston from 'winston';
import axios, { AxiosResponse } from 'axios';
import { inject, injectable } from 'inversify';
import { LoggerSymbol } from '../../di/symbols';
import { IExchangeService } from '../../../domain/interfaces/IExchangeService';
import { AskLevel, BidLevel, OrderBook } from '../../../domain/entities/OrderBook';
import {KrakenOrderBookMapper} from "./mappers/KrakenOrderBookMapper";

@injectable()
export class KrakenRestService implements IExchangeService {
    constructor(@inject(LoggerSymbol) private readonly logger: winston.Logger) {}

    async fetchOrderBook(): Promise<OrderBook> {
        try{
        const response: AxiosResponse = await axios.get(`https://api.kraken.com/0/public/Depth?pair=BTCUSDT&count=10`);
        return KrakenOrderBookMapper.toOrderBook(response.data);

        } catch (error) {
            this.logger.error(`Error fetching Kraken order book: ${error}`)
            throw error;
        }
    }
}