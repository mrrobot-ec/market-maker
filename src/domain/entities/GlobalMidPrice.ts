export interface Metrics {
  calculationCount: number;
  successfulCalculations: number;
  failedCalculations: number;
  exchangeSuccesses: Map<string, number>;
  exchangeFailures: Map<string, number>;
  averageCalculationTime: number;
  totalCalculationTime: number;
}

export interface SerializedMetrics {
  calculationCount: number;
  successfulCalculations: number;
  failedCalculations: number;
  exchangeSuccesses: Record<string, number>;
  exchangeFailures: Record<string, number>;
  averageCalculationTime: number;
  totalCalculationTime: number;
}

export type ExchangeMidPrice = {
  mid_price: number;
};

export type GlobalMidPrice = {
  global_mid_price: number;
  exchange_data: Record<string, ExchangeMidPrice>;
  metrics: SerializedMetrics;
};
