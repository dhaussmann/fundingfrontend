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
  history: (symbol: string, hours: number): Promise<HistoryResponse> =>
    fetchAPI(`/history?symbol=${symbol}&hours=${hours}`),

  // Get latest rates with optional filters
  latest: (exchange?: string, symbol?: string): Promise<{ rates: FundingRate[] }> => {
    const params = new URLSearchParams();
    if (exchange) params.append('exchange', exchange);
    if (symbol) params.append('symbol', symbol);
    const query = params.toString() ? `?${params}` : '';
    return fetchAPI(`/rates${query}`);
  },

  // Get statistics
  stats: (): Promise<StatsResponse> => fetchAPI('/stats'),

  // Get all available symbols across all exchanges
  getSymbols: async (): Promise<string[]> => {
    const data = await fetchAPI<{ rates: FundingRate[] }>('/rates');
    const symbols = new Set(data.rates.map((r) => r.symbol));
    return Array.from(symbols).sort();
  },

  // Get all available exchanges
  getExchanges: async (): Promise<string[]> => {
    const data = await fetchAPI<{ rates: FundingRate[] }>('/rates');
    const exchanges = new Set(data.rates.map((r) => r.exchange));
    return Array.from(exchanges).sort();
  },
};
