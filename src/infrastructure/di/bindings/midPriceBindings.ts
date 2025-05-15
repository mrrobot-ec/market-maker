import { ContainerModule } from 'inversify';
import winston from 'winston';
import {IMidPriceService, IMidPriceServiceFactory} from "../../../domain/interfaces/IMidPriceService";
import {
    ExchangeServiceSymbol,
    LoggerSymbol,
    MidPriceServiceFactorySymbol,
    MidPriceServiceSymbol
} from "../symbols";
import {IExchangeService} from "../../../domain/interfaces/IExchangeService";
import {MidPriceServiceFactory} from "../../../application/MidPriceServiceFactory";

export const midPriceBinding = new ContainerModule((bind) => {
    bind<Promise<IMidPriceServiceFactory>>(MidPriceServiceFactorySymbol)
        .toDynamicValue(async (context) => {
            try {
                const exchangeServices = await context.container.getAllAsync<IExchangeService>(ExchangeServiceSymbol);
                const logger: winston.Logger = context.container.get(LoggerSymbol);
                return new MidPriceServiceFactory(exchangeServices, logger);
            } catch (error) {
                const logger: winston.Logger = context.container.get(LoggerSymbol);
                logger.error('Failed to create MidPriceServiceFactory:', error);
                throw error;
            }
        });

    bind<Promise<IMidPriceService>>(MidPriceServiceSymbol)
        .toDynamicValue(async (context) => {
            try {
                const factory = await context.container.getAsync<IMidPriceServiceFactory>(MidPriceServiceFactorySymbol);
                return factory.createMidPriceService();
            } catch (error) {
                const logger: winston.Logger = context.container.get(LoggerSymbol);
                logger.error('Failed to create MidPriceService:', error);
                throw error;
            }
        });
});