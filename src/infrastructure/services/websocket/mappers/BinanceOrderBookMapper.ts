import {AskEntry, BidEntry, BinanceResponse} from "../types/BinanceTypes";
import {OrderBook, PriceLevel} from "../../../../domain/entities/OrderBook";

export class BinanceOrderBookMapper {
    public static toOrderBook(binanceData: BinanceResponse): OrderBook {
        if (!binanceData.b || !binanceData.a) {
            throw new Error('Invalid Binance data format: missing bids or asks');
        }
        return {
            bids: binanceData.b.map(([price, volume]: BidEntry): PriceLevel => ({
                price: parseFloat(price),
                volume: parseFloat(volume),
            })),
            asks: binanceData.a.map(([price, volume]: AskEntry): PriceLevel => ({
                price: parseFloat(price),
                volume: parseFloat(volume),
            })),
        };
    }
}