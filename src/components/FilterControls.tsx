import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { TimeRange } from '@/types';
import { api } from '@/api/client';
import { Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FilterControlsProps {
  selectedExchanges: string[];
  selectedSymbols: string[];
  timeRange: TimeRange;
  onExchangesChange: (exchanges: string[]) => void;
  onSymbolsChange: (symbols: string[]) => void;
  onTimeRangeChange: (range: TimeRange) => void;
}

export function FilterControls({
  selectedExchanges,
  selectedSymbols,
  timeRange,
  onExchangesChange,
  onSymbolsChange,
  onTimeRangeChange,
}: FilterControlsProps) {
  const [exchanges, setExchanges] = useState<string[]>([]);
  const [symbols, setSymbols] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [exchangesList, symbolsList] = await Promise.all([
          api.getExchanges(),
          api.getSymbols(),
        ]);
        setExchanges(exchangesList);
        setSymbols(symbolsList);
      } catch (err) {
        console.error('Failed to fetch filters:', err);
      }
    };
    fetchFilters();
  }, []);

  const filteredSymbols = symbols.filter((symbol) =>
    symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleExchange = (exchange: string) => {
    if (selectedExchanges.includes(exchange)) {
      onExchangesChange(selectedExchanges.filter((e) => e !== exchange));
    } else {
      onExchangesChange([...selectedExchanges, exchange]);
    }
  };

  const toggleSymbol = (symbol: string) => {
    if (selectedSymbols.includes(symbol)) {
      onSymbolsChange(selectedSymbols.filter((s) => s !== symbol));
    } else {
      onSymbolsChange([...selectedSymbols, symbol]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? <X className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent className="space-y-6">
              {/* Zeitraum */}
              <div>
                <h3 className="font-semibold mb-3">Zeitraum</h3>
                <div className="flex gap-2">
                  {(['24h', '7d', '30d'] as TimeRange[]).map((range) => (
                    <Button
                      key={range}
                      variant={timeRange === range ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onTimeRangeChange(range)}
                    >
                      {range}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Börsen */}
              <div>
                <h3 className="font-semibold mb-3">Börsen</h3>
                <div className="space-y-2">
                  {exchanges.map((exchange) => (
                    <div key={exchange} className="flex items-center space-x-2">
                      <Checkbox
                        id={`exchange-${exchange}`}
                        checked={selectedExchanges.includes(exchange)}
                        onCheckedChange={() => toggleExchange(exchange)}
                      />
                      <label
                        htmlFor={`exchange-${exchange}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize cursor-pointer"
                      >
                        {exchange}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Token */}
              <div>
                <h3 className="font-semibold mb-3">Token</h3>
                <input
                  type="text"
                  placeholder="Token suchen..."
                  className="w-full px-3 py-2 mb-3 rounded-md border border-input bg-background text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {filteredSymbols.map((symbol) => (
                    <div key={symbol} className="flex items-center space-x-2">
                      <Checkbox
                        id={`symbol-${symbol}`}
                        checked={selectedSymbols.includes(symbol)}
                        onCheckedChange={() => toggleSymbol(symbol)}
                      />
                      <label
                        htmlFor={`symbol-${symbol}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {symbol}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onExchangesChange(exchanges)}
                >
                  Alle Börsen
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onExchangesChange([])}
                >
                  Keine
                </Button>
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
