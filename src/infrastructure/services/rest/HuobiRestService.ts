import winston from 'winston';
import axios, { AxiosResponse } from 'axios';
import { inject, injectable } from 'inversify';

import { LoggerSymbol } from '../../di/symbols';
import {HuobiResponse} from "./types/HuobiTypes";
import { OrderBook } from '../../../domain/entities/OrderBook';
import {HuobiOrderBookMapper} from "./mappers/HuobiOrderBookMapper";
import { IExchangeService } from '../../../domain/interfaces/IExchangeService';

@injectable()
export class HuobiRestService implements IExchangeService {
    constructor(@inject(LoggerSymbol) private readonly logger: winston.Logger) {}

    async fetchOrderBook(): Promise<OrderBook> {
      const response: AxiosResponse = await axios.get(`https://api.huobi.pro/market/depth?symbol=btcusdt&depth=10&type=step0`);
      const data: HuobiResponse = response.data;
      return HuobiOrderBookMapper.toOrderBook(data);
    }
}