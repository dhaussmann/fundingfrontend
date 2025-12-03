import { CompareResponse, HistoryResponse, StatsResponse, FundingRate } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://funding-rate-collector.cloudflareone-demo-account.workers.dev';

async function fetchAPI<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }
  return response.json();
}

export const api = {
  // Get comparison of funding rates across exchanges for a symbol
  compare: (symbol: string): Promise<CompareResponse> =>
    fetchAPI(`/compare?symbol=${symbol}`),

  // Get historical funding rates
  history: async (symbol: string, hours: number): Promise<HistoryResponse> => {
    const response = await fetchAPI<{
      symbol: string;
      results: Array<{
        exchange: string;
        symbol: string;
        funding_rate_percent: number;
        annualized_rate: number;
        collected_at: number;
      }>;
    }>(`/history?symbol=${symbol}&hours=${hours}`);

    // Transform API response to match our internal types
    return {
      symbol: response.symbol,
      data: response.results.map(item => ({
        timestamp: item.collected_at,
        funding_rate_percent: item.funding_rate_percent,
        annualized_rate: item.annualized_rate,
        exchange: item.exchange,
        symbol: item.symbol,
      }))
    };
  },

  // Get latest rates with optional filters
  latest: async (exchange?: string, symbol?: string): Promise<{ rates: FundingRate[] }> => {
    const params = new URLSearchParams();
    if (exchange) params.append('exchange', exchange);
    if (symbol) params.append('symbol', symbol);
    const query = params.toString() ? `?${params}` : '';
    const rates = await fetchAPI<FundingRate[]>(`/rates${query}`);
    return { rates }; // Wrap array in object
  },

  // Get statistics
  stats: (): Promise<StatsResponse> => fetchAPI('/stats'),

  // Get all available symbols across all exchanges
  getSymbols: async (): Promise<string[]> => {
    const rates = await fetchAPI<FundingRate[]>('/rates');
    const symbols = new Set(rates.map((r) => r.symbol));
    return Array.from(symbols).sort();
  },

  // Get all available exchanges
  getExchanges: async (): Promise<string[]> => {
    const rates = await fetchAPI<FundingRate[]>('/rates');
    const exchanges = new Set(rates.map((r) => r.exchange));
    return Array.from(exchanges).sort();
  },
};
