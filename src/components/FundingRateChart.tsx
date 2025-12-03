import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

export function FundingRateChart({ data, loading }: FundingRateChartProps) {
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

    return Object.values(grouped).sort((a, b) => a.timestamp - b.timestamp);
  }, [data]);

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
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Funding Rate Verlauf
        </CardTitle>
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
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
