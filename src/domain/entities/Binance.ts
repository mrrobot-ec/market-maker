export type AskEntry = [string, string];
export type BidEntry = [string, string];

export interface BinanceDataType {
  e: string;          // Event type (e.g., 'depthUpdate')
  s: string;          // Symbol (e.g., 'BTCUSDT')
  u: number;          // Update ID
  a: AskEntry[];      // Asks (price, volume)
  b: BidEntry[];      // Bids (price, volume)
}