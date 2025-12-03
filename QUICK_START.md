# 🚀 Quick Start: Lokales Deployment zu Cloudflare Workers

Diese Anleitung zeigt dir, wie du das Projekt von GitHub lädst und lokal zu Cloudflare Workers deployest.

## Voraussetzungen

- Node.js 20+ installiert ([Download](https://nodejs.org/))
- Git installiert
- Cloudflare Account (kostenlos: [dash.cloudflare.com](https://dash.cloudflare.com))

## Schritt-für-Schritt Anleitung

### 1. Projekt von GitHub klonen

```bash
# Repository klonen
git clone https://github.com/dhaussmann/fundingfrontend.git

# In das Projektverzeichnis wechseln
cd fundingfrontend
```

### 2. Dependencies installieren

```bash
npm install
```

Dies installiert alle benötigten Pakete (React, Vite, TypeScript, etc.)

### 3. Wrangler CLI global installieren

```bash
npm install -g wrangler
```

Wrangler ist das offizielle Cloudflare CLI-Tool für Workers.

### 4. Bei Cloudflare anmelden

```bash
wrangler login
```

Dies öffnet deinen Browser:
- Klicke auf **"Allow"**
- Du wirst automatisch authentifiziert
- Schließe den Browser-Tab, wenn "You have granted authorization" erscheint

### 5. Projekt bauen

```bash
npm run build
```

Dies erstellt die Production-Version in `dist/`:
- TypeScript wird kompiliert
- Vite baut und optimiert alles
- Alle Assets werden in `dist/` abgelegt

### 6. Zu Cloudflare Workers deployen

```bash
wrangler deploy
```

Das war's! 🎉

Wrangler wird:
- Die `wrangler.toml` lesen
- Den `dist/` Ordner hochladen
- Deine App deployen
- Dir die URL ausgeben (z.B. `https://funding-rate-dashboard.workers.dev`)

## Schnell-Befehl (alles in einem)

Nach dem ersten Setup kannst du einfach ausführen:

```bash
npm run deploy
```

Dieser Befehl führt automatisch aus:
1. `npm run build` - Projekt bauen
2. `wrangler deploy` - Zu Cloudflare deployen

## Deployment URLs

Nach erfolgreichem Deployment erhältst du:

**Production:**
```
https://funding-rate-dashboard.workers.dev
```

**Preview (optional):**
```bash
npm run deploy:preview
# Deployed zu: https://funding-rate-dashboard-preview.workers.dev
```

## Lokale Entwicklung

### Development Server (Vite)

```bash
npm run dev
```

Öffne http://localhost:3000
- Hot Module Reload
- API läuft gegen: https://funding-rate-collector.cloudflareone-demo-account.workers.dev

### Lokaler Cloudflare Workers Emulator

```bash
npm run cf:dev
```

Testet die App mit Cloudflare Workers Umgebung lokal.

## Projekt-Struktur

```
fundingfrontend/
├── src/                    # React Source Code
│   ├── components/         # UI Komponenten
│   ├── api/               # API Client
│   ├── hooks/             # Custom React Hooks
│   └── types/             # TypeScript Types
├── public/                # Statische Assets
│   ├── _headers           # Cloudflare Headers
│   └── _redirects         # SPA Routing
├── dist/                  # Build Output (nach npm run build)
├── wrangler.toml          # Cloudflare Workers Konfiguration
├── package.json           # Dependencies & Scripts
└── vite.config.ts         # Vite Build Config
```

## Wichtige Dateien

### wrangler.toml

```toml
name = "funding-rate-dashboard"
compatibility_date = "2025-01-01"

[assets]
directory = "./dist"
not_found_handling = "single-page-application"
```

**Was bedeutet das?**
- `name`: Der Name deines Workers
- `directory`: Wo die gebauten Dateien liegen
- `not_found_handling = "single-page-application"`: Leitet alle Routen zu `index.html` (wichtig für React Router)

### package.json - Deploy Scripts

```json
{
  "scripts": {
    "deploy": "npm run build && wrangler deploy",
    "deploy:preview": "npm run build && wrangler deploy --env preview"
  }
}
```

## Häufige Befehle

```bash
# Entwicklung
npm run dev              # Vite dev server starten
npm run build           # Production build erstellen
npm run preview         # Build lokal testen

# Deployment
npm run deploy          # Build + Deploy zu Production
npm run deploy:preview  # Build + Deploy zu Preview
wrangler deploy         # Nur deployen (ohne Build)

# Cloudflare Workers
wrangler login          # Bei Cloudflare anmelden
wrangler logout         # Abmelden
wrangler tail          # Live-Logs anzeigen
wrangler deployments list  # Deployment-Historie
```

## Updates deployen

Wenn du Änderungen am Code machst:

```bash
# 1. Änderungen machen (z.B. in src/App.tsx)

# 2. Testen
npm run dev

# 3. Bauen und deployen
npm run deploy

# 4. (Optional) Code committen
git add .
git commit -m "Update feature"
git push
```

## Troubleshooting

### "Not authenticated"

```bash
wrangler logout
wrangler login
```

### "Build failed"

```bash
# Dependencies neu installieren
rm -rf node_modules package-lock.json
npm install
npm run build
```

### "Error deploying to Cloudflare"

Überprüfe:
- Bist du eingeloggt? `wrangler whoami`
- Existiert `dist/`? `ls dist/`
- Ist `wrangler.toml` korrekt?

### Andere Node.js Version

```bash
# Node Version prüfen
node --version

# Sollte 20+ sein
# Falls nicht, installiere Node.js 20+
```

## Custom Domain (Optional)

### Über Cloudflare Dashboard

1. Gehe zu [dash.cloudflare.com](https://dash.cloudflare.com)
2. **Workers & Pages** → Dein Worker → **Settings** → **Domains & Routes**
3. **Add Custom Domain** → z.B. `funding.example.com`
4. Folge den DNS-Anweisungen

### Über CLI

```bash
wrangler deploy --route "funding.example.com/*"
```

## Worker Name ändern

In `wrangler.toml`:

```toml
name = "mein-eigener-name"
```

Dann neu deployen:

```bash
npm run deploy
```

Die URL wird: `https://mein-eigener-name.workers.dev`

## Kosten

Cloudflare Workers **Free Plan:**
- ✅ 100.000 Requests/Tag
- ✅ Unbegrenzte Bandbreite
- ✅ 25 GB Static Assets
- ✅ Völlig ausreichend für die meisten Projekte!

## Support & Dokumentation

- **Cloudflare Workers Docs**: https://developers.cloudflare.com/workers/
- **Static Assets Guide**: https://developers.cloudflare.com/workers/static-assets/
- **Wrangler CLI Docs**: https://developers.cloudflare.com/workers/wrangler/

## Zusammenfassung

```bash
# Einmalig
git clone https://github.com/dhaussmann/fundingfrontend.git
cd fundingfrontend
npm install
npm install -g wrangler
wrangler login

# Jedes Deployment
npm run deploy

# Fertig! ✅
```

Deine App ist jetzt live auf Cloudflare Workers! 🎉
