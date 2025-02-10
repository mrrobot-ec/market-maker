
import axios from 'axios';
import WebSocket from 'ws';
import winston from 'winston';
import { jest } from '@jest/globals';
import { BinanceWebSocketService } from '../BinanceWebSocketService';

jest.mock('ws');
jest.mock('axios');

const MockedWebSocket = WebSocket as jest.MockedClass<typeof WebSocket>;
const MockedAxios = axios as jest.Mocked<typeof axios>;

describe('BinanceWebSocketService', () => {
    let service: BinanceWebSocketService;
    let mockWebSocket: WebSocket;
    let mockLogger: jest.Mocked<winston.Logger>;


    beforeEach(() => {
        MockedWebSocket.mockClear();
        MockedAxios.get.mockClear();
        jest.spyOn(console, 'error').mockImplementation(() => {});

        mockWebSocket = new MockedWebSocket('') as unknown as WebSocket;
            mockLogger = {
                info: jest.fn(),
                warn: jest.fn(),
                error: jest.fn(),
                debug: jest.fn(),
                log: jest.fn()
            } as unknown as jest.Mocked<winston.Logger>;

        service = new BinanceWebSocketService('BTCUSDT', mockLogger, () => mockWebSocket);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('should initialize snapshot and fetch order book when successfull', async () => {
        MockedAxios.get.mockResolvedValue({
            data: {
                lastUpdateId: 100,
                bids: [['40000.00', '0.5']],
                asks: [['41000.00', '0.2']]
            }
        });

        await service.initialize();
        const orderBook = await service.fetchOrderBook();

        expect(MockedAxios.get).toHaveBeenCalledWith('https://api.binance.us/api/v3/depth', {
            params: { symbol: 'BTCUSDT', limit: 10 },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Accept': 'application/json'
            }
        });

        expect(orderBook.bids).toEqual([{ price: 40000, volume: 0.5 }]);
        expect(orderBook.asks).toEqual([{ price: 41000, volume: 0.2 }]);
    });

    test('should return early when WebSocket message is missing required fields', async () => {
        // Access and update private orderBook safely using Reflect API
        Reflect.set(service, 'orderBook', { bids: [], asks: [] });
        service['initializeSnapshot'] = jest.fn(async () => {});

        const incompleteMessage = Buffer.from(JSON.stringify({ b: [['40000.00', '0.8']] }));

        await service.initialize();

        service['handleMessage'](incompleteMessage);

        const orderBook = await service.fetchOrderBook();

        expect(orderBook.bids).toEqual([]);
        expect(orderBook.asks).toEqual([]);
    });

    test('should replace order book on WebSocket updates when successfull', async () => {
        const mockMessage = Buffer.from(JSON.stringify({
            u: 102,
            b: [['40000.00', '0.8']],
            a: [['41000.00', '0']]
        }));

        mockWebSocket.onmessage = jest.fn();

        await service.initialize();
        service['handleMessage'](mockMessage);

        const orderBook = await service.fetchOrderBook();

        expect(orderBook.bids).toEqual([{ price: 40000, volume: 0.8 }]);
        expect(orderBook.asks.length).toBe(1);
    });

    test('should log error when snapshot initialization fails', async () => {
        MockedAxios.get.mockRejectedValue(new Error('Network error'));

        await service.initialize();

        expect(mockLogger.error).toHaveBeenCalledWith('Error initializing snapshot:', expect.any(Error));
    });

    test('should log error when WebSocket message handling fails', async () => {
        const invalidMessage = Buffer.from('invalid json');

        await service.initialize();
        service['handleMessage'](invalidMessage);
        expect(mockLogger.error).toHaveBeenCalledWith('Failed to handle message:', expect.any(Error));
    });



});