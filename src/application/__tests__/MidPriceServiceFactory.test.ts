import winston from 'winston';
import { MidPriceService } from '../MidPriceService';
import { MidPriceServiceFactory } from '../MidPriceServiceFactory';
import { IExchangeService } from '../../domain/interfaces/IExchangeService';
import { IMidPriceService } from '../../domain/interfaces/IMidPriceService';

describe('MidPriceServiceFactory', () => {
    let factory: MidPriceServiceFactory;
    let mockLogger: jest.Mocked<winston.Logger>;
    let mockExchange1: jest.Mocked<IExchangeService>;
    let mockExchange2: jest.Mocked<IExchangeService>;
    let mockExchange3: jest.Mocked<IExchangeService>;


    beforeEach(() => {
        mockExchange1 = {} as jest.Mocked<IExchangeService>;
        mockExchange2 = {} as jest.Mocked<IExchangeService>;
        mockExchange3 = {} as jest.Mocked<IExchangeService>;

        mockLogger = {
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            debug: jest.fn(),
            log: jest.fn()
        } as unknown as jest.Mocked<winston.Logger>;

        factory = new MidPriceServiceFactory([mockExchange1, mockExchange2, mockExchange3], mockLogger);
    });

    it('should create an instance of MidPriceService when successfull creation', async () => {
        const midPriceService: IMidPriceService = await factory.createMidPriceService();

        expect(midPriceService).toBeInstanceOf(MidPriceService);
    });

    it('should pass exchange services to the created MidPriceService when successfull creation', async () => {
        const midPriceService: IMidPriceService = await factory.createMidPriceService();
        expect((midPriceService as MidPriceService).getExchangeServices()).toEqual([mockExchange1, mockExchange2, mockExchange3]);
      });
});
