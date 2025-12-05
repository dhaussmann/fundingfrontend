import { motion } from 'framer-motion';
import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { FundingRate, Top20Item, TimeRange, HistoricalDataPoint } from '@/types';
import { TrendingUp, TrendingDown, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { api } from '@/api/client';

interface Top20ListProps {
  latestRates: FundingRate[];
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  onTokenClick?: (symbol: string, exchange: string) => void;
}

export function Top20List({ latestRates, timeRange, onTimeRangeChange, onTokenClick }: Top20ListProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState<string>('all'); // 'all', 'custom', or exchange name
  const [selectedExchanges, setSelectedExchanges] = useState<Record<string, boolean>>({});
  const [top20Data, setTop20Data] = useState<Top20Item[]>([]);
  const [loading, setLoading] = useState(false);

  // Extract unique exchanges from latestRates
  const availableExchanges = useMemo(() => {
    const exchanges = new Set<string>();
    latestRates.forEach((rate) => exchanges.add(rate.exchange));
    return Array.from(exchanges).sort();
  }, [latestRates]);

  // Initialize all exchanges as selected when they change
  useEffect(() => {
    setSelectedExchanges((prev) => {
      const initial: Record<string, boolean> = {};
      availableExchanges.forEach((exchange) => {
        initial[exchange] = prev[exchange] !== undefined ? prev[exchange] : true;
      });
      return initial;
    });
  }, [availableExchanges]);

  // Fetch and calculate Top20 based on view mode and time range
  useEffect(() => {
    const fetchTop20 = async () => {
      if (timeRange === 'custom') {
        setTop20Data([]);
        return;
      }

      try {
        setLoading(true);

        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        if (timeRange === '24h') {
          startDate.setHours(startDate.getHours() - 24);
        } else if (timeRange === '7d') {
          startDate.setDate(startDate.getDate() - 7);
        } else if (timeRange === '30d') {
          startDate.setDate(startDate.getDate() - 30);
        }

        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];

        // Get symbols to fetch
        const symbols = Array.from(new Set(latestRates.map(r => r.symbol)));

        // Fetch historical data
        const historicalData = await Promise.all(
          symbols.map(async (symbol) => {
            try {
              const data = await api.history(symbol, { startDate: startDateStr, endDate: endDateStr });
              return { symbol, data: data.data };
            } catch (error) {
              return { symbol, data: [] };
            }
          })
        );

        // Determine which exchanges to include
        let targetExchanges: string[];
        if (viewMode === 'all') {
          targetExchanges = availableExchanges;
        } else if (viewMode === 'custom') {
          targetExchanges = availableExchanges.filter(ex => selectedExchanges[ex] !== false);
        } else {
          targetExchanges = [viewMode];
        }

        // Calculate averages for target exchanges only
        const averages = historicalData
          .map(({ symbol, data }) => {
            if (data.length === 0) return null;

            // Filter by target exchanges
            const filteredData = data.filter(point => targetExchanges.includes(point.exchange));
            if (filteredData.length === 0) return null;

            // Group by exchange
            const byExchange = filteredData.reduce((acc, point) => {
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

        setTop20Data(averages);
      } catch (err) {
        console.error('Failed to fetch top 20:', err);
      } finally {
        setLoading(false);
      }
    };

    if (latestRates.length > 0) {
      fetchTop20();
    }
  }, [latestRates, timeRange, viewMode, selectedExchanges, availableExchanges]);

  const toggleExchange = (exchange: string) => {
    setSelectedExchanges((prev) => ({
      ...prev,
      [exchange]: !prev[exchange],
    }));
  };

  // Render a single item
  const renderItem = (item: Top20Item, index: number) => (
    <motion.div
      key={`${item.symbol}-${item.exchange}-${index}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.02 }}
      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
      onClick={() => onTokenClick?.(item.symbol, item.exchange)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onTokenClick?.(item.symbol, item.exchange);
        }
      }}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
          {index + 1}
        </div>
        <div>
          <div className="font-semibold hover:text-primary transition-colors">{item.symbol}</div>
          <div className="text-xs text-muted-foreground capitalize">
            {item.exchange}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="flex items-center gap-1">
          {item.avg_funding_rate_percent >= 0 ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
          <span
            className={`font-bold ${
              item.avg_funding_rate_percent >= 0
                ? 'text-green-500'
                : 'text-red-500'
            }`}
          >
            {item.avg_funding_rate_percent.toFixed(4)}%
          </span>
        </div>
        <div className="text-xs text-muted-foreground">
          {item.annualized_rate.toFixed(2)}% p.a.
        </div>
      </div>
    </motion.div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Top 20 Funding Rates</CardTitle>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-muted rounded-md transition-colors"
            aria-label={isCollapsed ? 'Expand' : 'Collapse'}
          >
            {isCollapsed ? (
              <ChevronDown className="h-5 w-5" />
            ) : (
              <ChevronUp className="h-5 w-5" />
            )}
          </button>
        </div>
        {!isCollapsed && (
          <>
            <div className="flex flex-wrap items-center gap-4">
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v)}>
                <TabsList>
                  <TabsTrigger value="all">Alle</TabsTrigger>
                  {availableExchanges.map((exchange) => (
                    <TabsTrigger key={exchange} value={exchange} className="capitalize">
                      {exchange}
                    </TabsTrigger>
                  ))}
                  <TabsTrigger value="custom">Custom</TabsTrigger>
                </TabsList>
              </Tabs>
              <Tabs value={timeRange} onValueChange={(v) => onTimeRangeChange(v as TimeRange)}>
                <TabsList>
                  <TabsTrigger value="24h">24h</TabsTrigger>
                  <TabsTrigger value="7d">7d</TabsTrigger>
                  <TabsTrigger value="30d">30d</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            {viewMode === 'custom' && availableExchanges.length > 0 && (
              <div className="mt-4">
                <div className="text-sm font-medium mb-2">Börsen auswählen:</div>
                <div className="flex flex-wrap gap-3">
                  {availableExchanges.map((exchange) => (
                    <div key={exchange} className="flex items-center gap-2">
                      <Checkbox
                        id={`exchange-${exchange}`}
                        checked={selectedExchanges[exchange] !== false}
                        onCheckedChange={() => toggleExchange(exchange)}
                      />
                      <label
                        htmlFor={`exchange-${exchange}`}
                        className="text-sm capitalize cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {exchange}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardHeader>
      {!isCollapsed && (
        <CardContent>
          {timeRange === 'custom' ? (
            <div className="text-center text-muted-foreground py-8">
              <p className="font-medium">Custom Ansicht nicht verfügbar</p>
              <p className="text-sm mt-2">Bitte wähle 24h, 7d oder 30d für die Top 20 Liste</p>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {top20Data.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  Keine Daten verfügbar
                </div>
              ) : (
                top20Data.map((item, index) => renderItem(item, index))
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
