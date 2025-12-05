import { motion } from 'framer-motion';
import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Top20Item, TimeRange } from '@/types';
import { TrendingUp, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react';

interface Top20ListProps {
  top20: Top20Item[];
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  onTokenClick?: (symbol: string, exchange: string) => void;
}

export function Top20List({ top20, timeRange, onTimeRangeChange, onTokenClick }: Top20ListProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState<string>('all'); // 'all', 'custom', or exchange name
  const [selectedExchanges, setSelectedExchanges] = useState<Record<string, boolean>>({});

  // Extract unique exchanges from top20 data
  const availableExchanges = useMemo(() => {
    const exchanges = new Set<string>();
    top20.forEach((item) => exchanges.add(item.exchange));
    return Array.from(exchanges).sort();
  }, [top20]);

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

  // Prepare data for different view modes
  const viewData = useMemo(() => {
    if (viewMode === 'all') {
      // All exchanges: show top 20 across all exchanges
      return top20;
    } else if (viewMode === 'custom') {
      // Custom: show top 20 for selected exchanges only
      return top20.filter((item) => selectedExchanges[item.exchange] !== false);
    } else {
      // Specific exchange: show top 20 for that exchange only
      return top20.filter((item) => item.exchange === viewMode);
    }
  }, [viewMode, top20, selectedExchanges]);

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
            <div className="space-y-3">
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
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {viewData.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  {top20.length === 0 ? 'Lade Daten...' : 'Keine Daten verfügbar'}
                </div>
              ) : (
                viewData.map((item, index) => renderItem(item, index))
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
