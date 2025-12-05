import { useState } from 'react';
import { ExchangeOverview } from '@/components/ExchangeOverview';
import { Top20List } from '@/components/Top20List';
import { FundingRateChart } from '@/components/FundingRateChart';
import { FilterControls } from '@/components/FilterControls';
import {
  useFundingData,
  useExchangeStats,
  useHistoricalChart,
} from '@/hooks/useFundingData';
import { TimeRange } from '@/types';
import { motion } from 'framer-motion';
import { LineChart, Loader2 } from 'lucide-react';

function App() {
  const { latestRates, loading, error } = useFundingData();
  const exchangeStats = useExchangeStats(latestRates);

  const [chartTimeRange, setChartTimeRange] = useState<TimeRange>('24h');
  const [top20TimeRange, setTop20TimeRange] = useState<TimeRange>('24h');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedExchanges, setSelectedExchanges] = useState<string[]>([]);
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);

  const { data: chartData, loading: chartLoading } = useHistoricalChart(
    selectedSymbols,
    selectedExchanges,
    chartTimeRange,
    chartTimeRange === 'custom' ? { startDate, endDate } : undefined
  );

  const handleTokenClick = (symbol: string, exchange: string) => {
    // Add token to selectedSymbols if not already selected
    if (!selectedSymbols.includes(symbol)) {
      setSelectedSymbols([...selectedSymbols, symbol]);
    }

    // Add exchange to selectedExchanges if not already selected
    if (!selectedExchanges.includes(exchange)) {
      setSelectedExchanges([...selectedExchanges, exchange]);
    }

    // Scroll to chart
    setTimeout(() => {
      const chartElement = document.getElementById('funding-chart');
      if (chartElement) {
        chartElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

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
              timeRange={chartTimeRange}
              startDate={startDate}
              endDate={endDate}
              onExchangesChange={setSelectedExchanges}
              onSymbolsChange={setSelectedSymbols}
              onTimeRangeChange={setChartTimeRange}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
            />
          </div>

          {/* Right Column - Top 20 */}
          <div className="lg:col-span-2">
            <Top20List
              latestRates={latestRates}
              timeRange={top20TimeRange}
              onTimeRangeChange={setTop20TimeRange}
              onTokenClick={handleTokenClick}
            />
          </div>
        </div>

        {/* Full Width Chart */}
        <section id="funding-chart">
          <FundingRateChart data={chartData} loading={chartLoading} />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-muted-foreground text-sm">
          <p>
            Funding Rate Collector Dashboard © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
