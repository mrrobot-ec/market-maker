import {HuobiResponse} from "../types/HuobiTypes";
import {OrderBook, PriceLevel} from "../../../../domain/entities/OrderBook";


export class HuobiOrderBookMapper {
    public static toOrderBook(data: HuobiResponse): OrderBook {
        if (!data.tick || !data.tick.asks || !data.tick.bids) {
            throw new Error('Invalid Huobi data format: missing tick data');
        }

        const processLevel: (level: number[]) => PriceLevel = (level: number[]): PriceLevel => {
            const price: number = level[0];
            const volume: number = level[1];

            if (isNaN(price) || isNaN(volume)) {
                throw new Error(`Invalid level format in Huobi order book: ${JSON.stringify(level)}`);
            }

            return { price, volume };
        };

        return {
            asks: data.tick.asks.map(processLevel),
            bids: data.tick.bids.map(processLevel)
        };
    }
}