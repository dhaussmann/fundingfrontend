import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExchangeStats } from '@/types';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ExchangeOverviewProps {
  stats: ExchangeStats[];
}

const EXCHANGE_COLORS: Record<string, string> = {
  hyperliquid: 'from-blue-500 to-cyan-500',
  lighter: 'from-purple-500 to-pink-500',
  aster: 'from-orange-500 to-red-500',
  binance: 'from-yellow-500 to-orange-500',
};

export function ExchangeOverview({ stats }: ExchangeOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.exchange}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="relative overflow-hidden">
            <div
              className={`absolute inset-0 bg-gradient-to-br ${
                EXCHANGE_COLORS[stat.exchange] || 'from-gray-500 to-gray-600'
              } opacity-10`}
            />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium capitalize">
                {stat.exchange}
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.token_count}</div>
              <p className="text-xs text-muted-foreground">
                Token verfügbar
              </p>
              <div className="flex items-center gap-1 mt-2">
                {stat.avg_funding_rate >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span
                  className={`text-xs font-medium ${
                    stat.avg_funding_rate >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {stat.avg_funding_rate.toFixed(4)}% Ø
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                aktualisiert {formatDistanceToNow(stat.latest_update, { addSuffix: true })}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
