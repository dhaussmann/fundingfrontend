export interface FundingRate {
  exchange: string;
  symbol: string;
  funding_rate: number;
  funding_rate_percent: number;
  annualized_rate: number;
  collected_at: number;
}

export interface HistoricalDataPoint {
  timestamp: number;
  funding_rate_percent: number;
  annualized_rate: number;
  exchange: string;
  symbol: string;
}

export interface ExchangeStats {
  exchange: string;
  token_count: number;
  avg_funding_rate: number;
  latest_update: number;
}

export interface Top20Item {
  symbol: string;
  exchange: string;
  avg_funding_rate_percent: number;
  annualized_rate: number;
}

export type TimeRange = '24h' | '7d' | '30d';

export interface CompareResponse {
  symbol: string;
  rates: FundingRate[];
}

export interface HistoryResponse {
  symbol: string;
  data: HistoricalDataPoint[];
}

export interface StatsResponse {
  total_records: number;
  exchanges: {
    [key: string]: {
      count: number;
      latest_collection: number;
    };
  };
}
