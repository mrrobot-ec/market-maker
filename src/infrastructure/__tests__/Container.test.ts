
import WebSocket from 'ws';
import { Container } from 'inversify';
import container from '../container';
import { HuobiRestService } from '../services/rest/HuobiRestService';
import { KrakenRestService } from '../services/rest/KrakenRestService';
import { IExchangeService } from '../../domain/interfaces/IExchangeService';
import { BinanceWebSocketService } from '../services/websocket/BinanceWebSocketService';
import { IMidPriceServiceFactory, IMidPriceService } from '../../domain/interfaces/IMidPriceService';
import { ExchangeServiceSymbol, WebSocketSymbol, MidPriceServiceFactorySymbol, MidPriceServiceSymbol } from '../../domain/SymbolsForDI';

jest.mock('ws');
jest.mock('../services/rest/HuobiRestService');
jest.mock('../services/rest/KrakenRestService');
jest.mock('../services/websocket/BinanceWebSocketService');

describe('Container Configuration', () => {
    let testContainer: Container;

    beforeEach(() => {
        testContainer = container;
    });

    test('should bind and resolve KrakenRestService when succesfull', async () => {
        const services = await testContainer.getAllAsync<IExchangeService>(ExchangeServiceSymbol);
        expect(services.some(service => service instanceof KrakenRestService)).toBe(true);
    });

    test('should bind and resolve HuobiRestService when succesfull', async () => {
        const services = await testContainer.getAllAsync<IExchangeService>(ExchangeServiceSymbol);
        expect(services.some(service => service instanceof HuobiRestService)).toBe(true);
    });

    test('should bind and resolve BinanceWebSocketService when succesfull', async () => {
        const services = await testContainer.getAllAsync<IExchangeService>(ExchangeServiceSymbol);
        const binanceService = services.find(service => service instanceof BinanceWebSocketService);
        expect(binanceService).toBeInstanceOf(BinanceWebSocketService);
    });

    test('should bind and resolve WebSocket factory when succesfull', () => {
        const webSocketFactory = testContainer.get<() => WebSocket>(WebSocketSymbol);
        expect(webSocketFactory()).toBeInstanceOf(WebSocket);
    });

    test('should bind and resolve MidPriceServiceFactory when succesfull', async () => {
        const midPriceServiceFactory = await testContainer.getAsync<IMidPriceServiceFactory>(MidPriceServiceFactorySymbol);
        expect(midPriceServiceFactory).toBeDefined();
    });

    test('should bind and resolve IMidPriceService when succesfull', async () => {
        const midPriceService = await testContainer.getAsync<IMidPriceService>(MidPriceServiceSymbol);
        expect(midPriceService).toBeDefined();
    });
});
