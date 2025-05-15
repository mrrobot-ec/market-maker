import winston from 'winston';
import { MidPriceService } from './MidPriceService';
import { inject, injectable, multiInject } from 'inversify';
import { IExchangeService } from '../domain/interfaces/IExchangeService';
import {ExchangeServiceSymbol, LoggerSymbol} from '../infrastructure/di/symbols';
import { IMidPriceServiceFactory, IMidPriceService } from '../domain/interfaces/IMidPriceService';

@injectable()
export class MidPriceServiceFactory implements IMidPriceServiceFactory {
    private readonly exchangeServices: IExchangeService[];

    constructor(
        @multiInject(ExchangeServiceSymbol) exchangeServices: IExchangeService[],
        @inject(LoggerSymbol) private readonly logger: winston.Logger) {
        this.exchangeServices = exchangeServices;
    }

    public async createMidPriceService(): Promise<IMidPriceService> {
        this.logger.info(`Creating MidPriceService with ${this.exchangeServices.length} exchange services`);
        return new MidPriceService(this.exchangeServices, this.logger);
    }
}