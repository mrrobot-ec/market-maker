import { OrderBook } from "../entities/OrderBook";

export interface IExchangeService {
  fetchOrderBook(): Promise<OrderBook>;
}