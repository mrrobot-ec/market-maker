import winston from 'winston';
import { injectable } from 'inversify';
import { BidLevel, AskLevel } from '../domain/entities/OrderBook';
import { GlobalMidPrice } from '../domain/entities/GlobalMidPrice';
import { IExchangeService } from '../domain/interfaces/IExchangeService';
import { IMidPriceService } from '../domain/interfaces/IMidPriceService';


@injectable()
export class MidPriceService implements IMidPriceService {
    private readonly exchangeServices: IExchangeService[];
    private readonly logger: winston.Logger;

    constructor(exchangeServices: IExchangeService[], logger: winston.Logger) {
        this.exchangeServices = exchangeServices;
        this.logger = logger
    }

    public getExchangeServices(): IExchangeService[] {
        return this.exchangeServices;
    }

    private getBestBid(bids: BidLevel[]): number | null {
        return bids.length > 0 ? bids[0].price : null;
    }

    private getBestAsk(asks: AskLevel[]): number | null {
        return asks.length > 0 ? asks[0].price : null;
    }

    async calculateGlobalMidPrice(): Promise<GlobalMidPrice> {
        const midPrices: number[] = [];
        const exchangeData: Record<string, { mid_price: number }> = {};

        for (const service of this.exchangeServices) {
            try {
                const serviceName = service.constructor.name.replace('Service', '').toLowerCase();
                const orderBook = await service.fetchOrderBook();
                this.logger.info(serviceName, orderBook)
                const bestBid = this.getBestBid(orderBook.bids);
                const bestAsk = this.getBestAsk(orderBook.asks);

                if (bestBid !== null && bestAsk !== null) {
                    const midPrice = (bestBid + bestAsk) / 2;
                    midPrices.push(midPrice);

                    exchangeData[serviceName] = { mid_price: midPrice };
                }
            } catch (error) {
                this.logger.error(`Error processing service: ${error}`)
                continue;
            }
        }

        if (midPrices.length === 0) {
            throw new Error('No valid prices available');
        }

        const globalMidPrice = midPrices.reduce((sum, price) => sum + price, 0) / midPrices.length;

        return {
            global_mid_price: globalMidPrice,
            exchange_data: exchangeData
        };
    }
}