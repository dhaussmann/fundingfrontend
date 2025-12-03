# Funding Rate Dashboard

Ein modernes React-Dashboard zur Visualisierung von Funding Rates über mehrere Kryptobörsen.

## Features

- 📊 **Echtzeit-Daten**: Automatische Aktualisierung alle 60 Sekunden
- 🏦 **Multi-Exchange**: Unterstützung für Hyperliquid, Lighter, Aster und Binance
- 📈 **Interaktive Charts**: Verlaufsdiagramme mit Recharts
- 🎯 **Top 20 Rankings**: Die besten Funding Rates nach Zeitraum
- 🔍 **Flexible Filter**: Wählen Sie Börsen, Token und Zeiträume
- 🎨 **Modernes Design**: Tailwind CSS + shadcn/ui
- ⚡ **Schnell**: Vite + React + TypeScript

## Tech Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Sprache**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **Animationen**: Framer Motion
- **Icons**: Lucide React
- **Utilities**: date-fns, clsx, tailwind-merge

## Installation

```bash
# Dependencies installieren
npm install

# Development Server starten
npm run dev

# Production Build
npm run build

# Preview Production Build
npm run preview
```

## Konfiguration

Erstellen Sie eine `.env` Datei basierend auf `.env.example`:

```env
VITE_API_URL=https://your-worker.workers.dev
```

Wenn keine `VITE_API_URL` gesetzt ist, wird automatisch `/api` als Proxy verwendet.

## Development

Der Development Server läuft standardmäßig auf `http://localhost:3000`.

API-Anfragen werden automatisch an die konfigurierte `VITE_API_URL` weitergeleitet, oder über den Vite-Proxy an `http://localhost:8787` (lokaler Cloudflare Worker).

## Deployment

### Statisches Hosting (Vercel, Netlify, etc.)

```bash
npm run build
```

Die Build-Artefakte werden im `dist/` Verzeichnis erstellt.

### Cloudflare Pages

Das Projekt kann direkt auf Cloudflare Pages deployed werden:

1. Repository mit GitHub verbinden
2. Build Command: `npm run build`
3. Build Output Directory: `dist`
4. Environment Variable setzen: `VITE_API_URL`

## API Endpoints

Das Frontend kommuniziert mit folgenden API-Endpoints:

- `GET /latest` - Neueste Funding Rates
- `GET /history?symbol={symbol}&hours={hours}` - Historische Daten
- `GET /stats` - Statistiken
- `GET /compare?symbol={symbol}` - Vergleich über Börsen

## Features im Detail

### Exchange Overview
Zeigt für jede Börse:
- Anzahl verfügbarer Token
- Durchschnittliche Funding Rate
- Letzte Aktualisierung

### Top 20 Liste
- Beste Funding Rates nach Zeitraum (24h, 7d, 30d)
- Durchschnittliche Funding Rate
- Annualisierte Rate

### Interaktiver Chart
- Multi-Exchange Vergleich
- Multi-Token Auswahl
- Zeitraum-Filter (24h, 7d, 30d)
- Farbcodierte Linien pro Exchange/Token Kombination

### Filter
- Börsen-Auswahl (Checkbox)
- Token-Suche und -Auswahl
- Zeitraum-Schnellauswahl
- Bulk-Aktionen (Alle/Keine)

## Projektstruktur

```
frontend/
├── src/
│   ├── api/              # API Client
│   ├── components/       # React Komponenten
│   │   └── ui/          # shadcn/ui Komponenten
│   ├── hooks/           # Custom React Hooks
│   ├── lib/             # Utilities
│   ├── types/           # TypeScript Types
│   ├── App.tsx          # Haupt-App Komponente
│   ├── main.tsx         # Entry Point
│   └── index.css        # Global Styles
├── public/              # Statische Assets
├── index.html           # HTML Template
├── vite.config.ts       # Vite Konfiguration
├── tailwind.config.js   # Tailwind Konfiguration
├── tsconfig.json        # TypeScript Konfiguration
└── package.json         # Dependencies
```

## Browser Support

- Chrome/Edge (letzte 2 Versionen)
- Firefox (letzte 2 Versionen)
- Safari (letzte 2 Versionen)

## License

MIT
