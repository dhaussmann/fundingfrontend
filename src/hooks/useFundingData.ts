import { useState, useEffect } from 'react';
import { api } from '@/api/client';
import { FundingRate, HistoricalDataPoint, ExchangeStats, Top20Item, TimeRange } from '@/types';

export function useFundingData() {
  const [latestRates, setLatestRates] = useState<FundingRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await api.latest();
        setLatestRates(data.rates);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { latestRates, loading, error };
}

export function useExchangeStats(latestRates: FundingRate[]): ExchangeStats[] {
  return Object.entries(
    latestRates.reduce((acc, rate) => {
      if (!acc[rate.exchange]) {
        acc[rate.exchange] = {
          exchange: rate.exchange,
          token_count: 0,
          total_funding_rate: 0,
          latest_update: rate.collected_at,
        };
      }
      acc[rate.exchange].token_count++;
      acc[rate.exchange].total_funding_rate += rate.funding_rate_percent;
      acc[rate.exchange].latest_update = Math.max(
        acc[rate.exchange].latest_update,
        rate.collected_at
      );
      return acc;
    }, {} as Record<string, any>)
  ).map(([_, stats]) => ({
    exchange: stats.exchange,
    token_count: stats.token_count,
    avg_funding_rate: stats.total_funding_rate / stats.token_count,
    latest_update: stats.latest_update,
  }));
}

export function useTop20(
  latestRates: FundingRate[],
  timeRange: TimeRange
): Top20Item[] {
  const [top20, setTop20] = useState<Top20Item[]>([]);

  useEffect(() => {
    const fetchTop20 = async () => {
      // 30d and custom are too expensive - too many API calls for all symbols
      if (timeRange === '30d' || timeRange === 'custom') {
        console.warn('Top20 list disabled for 30d/custom time range due to API performance');
        setTop20([]);
        return;
      }

      try {
        const hours = timeRange === '24h' ? 24 : 168; // Only 24h or 7d

        // Get unique symbols
        const symbols = Array.from(new Set(latestRates.map(r => r.symbol)));

        // Fetch historical data for all symbols
        const historicalData = await Promise.all(
          symbols.map(async (symbol) => {
            try {
              const data = await api.history(symbol, hours);
              return { symbol, data: data.data };
            } catch {
              return { symbol, data: [] };
            }
          })
        );

        // Calculate average funding rates
        const averages = historicalData
          .map(({ symbol, data }) => {
            if (data.length === 0) return null;

            // Group by exchange
            const byExchange = data.reduce((acc, point) => {
              if (!acc[point.exchange]) acc[point.exchange] = [];
              acc[point.exchange].push(point);
              return acc;
            }, {} as Record<string, HistoricalDataPoint[]>);

            return Object.entries(byExchange).map(([exchange, points]) => {
              const avgRate = points.reduce((sum, p) => sum + p.funding_rate_percent, 0) / points.length;
              const avgAnnualized = points.reduce((sum, p) => sum + p.annualized_rate, 0) / points.length;
              return {
                symbol,
                exchange,
                avg_funding_rate_percent: avgRate,
                annualized_rate: avgAnnualized,
              };
            });
          })
          .filter((item): item is Top20Item[] => item !== null)
          .flat()
          .sort((a, b) => b.avg_funding_rate_percent - a.avg_funding_rate_percent)
          .slice(0, 20);

        setTop20(averages);
      } catch (err) {
        console.error('Failed to fetch top 20:', err);
      }
    };

    if (latestRates.length > 0) {
      fetchTop20();
    }
  }, [latestRates, timeRange]);

  return top20;
}

export function useHistoricalChart(
  symbols: string[],
  exchanges: string[],
  timeRange: TimeRange,
  dateRange?: { startDate: string; endDate: string }
) {
  const [data, setData] = useState<HistoricalDataPoint[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (symbols.length === 0 || exchanges.length === 0) {
        setData([]);
        return;
      }

      try {
        setLoading(true);

        // Determine parameter to pass to API
        let apiParam: number | { startDate: string; endDate: string };

        if (timeRange === 'custom' && dateRange && dateRange.startDate && dateRange.endDate) {
          // Use date range for custom
          apiParam = dateRange;
        } else {
          // Use hours for predefined ranges
          const hours = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 720;
          apiParam = hours;
        }

        const allData = await Promise.all(
          symbols.map(async (symbol) => {
            try {
              const response = await api.history(symbol, apiParam);
              return response.data.filter((point) =>
                exchanges.includes(point.exchange)
              );
            } catch {
              return [];
            }
          })
        );

        setData(allData.flat());
      } catch (err) {
        console.error('Failed to fetch historical data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbols, exchanges, timeRange, dateRange?.startDate, dateRange?.endDate]);

  return { data, loading };
}
