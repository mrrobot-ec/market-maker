import WebSocket from 'ws';
import winston from 'winston';
import { logger } from './Logger';
import { Container } from 'inversify';
import {HuobiRestService} from './services/rest/HuobiRestService';
import { KrakenRestService } from './services/rest/KrakenRestService';
import { IExchangeService } from '../domain/interfaces/IExchangeService';
import { MidPriceServiceFactory } from '../application/MidPriceServiceFactory';
import { BinanceWebSocketService } from './services/websocket/BinanceWebSocketService';
import { IMidPriceService, IMidPriceServiceFactory } from '../domain/interfaces/IMidPriceService';
import { ExchangeServiceSymbol, LoggerSymbol, MidPriceServiceFactorySymbol, MidPriceServiceSymbol, WebSocketSymbol } from '../domain/SymbolsForDI';


const container: Container = new Container();

container.bind<winston.Logger>(LoggerSymbol).toConstantValue(logger);

container.bind<Promise<IExchangeService>>(ExchangeServiceSymbol)
    .toDynamicValue(async (context) => {
        const logger: winston.Logger = context.container.get(LoggerSymbol);
        return new KrakenRestService(logger)
    });

container.bind<Promise<IExchangeService>>(ExchangeServiceSymbol)
    .toDynamicValue(async (context) => {
        const logger: winston.Logger = context.container.get(LoggerSymbol);
        return new HuobiRestService(logger)
    });

container.bind<() => WebSocket>(WebSocketSymbol)
    .toDynamicValue(() => () => new WebSocket('wss://stream.binance.us:9443/ws/btcusdt@depth'))
    .inSingletonScope();

container.bind<Promise<IExchangeService>>(ExchangeServiceSymbol)
    .toDynamicValue(async (context) => {
        const webSocketFactory = context.container.get<() => WebSocket>(WebSocketSymbol);
        const logger: winston.Logger = context.container.get(LoggerSymbol);
        const binanceService = new BinanceWebSocketService('btcusdt', logger ,webSocketFactory);
        await binanceService.initialize();
        return binanceService;
    })
    .inSingletonScope();

container.bind<Promise<IMidPriceServiceFactory>>(MidPriceServiceFactorySymbol)
    .toDynamicValue(async (context) => {
        const exchangeServices = await context.container.getAllAsync<IExchangeService>(ExchangeServiceSymbol);
        const logger: winston.Logger = context.container.get(LoggerSymbol);
        return new MidPriceServiceFactory(exchangeServices, logger);
    });

container.bind<Promise<IMidPriceService>>(MidPriceServiceSymbol)
    .toDynamicValue(async (context) => {
        const factory = await context.container.getAsync<Promise<IMidPriceServiceFactory>>(MidPriceServiceFactorySymbol);
        return factory.createMidPriceService();
    });

export default container;