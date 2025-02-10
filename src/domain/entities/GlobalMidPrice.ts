export type ExchangeMidPrice = {
  mid_price: number;
};

export type GlobalMidPrice = {
  global_mid_price: number;
  exchange_data: Record<string, ExchangeMidPrice>;
};
