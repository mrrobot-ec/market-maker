import winston from 'winston';
import { MidPriceService } from "../MidPriceService";
import { GlobalMidPrice } from "../../domain/entities/GlobalMidPrice";
import { IExchangeService } from "../../domain/interfaces/IExchangeService";


describe('MidPriceService', () => {
    let mockExchange1: jest.Mocked<IExchangeService>;
    let mockExchange2: jest.Mocked<IExchangeService>;
    let midPriceService: MidPriceService;
    let mockLogger: jest.Mocked<winston.Logger>;

    beforeEach(() => {
        mockExchange1 = {
            fetchOrderBook: jest.fn(),
            constructor: { name: 'BinanceService' }
        } as unknown as jest.Mocked<IExchangeService>;

        mockExchange2 = {
            fetchOrderBook: jest.fn(),
            constructor: { name: 'KrakenService' }
        } as unknown as jest.Mocked<IExchangeService>;

        mockLogger = {
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            debug: jest.fn(),
            log: jest.fn()
        } as unknown as jest.Mocked<winston.Logger>;

        midPriceService = new MidPriceService([mockExchange1, mockExchange2], mockLogger);
    });

    it('should calculate global mid-price when successfull with multiple exchanges', async () => {
        mockExchange1.fetchOrderBook.mockResolvedValue({
            bids: [{ price: 50010, volume: 1 }, { price: 50000, volume: 2 }],
            asks: [{ price: 50020, volume: 1 }, { price: 50030, volume: 2 }]
        });

        mockExchange2.fetchOrderBook.mockResolvedValue({
            bids: [{ price: 50030, volume: 1 }, { price: 50020, volume: 2 }],
            asks: [{ price: 50040, volume: 1 }, { price: 50050, volume: 2 }]
        });

        const result: GlobalMidPrice = await midPriceService.calculateGlobalMidPrice();

        expect(result.global_mid_price).toBe(50025);
        expect(result.exchange_data).toEqual({
            binance: { mid_price: 50015 },
            kraken: { mid_price: 50035 }
        });
    });

    it('should handle an exchange when returns empty order book', async () => {
        mockExchange1.fetchOrderBook.mockResolvedValue({
            bids: [],
            asks: []
        });

        mockExchange2.fetchOrderBook.mockResolvedValue({
            bids: [{ price: 50030, volume: 1 }, { price: 50020, volume: 2 }],
            asks: [{ price: 50040, volume: 1 }, { price: 50050, volume: 2 }]
        });

        const result: GlobalMidPrice = await midPriceService.calculateGlobalMidPrice();

        expect(result.global_mid_price).toBe(50035);
        expect(result.exchange_data).toEqual({
            kraken: { mid_price: 50035 }
        });
    });

    it('should throw an error when all exchanges fail', async () => {
        mockExchange1.fetchOrderBook.mockRejectedValue(new Error('Exchange 1 failed'));
        mockExchange2.fetchOrderBook.mockRejectedValue(new Error('Exchange 2 failed'));

        await expect(midPriceService.calculateGlobalMidPrice()).rejects.toThrow('No valid prices available');
    });
});
