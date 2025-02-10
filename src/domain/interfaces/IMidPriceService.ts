import { GlobalMidPrice } from '../entities/GlobalMidPrice'
import { IExchangeService } from './IExchangeService';

export interface IMidPriceService {
  calculateGlobalMidPrice(): Promise<GlobalMidPrice>
  getExchangeServices(): IExchangeService[];
}

export interface IMidPriceServiceFactory {
  createMidPriceService(): Promise<IMidPriceService>;
}