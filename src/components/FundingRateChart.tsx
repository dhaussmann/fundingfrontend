import { useMemo, useState, useEffect } from 'react';
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
  { label: '3D', value: 3 * 24 * 60 * 60 * 1000 },
  { label: '7D', value: 7 * 24 * 60 * 60 * 1000 },
  { label: '14D', value: 14 * 24 * 60 * 60 * 1000 },
  { label: '30D', value: 30 * 24 * 60 * 60 * 1000 },
];

export function FundingRateChart({ data, loading }: FundingRateChartProps) {
  const [showMA, setShowMA] = useState(false);
  const [maWindow, setMaWindow] = useState(MA_WINDOWS[2].value); // Default: 24h
  const [visibleSeries, setVisibleSeries] = useState<Record<string, boolean>>({});
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

  // Initialize all series as visible when series change
  useEffect(() => {
    const initialVisible: Record<string, boolean> = {};
    series.forEach((key) => {
      initialVisible[key] = true;
    });
    setVisibleSeries(initialVisible);
  }, [series]);

  // Toggle series visibility
  const handleLegendClick = (seriesKey: string) => {
    setVisibleSeries((prev) => ({
      ...prev,
      [seriesKey]: !prev[seriesKey],
    }));
  };

  const formatXAxis = (timestamp: number) => {
    return format(timestamp, 'MMM dd HH:mm');
  };

  const formatYAxis = (value: number) => {
    return `${value.toFixed(3)}%`;
  };

  // Calculate MA overview for all series and all windows
  const maOverview = useMemo(() => {
    if (data.length === 0 || !showMA) return [];

    const overview: Array<{
      series: string;
      exchange: string;
      symbol: string;
      maValues: Record<string, number | null>;
    }> = [];

    series.forEach((seriesKey) => {
      const [exchange, symbol] = seriesKey.split('_');

      // Get all data points for this series, sorted by timestamp
      const seriesData = data
        .filter((point) => point.exchange === exchange && point.symbol === symbol)
        .sort((a, b) => a.timestamp - b.timestamp);

      if (seriesData.length === 0) return;

      const timestamps = seriesData.map((d) => d.timestamp);
      const values = seriesData.map((d) => d.funding_rate_percent);

      const maValues: Record<string, number | null> = {};

      // Calculate MA for entire range (last value of MA with full dataset window)
      const fullRangeMA = calculateMovingAverage(timestamps, values, timestamps[timestamps.length - 1] - timestamps[0]);
      maValues['Range'] = fullRangeMA[fullRangeMA.length - 1];

      // Calculate MA for each predefined window
      MA_WINDOWS.forEach((window) => {
        const ma = calculateMovingAverage(timestamps, values, window.value);
        // Take the last (most recent) MA value
        maValues[window.label] = ma[ma.length - 1];
      });

      overview.push({
        series: seriesKey,
        exchange,
        symbol,
        maValues,
      });
    });

    return overview;
  }, [data, series, showMA]);

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
              <div className="flex gap-2 flex-wrap">
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
                wrapperStyle={{ fontSize: '12px', cursor: 'pointer' }}
                onClick={(e) => {
                  if (e.dataKey) {
                    const baseKey = e.dataKey.toString().replace('_MA', '');
                    handleLegendClick(baseKey);
                  }
                }}
                formatter={(value) => {
                  const baseKey = value.toString().replace('_MA', '');
                  const isVisible = visibleSeries[baseKey] !== false;
                  const style = isVisible ? {} : { opacity: 0.4, textDecoration: 'line-through' };

                  if (value.toString().endsWith('_MA')) {
                    const [exchange, symbol] = baseKey.split('_');
                    const windowLabel = MA_WINDOWS.find(w => w.value === maWindow)?.label || '';
                    return <span style={style}>{`${symbol} (${exchange}) MA ${windowLabel}`}</span>;
                  }
                  const [exchange, symbol] = baseKey.split('_');
                  return <span style={style}>{`${symbol} (${exchange})`}</span>;
                }}
              />
              {series
                .filter((key) => visibleSeries[key] !== false)
                .map((key, index) => {
                  const originalIndex = series.indexOf(key);
                  return (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={COLORS[originalIndex % COLORS.length]}
                      strokeWidth={2}
                      dot={false}
                      name={key}
                      connectNulls
                    />
                  );
                })}
              {showMA && series
                .filter((key) => visibleSeries[key] !== false)
                .map((key, index) => {
                  const originalIndex = series.indexOf(key);
                  return (
                    <Line
                      key={`${key}_MA`}
                      type="monotone"
                      dataKey={`${key}_MA`}
                      stroke={COLORS[originalIndex % COLORS.length]}
                      strokeWidth={3}
                      strokeDasharray="5 5"
                      dot={false}
                      name={`${key}_MA`}
                      connectNulls
                    />
                  );
                })}
            </LineChart>
          </ResponsiveContainer>
        )}

        {/* MA Overview Table */}
        {showMA && maOverview.length > 0 && (
          <div className="mt-6 overflow-x-auto">
            <div className="text-xs text-muted-foreground text-right mb-2">
              * MA = Moving Average
            </div>
            {maOverview.map((item) => (
              <div key={item.series} className="mb-4">
                <div className="text-sm font-semibold mb-2">
                  {item.symbol} ({item.exchange})
                </div>
                <div className="rounded-lg border border-border bg-card overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="px-4 py-3 text-left font-medium">MA (Range)</th>
                        <th className="px-4 py-3 text-left font-medium">MA (24h)</th>
                        <th className="px-4 py-3 text-left font-medium">MA (3D)</th>
                        <th className="px-4 py-3 text-left font-medium">MA (7D)</th>
                        <th className="px-4 py-3 text-left font-medium">MA (14D)</th>
                        <th className="px-4 py-3 text-left font-medium">MA (30D)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="px-4 py-3">
                          {item.maValues['Range'] !== null && item.maValues['Range'] !== undefined
                            ? `${item.maValues['Range'].toFixed(4)}%`
                            : 'N/A'}
                        </td>
                        <td className="px-4 py-3">
                          {item.maValues['24h'] !== null && item.maValues['24h'] !== undefined
                            ? `${item.maValues['24h'].toFixed(4)}%`
                            : 'N/A'}
                        </td>
                        <td className="px-4 py-3">
                          {item.maValues['3D'] !== null && item.maValues['3D'] !== undefined
                            ? `${item.maValues['3D'].toFixed(4)}%`
                            : 'N/A'}
                        </td>
                        <td className="px-4 py-3">
                          {item.maValues['7D'] !== null && item.maValues['7D'] !== undefined
                            ? `${item.maValues['7D'].toFixed(4)}%`
                            : 'N/A'}
                        </td>
                        <td className="px-4 py-3">
                          {item.maValues['14D'] !== null && item.maValues['14D'] !== undefined
                            ? `${item.maValues['14D'].toFixed(4)}%`
                            : 'N/A'}
                        </td>
                        <td className="px-4 py-3">
                          {item.maValues['30D'] !== null && item.maValues['30D'] !== undefined
                            ? `${item.maValues['30D'].toFixed(4)}%`
                            : 'N/A'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
