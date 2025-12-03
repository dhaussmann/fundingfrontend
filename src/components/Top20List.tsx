import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Top20Item, TimeRange } from '@/types';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Top20ListProps {
  top20: Top20Item[];
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  onTokenClick?: (symbol: string, exchange: string) => void;
}

export function Top20List({ top20, timeRange, onTimeRangeChange, onTokenClick }: Top20ListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 20 Funding Rates</CardTitle>
        <Tabs value={timeRange} onValueChange={(v) => onTimeRangeChange(v as TimeRange)}>
          <TabsList>
            <TabsTrigger value="24h">24h</TabsTrigger>
            <TabsTrigger value="7d">7d</TabsTrigger>
            <TabsTrigger value="30d">30d</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {(timeRange === '30d' || timeRange === 'custom') ? (
            <div className="text-center text-muted-foreground py-8">
              <p className="font-medium">Ansicht nicht verfügbar</p>
              <p className="text-sm mt-2">Bitte wähle 24h oder 7d für die Top 20 Liste</p>
            </div>
          ) : top20.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Lade Daten...
            </div>
          ) : (
            top20.map((item, index) => (
              <motion.div
                key={`${item.symbol}-${item.exchange}`}
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
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
