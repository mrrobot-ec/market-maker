import axios from "axios";
import winston from 'winston';
import { KrakenRestService } from "../KrakenRestService";
import { OrderBook } from "../../../../domain/entities/OrderBook";
import { IExchangeService } from "../../../../domain/interfaces/IExchangeService";

jest.mock('axios');

describe('KrakenRestService', () => {
    let service: IExchangeService;

    let mockLogger: jest.Mocked<winston.Logger>;

        beforeEach(() => {
            mockLogger = {
                info: jest.fn(),
                warn: jest.fn(),
                error: jest.fn(),
                debug: jest.fn(),
                log: jest.fn()
            } as unknown as jest.Mocked<winston.Logger>;

            service = new KrakenRestService(mockLogger);
        });

    it('should fetch and processes order book when successfull', async () => {
        const mockResponse = {
            data: {
                error: [],
                result: {
                    XBTUSDT: {
                        asks: [
                            ['50000', '1.5'],
                            ['50010', '0.7']
                        ],
                        bids: [
                            ['49990', '0.9'],
                            ['49980', '1.2']
                        ]
                    }
                }
            }
        };

        // Mock axios.get to return the mock response
        (axios.get as jest.Mock).mockResolvedValue(mockResponse);

        const orderBook: OrderBook = await service.fetchOrderBook();

        expect(orderBook.asks).toEqual([
            { price: 50000, volume: 1.5 },
            { price: 50010, volume: 0.7 }
        ]);
        expect(orderBook.bids).toEqual([
            { price: 49990, volume: 0.9 },
            { price: 49980, volume: 1.2 }
        ]);
    });

    it('should throw an error when Kraken API returns an error', async () => {
        const mockResponse = {
            data: {
                error: ['Some error occurred'],
                result: {}
            }
        };

        (axios.get as jest.Mock).mockResolvedValue(mockResponse);

        await expect(service.fetchOrderBook()).rejects.toThrowError('Invalid order book data');
    });

    it('should handle axios request when failure gracefully', async () => {
        const error = new Error('Network error');
        (axios.get as jest.Mock).mockRejectedValue(error);

        await expect(service.fetchOrderBook()).rejects.toThrowError('Network error');
    });
});
