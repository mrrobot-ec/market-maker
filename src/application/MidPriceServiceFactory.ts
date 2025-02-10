import winston from 'winston';
import { MidPriceService } from './MidPriceService';
import { LoggerSymbol } from '../domain/SymbolsForDI';
import { inject, injectable, multiInject } from 'inversify';
import { IExchangeService } from '../domain/interfaces/IExchangeService';
import { IMidPriceServiceFactory, IMidPriceService } from '../domain/interfaces/IMidPriceService';

@injectable()
export class MidPriceServiceFactory implements IMidPriceServiceFactory {
    private readonly exchangeServices: IExchangeService[];

    constructor(
        @multiInject('ExchangeService') exchangeServices: IExchangeService[],
        @inject(LoggerSymbol) private readonly logger: winston.Logger) {
        this.exchangeServices = exchangeServices;
    }

    public async createMidPriceService(): Promise<IMidPriceService> {
        return new MidPriceService(this.exchangeServices, this.logger);
    }
}