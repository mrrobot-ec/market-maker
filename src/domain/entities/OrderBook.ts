export interface PriceLevel {
  price: number;
  volume: number;
}

export type AskLevel = PriceLevel;
export type BidLevel = PriceLevel;

export interface OrderBook {
  asks: AskLevel[];
  bids: BidLevel[];
}