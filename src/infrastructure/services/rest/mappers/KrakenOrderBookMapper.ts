import {OrderBook, PriceLevel} from '../../../../domain/entities/OrderBook';
import {KrakenTypes} from "../types/KrakenTypes";

export class KrakenOrderBookMapper {
    public static toOrderBook(krakenData: KrakenTypes): OrderBook {
        if (!krakenData.result || !Object.keys(krakenData.result).length) {
            throw new Error('Invalid Kraken data format: missing result data');
        }

        const pairData:{ asks: string[][]; bids: string[][] } = Object.values(krakenData.result)[0];

        if (!pairData.asks || !pairData.bids) {
            throw new Error('Invalid Kraken data format: missing asks or bids');
        }

        const processLevel: (level: string[]) => PriceLevel = (level: string[]): PriceLevel => {
            const price: number = parseFloat(level[0]);
            const volume: number = parseFloat(level[1]);

            if (isNaN(price) || isNaN(volume)) {
                throw new Error(`Invalid level data in Kraken order book: ${JSON.stringify(level)}`);
            }

            return { price, volume };
        };

        return {
            asks: pairData.asks.map(processLevel),
            bids: pairData.bids.map(processLevel)
        };
    }
}