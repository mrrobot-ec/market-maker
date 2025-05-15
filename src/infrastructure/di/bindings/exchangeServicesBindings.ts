import {ContainerModule, interfaces} from 'inversify';
import winston from 'winston';
import WebSocket from 'ws';
import {
    ExchangeServiceSymbol,
    LoggerSymbol,
    WebSocketSymbol
} from "../symbols";
import {HuobiRestService} from "../../services/rest/HuobiRestService";
import {KrakenRestService} from "../../services/rest/KrakenRestService";
import {IExchangeService} from "../../../domain/interfaces/IExchangeService";
import {BinanceWebSocketService} from "../../services/websocket/BinanceWebSocketService";


export const exchangeServicesBinding = new ContainerModule((bind: interfaces.Bind): void => {
    bind<Promise<IExchangeService>>(ExchangeServiceSymbol)
        .toDynamicValue(async (context: interfaces.Context): Promise<KrakenRestService> => {
            const logger: winston.Logger = context.container.get(LoggerSymbol);
            return new KrakenRestService(logger);
        })
        .whenTargetNamed('kraken');

    bind<Promise<IExchangeService>>(ExchangeServiceSymbol)
        .toDynamicValue(async (context: interfaces.Context): Promise<HuobiRestService> => {
            const logger: winston.Logger = context.container.get(LoggerSymbol);
            return new HuobiRestService(logger);
        })
        .whenTargetNamed('huobi');

    bind<Promise<IExchangeService>>(ExchangeServiceSymbol)
        .toDynamicValue(async (context: interfaces.Context): Promise<BinanceWebSocketService> => {
            try {
                const logger: winston.Logger = context.container.get(LoggerSymbol);
                const webSocketFactory: () => WebSocket = context.container.get<() => WebSocket>(WebSocketSymbol);
                const binanceService = new BinanceWebSocketService('btcusdt', logger, webSocketFactory);
                await binanceService.initialize();
                return binanceService;
            } catch (error) {
                const logger: winston.Logger = context.container.get(LoggerSymbol);
                logger.error('Failed to initialize Binance service:', error);
                throw error;
            }
        })
        .inSingletonScope()
        .whenTargetNamed('binance');

});