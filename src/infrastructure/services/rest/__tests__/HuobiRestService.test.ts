import axios from "axios";
import { HuobiRestService } from "../HuobiRestService";
import { OrderBook } from "../../../../domain/entities/OrderBook";
import { IExchangeService } from "../../../../domain/interfaces/IExchangeService";
import winston from 'winston';

jest.mock('axios');

describe('HuobiRestService', () => {
    let service: IExchangeService;
    let mockLogger: jest.Mocked<winston.Logger>;

    beforeEach(() => {
        mockLogger = {
            ...winston.createLogger()
        } as unknown as jest.Mocked<winston.Logger>;

        service = new HuobiRestService(mockLogger);
    });

    it('should fetch and processes order book correctly when successfull', async () => {
        const mockResponse = {
            data: {
                tick: {
                    asks: [
                        ['50000', '1.2'],
                        ['50010', '0.5']
                    ],
                    bids: [
                        ['49990', '0.8'],
                        ['49980', '1.5']
                    ]
                }
            }
        };


        (axios.get as jest.Mock).mockResolvedValue(mockResponse);
        const orderBook: OrderBook = await service.fetchOrderBook();

        expect(orderBook.asks).toEqual([
            { price: 50000, volume: 1.2 },
            { price: 50010, volume: 0.5 }
        ]);
        expect(orderBook.bids).toEqual([
            { price: 49990, volume: 0.8 },
            { price: 49980, volume: 1.5 }
        ]);
    });

    it('should throw an error when the level format is invalid', async () => {
        const mockResponse = {
            data: {
                tick: {
                    asks: [['invalid', '1.2']],
                    bids: [['49990', '0.8']]
                }
            }
        };

        (axios.get as jest.Mock).mockResolvedValue(mockResponse);
        await expect(service.fetchOrderBook()).rejects.toThrowError('Invalid level format in Huobi order book');
    });

    it('should handle axios request when failure gracefully', async () => {
        const error = new Error('Network error');
        (axios.get as jest.Mock).mockRejectedValue(error);
        await expect(service.fetchOrderBook()).rejects.toThrowError('Network error');
    });
});
