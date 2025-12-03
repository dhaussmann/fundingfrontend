# Cloudflare Workers Static Assets Deployment

## Übersicht

Dieses Projekt nutzt **Cloudflare Workers Static Assets** (GA seit 2025) für das Deployment. Dies ist die moderne Lösung für statische Sites und SPAs auf Cloudflare Workers.

## Voraussetzungen

- Cloudflare Account (kostenlos)
- Node.js 20+
- Wrangler CLI (`npm install -g wrangler`)

## Schnellstart

### 1. Wrangler CLI installieren

```bash
npm install -g wrangler
```

### 2. Bei Cloudflare anmelden

```bash
wrangler login
```

Dies öffnet einen Browser zur Authentifizierung.

### 3. Projekt builden und deployen

```bash
# Build erstellen
npm run build

# Zu Production deployen
npm run deploy

# Oder: Zu Preview-Umgebung deployen
npm run deploy:preview
```

## Konfiguration

Die Konfiguration erfolgt in `wrangler.toml`:

```toml
name = "funding-rate-dashboard"
compatibility_date = "2025-01-01"

[assets]
directory = "./dist"                           # Build-Verzeichnis
binding = "ASSETS"                             # Optional: Asset-Binding
not_found_handling = "single-page-application" # SPA-Routing
```

### Wichtige Optionen

**`not_found_handling = "single-page-application"`**
- Essentiell für React SPAs mit Client-Side Routing
- Gibt `index.html` für alle nicht übereinstimmenden Routen zurück
- Ermöglicht React Router, Vue Router, etc.

**`directory = "./dist"`**
- Das Verzeichnis mit den gebauten Dateien
- Vite erstellt dies automatisch bei `npm run build`

**`binding = "ASSETS"`** (Optional)
- Ermöglicht Zugriff auf Assets aus Worker-Code
- Nicht nötig für reine statische Sites

## Deployment-Befehle

### Production Deployment

```bash
npm run deploy
```

Dies führt aus:
1. `npm run build` - TypeScript kompilieren und Vite build
2. `wrangler deploy` - Upload zu Cloudflare Workers

### Preview Deployment

```bash
npm run deploy:preview
```

Deployed zu einer separaten Preview-Umgebung.

### Lokale Entwicklung mit Wrangler

```bash
npm run cf:dev
```

Startet einen lokalen Development Server mit Cloudflare Workers Emulation.

## API URL Konfiguration

Die API URL ist fest im Code gesetzt:
```typescript
// src/api/client.ts
const API_BASE_URL = 'https://funding-rate-collector.cloudflareone-demo-account.workers.dev';
```

Um eine andere URL zu verwenden, setze die Environment Variable vor dem Build:
```bash
VITE_API_URL=https://your-api.workers.dev npm run deploy
```

## Environment Variables im Worker

Variablen können in `wrangler.toml` unter `[env]` gesetzt werden:

```toml
[env.production]
name = "funding-rate-dashboard"
vars = { ENVIRONMENT = "production" }

[env.preview]
name = "funding-rate-dashboard-preview"
vars = { ENVIRONMENT = "preview" }
```

## Custom Domain

### Über Cloudflare Dashboard

1. Gehe zu **Workers & Pages** → Dein Worker
2. **Settings** → **Domains & Routes**
3. **Add Custom Domain**
4. Folge den DNS-Anweisungen

### Über Wrangler CLI

```bash
wrangler deploy --route "funding.example.com/*"
```

## Monitoring & Logs

### Logs in Echtzeit anzeigen

```bash
wrangler tail
```

### Deployment-Status prüfen

```bash
wrangler deployments list
```

### Analytics

- Dashboard: **Workers & Pages** → Dein Worker → **Analytics**
- Zeigt Requests, Errors, CPU-Zeit, etc.

## Workers Static Assets vs. Pages

| Feature | Workers Static Assets | Pages |
|---------|----------------------|-------|
| Deployment | CLI oder Dashboard | Git-Integration |
| Konfiguration | wrangler.toml | Dashboard UI |
| CI/CD | Manuell/Custom | Automatisch bei Git Push |
| Worker Code | Optional möglich | Functions (/functions) |
| Best für | Full-Stack Apps, API + Frontend | Reine Static Sites |

**Wir nutzen Workers Static Assets** weil:
- ✅ Mehr Kontrolle über Deployment
- ✅ Kann später einfach Worker-Code hinzufügen
- ✅ Konsistente CLI-basierte Workflows
- ✅ Keine Git-Integration nötig

## Troubleshooting

### Build schlägt fehl

```bash
# Dependencies neu installieren
rm -rf node_modules package-lock.json
npm install

# Build testen
npm run build
```

### Deployment schlägt fehl

```bash
# Wrangler neu einloggen
wrangler logout
wrangler login

# Deployment erneut versuchen
npm run deploy
```

### "Not authenticated" Fehler

```bash
wrangler login
```

### Worker läuft nicht wie erwartet

```bash
# Logs in Echtzeit ansehen
wrangler tail

# Lokale Entwicklung testen
npm run cf:dev
```

## Kosten

Cloudflare Workers **Free Plan**:
- ✅ 100.000 Requests pro Tag
- ✅ 10ms CPU-Zeit pro Request
- ✅ Unbegrenzte Bandbreite
- ✅ 25 GB Assets (Static Assets)
- ✅ Ausreichend für die meisten Projekte!

**Paid Plan** ($5/Monat):
- 10 Millionen Requests pro Monat inklusive
- 50ms CPU-Zeit pro Request
- Unbegrenzte Assets

## Nützliche Links

- [Cloudflare Workers Static Assets Docs](https://developers.cloudflare.com/workers/static-assets/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- [Interactive Wrangler Changelog](https://developers.cloudflare.com/changelog/2025-09-09-interactive-wrangler-assets/)

## Wichtige Dateien

- `wrangler.toml` - Worker Konfiguration
- `public/_redirects` - Zusätzliche Routing-Regeln (optional)
- `public/_headers` - Security & Cache Headers
- `.node-version` - Node.js 20 für Build
- `src/api/client.ts` - API URL Konfiguration

## Nächste Schritte

Nach erfolgreichem Deployment:

1. ✅ Teste die deployed App unter `*.workers.dev` URL
2. ✅ Konfiguriere Custom Domain (optional)
3. ✅ Setze Environment Variables für Production
4. ✅ Richte Monitoring/Alerts ein
5. ✅ Aktiviere Analytics im Dashboard
