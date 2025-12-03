import { useState } from 'react';
import { ExchangeOverview } from '@/components/ExchangeOverview';
import { Top20List } from '@/components/Top20List';
import { FundingRateChart } from '@/components/FundingRateChart';
import { FilterControls } from '@/components/FilterControls';
import {
  useFundingData,
  useExchangeStats,
  useTop20,
  useHistoricalChart,
} from '@/hooks/useFundingData';
import { TimeRange } from '@/types';
import { motion } from 'framer-motion';
import { LineChart, Loader2 } from 'lucide-react';

function App() {
  const { latestRates, loading, error } = useFundingData();
  const exchangeStats = useExchangeStats(latestRates);

  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [selectedExchanges, setSelectedExchanges] = useState<string[]>([]);
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);

  const top20 = useTop20(latestRates, timeRange);
  const { data: chartData, loading: chartLoading } = useHistoricalChart(
    selectedSymbols,
    selectedExchanges,
    timeRange
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Lade Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-destructive">Fehler: {error}</p>
          <p className="text-muted-foreground text-sm">
            Bitte überprüfen Sie die API-Konfiguration
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="border-b bg-card"
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <LineChart className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Funding Rate Dashboard</h1>
              <p className="text-muted-foreground text-sm">
                Live-Tracking von Funding Rates über mehrere Börsen
              </p>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Exchange Overview */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Börsen Übersicht</h2>
          <ExchangeOverview stats={exchangeStats} />
        </section>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Filters */}
          <div className="lg:col-span-1">
            <FilterControls
              selectedExchanges={selectedExchanges}
              selectedSymbols={selectedSymbols}
              timeRange={timeRange}
              onExchangesChange={setSelectedExchanges}
              onSymbolsChange={setSelectedSymbols}
              onTimeRangeChange={setTimeRange}
            />
          </div>

          {/* Right Column - Top 20 */}
          <div className="lg:col-span-2">
            <Top20List
              top20={top20}
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
            />
          </div>
        </div>

        {/* Full Width Chart */}
        <section>
          <FundingRateChart data={chartData} loading={chartLoading} />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-muted-foreground text-sm">
          <p>
            Funding Rate Collector Dashboard © {new Date().getFullYear()}
          </p>
          <p className="mt-1">
            Daten werden automatisch alle 60 Sekunden aktualisiert
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
