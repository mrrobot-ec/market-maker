import winston from 'winston';
import { injectable } from 'inversify';
import {BidLevel, AskLevel, OrderBook} from '../domain/entities/OrderBook';
import { IExchangeService } from '../domain/interfaces/IExchangeService';
import { IMidPriceService } from '../domain/interfaces/IMidPriceService';
import {GlobalMidPrice, Metrics, SerializedMetrics} from '../domain/entities/GlobalMidPrice';


@injectable()
export class MidPriceService implements IMidPriceService {
    private readonly exchangeServices: IExchangeService[];
    private readonly logger: winston.Logger;
    private cachedMidPrice: GlobalMidPrice | null = null;
    private lastCalculationTime: number = 0;
    private readonly cacheValidityPeriod: number = 3000; // 3 seconds

    private metrics: Metrics = {
        calculationCount: 0,
        successfulCalculations: 0,
        failedCalculations: 0,
        exchangeSuccesses: new Map<string, number>(),
        exchangeFailures: new Map<string, number>(),
        averageCalculationTime: 0,
        totalCalculationTime: 0
    };


    constructor(exchangeServices: IExchangeService[], logger: winston.Logger) {
        this.exchangeServices = exchangeServices;
        this.logger = logger
    }

    public getMetrics(): Metrics {
        return { ...this.metrics };
    }

    private getSerializedMetrics(): SerializedMetrics {
        const exchangeSuccessesObj: Record<string, number> = {};
        const exchangeFailuresObj: Record<string, number> = {};

        this.metrics.exchangeSuccesses.forEach((value:number, key: string): void => {
            exchangeSuccessesObj[key] = value;
        });

        this.metrics.exchangeFailures.forEach((value: number, key: string): void => {
            exchangeFailuresObj[key] = value;
        });

        return {
            calculationCount: this.metrics.calculationCount,
            successfulCalculations: this.metrics.successfulCalculations,
            failedCalculations: this.metrics.failedCalculations,
            exchangeSuccesses: exchangeSuccessesObj,
            exchangeFailures: exchangeFailuresObj,
            averageCalculationTime: this.metrics.averageCalculationTime,
            totalCalculationTime: this.metrics.totalCalculationTime
        };
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
        const currentTime: number = Date.now();

        // Return cached value if it's still valid
        if (this.cachedMidPrice && (currentTime - this.lastCalculationTime) < this.cacheValidityPeriod) {
            return { ...this.cachedMidPrice };
        }

        for (const service of this.exchangeServices) {
            try {
                const serviceName: string = service.constructor.name.replace('Service', '').toLowerCase();
                const orderBook: OrderBook = await service.fetchOrderBook();
                this.logger.info(serviceName, orderBook)
                const bestBid: number | null = this.getBestBid(orderBook.bids);
                const bestAsk: number | null = this.getBestAsk(orderBook.asks);


                if (bestBid !== null && bestAsk !== null) {
                    const midPrice: number = (bestBid + bestAsk) / 2;
                    midPrices.push(midPrice);
                    exchangeData[serviceName] = { mid_price: midPrice };
                }
                const currentSuccesses: number = this.metrics.exchangeSuccesses.get(serviceName) || 0;
                this.metrics.exchangeSuccesses.set(serviceName, currentSuccesses + 1);


            } catch (error) {
                this.logger.error(`Error processing service: ${error}`)
                this.metrics.failedCalculations++;
                const serviceName: string = service.constructor.name.replace('Service', '').toLowerCase();
                const currentFailures: number = this.metrics.exchangeFailures.get(serviceName) || 0;
                this.metrics.exchangeFailures.set(serviceName, currentFailures + 1);
                continue;
            }
        }

        if (midPrices.length === 0) {
            throw new Error('No valid prices available');
        }

        const globalMidPrice: number = midPrices
            .reduce((sum: number, price: number): number => sum + price, 0) / midPrices.length;

        this.metrics.calculationCount++;
        this.metrics.successfulCalculations++;
        const calculationTime:number = Date.now() - currentTime;
        this.metrics.totalCalculationTime += calculationTime;
        this.metrics.averageCalculationTime = this.metrics.totalCalculationTime / this.metrics.successfulCalculations;

        // Cache the result
        this.cachedMidPrice = {
            global_mid_price: globalMidPrice,
            exchange_data: exchangeData,
            metrics: this.getSerializedMetrics()
        };
        this.lastCalculationTime = currentTime;

        return { ...this.cachedMidPrice };
    }
}