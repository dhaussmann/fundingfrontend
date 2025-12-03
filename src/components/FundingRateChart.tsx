import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { HistoricalDataPoint } from '@/types';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { calculateMovingAverage } from '@/utils/movingAverage';

interface FundingRateChartProps {
  data: HistoricalDataPoint[];
  loading: boolean;
}

const COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#f59e0b', // amber
  '#10b981', // green
  '#ef4444', // red
  '#06b6d4', // cyan
  '#f97316', // orange
  '#ec4899', // pink
];

const MA_WINDOWS = [
  { label: '1h', value: 60 * 60 * 1000 },
  { label: '6h', value: 6 * 60 * 60 * 1000 },
  { label: '24h', value: 24 * 60 * 60 * 1000 },
  { label: '7d', value: 7 * 24 * 60 * 60 * 1000 },
];

export function FundingRateChart({ data, loading }: FundingRateChartProps) {
  const [showMA, setShowMA] = useState(false);
  const [maWindow, setMaWindow] = useState(MA_WINDOWS[2].value); // Default: 24h
  const chartData = useMemo(() => {
    if (data.length === 0) return [];

    // Group by timestamp
    const grouped = data.reduce((acc, point) => {
      const timestamp = point.timestamp;
      if (!acc[timestamp]) {
        acc[timestamp] = { timestamp };
      }
      const key = `${point.exchange}_${point.symbol}`;
      acc[timestamp][key] = point.funding_rate_percent;
      return acc;
    }, {} as Record<number, any>);

    const sortedData = Object.values(grouped).sort((a, b) => a.timestamp - b.timestamp);

    // Calculate moving averages if enabled
    if (showMA && sortedData.length > 0) {
      // Get all series keys
      const seriesKeys = new Set<string>();
      data.forEach((point) => {
        seriesKeys.add(`${point.exchange}_${point.symbol}`);
      });

      // Calculate MA for each series
      seriesKeys.forEach((seriesKey) => {
        // Extract timestamps and values for this series
        const seriesData = sortedData
          .map((d) => ({
            timestamp: d.timestamp,
            value: d[seriesKey] ?? null,
          }))
          .filter((d) => d.value !== null);

        if (seriesData.length > 0) {
          const timestamps = seriesData.map((d) => d.timestamp);
          const values = seriesData.map((d) => d.value);
          const maValues = calculateMovingAverage(timestamps, values, maWindow);

          // Add MA values back to chartData
          let maIndex = 0;
          sortedData.forEach((d) => {
            if (d[seriesKey] !== undefined) {
              d[`${seriesKey}_MA`] = maValues[maIndex];
              maIndex++;
            }
          });
        }
      });
    }

    return sortedData;
  }, [data, showMA, maWindow]);

  const series = useMemo(() => {
    if (data.length === 0) return [];
    const keys = new Set<string>();
    data.forEach((point) => {
      keys.add(`${point.exchange}_${point.symbol}`);
    });
    return Array.from(keys);
  }, [data]);

  const formatXAxis = (timestamp: number) => {
    return format(timestamp, 'MMM dd HH:mm');
  };

  const formatYAxis = (value: number) => {
    return `${value.toFixed(3)}%`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Funding Rate Verlauf
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="show-ma"
                checked={showMA}
                onCheckedChange={(checked) => setShowMA(checked as boolean)}
              />
              <label
                htmlFor="show-ma"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Moving Average
              </label>
            </div>
            {showMA && (
              <div className="flex gap-2">
                {MA_WINDOWS.map((window) => (
                  <Button
                    key={window.value}
                    variant={maWindow === window.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMaWindow(window.value)}
                  >
                    {window.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[500px] flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full"
            />
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-[500px] flex items-center justify-center text-muted-foreground">
            Wählen Sie Börsen und Token um den Chart anzuzeigen
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={500}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatXAxis}
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                tickFormatter={formatYAxis}
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
                labelFormatter={(timestamp) =>
                  format(timestamp as number, 'PPpp')
                }
                formatter={(value: number) => [`${value.toFixed(4)}%`, '']}
              />
              <Legend
                wrapperStyle={{ fontSize: '12px' }}
                formatter={(value) => {
                  if (value.endsWith('_MA')) {
                    const baseKey = value.replace('_MA', '');
                    const [exchange, symbol] = baseKey.split('_');
                    const windowLabel = MA_WINDOWS.find(w => w.value === maWindow)?.label || '';
                    return `${symbol} (${exchange}) MA ${windowLabel}`;
                  }
                  const [exchange, symbol] = value.split('_');
                  return `${symbol} (${exchange})`;
                }}
              />
              {series.map((key, index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                  name={key}
                  connectNulls
                />
              ))}
              {showMA && series.map((key, index) => (
                <Line
                  key={`${key}_MA`}
                  type="monotone"
                  dataKey={`${key}_MA`}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  dot={false}
                  name={`${key}_MA`}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
