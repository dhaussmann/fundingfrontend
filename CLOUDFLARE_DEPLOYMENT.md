# Cloudflare Pages Deployment Guide

## Übersicht

Dieses Projekt ist für das Deployment auf **Cloudflare Pages** optimiert.

## Voraussetzungen

- Cloudflare Account (kostenlos)
- Git Repository (GitHub, GitLab, oder Bitbucket)
- Node.js 20+ lokal für Tests

## Deployment-Methoden

### Methode 1: Automatisches Deployment über Git (Empfohlen)

1. **Repository verbinden**
   - Gehe zu [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Navigiere zu **Pages** → **Create a project**
   - Verbinde dein Git-Repository (GitHub/GitLab)
   - Wähle dieses Repository aus

2. **Build-Einstellungen konfigurieren**
   ```
   Framework preset: Vite
   Build command: npm run build
   Build output directory: dist
   Root directory: (leave empty or /)
   ```

3. **Environment Variables setzen (Optional)**
   - Die API URL ist bereits im Code gesetzt: `https://funding-rate-collector.cloudflareone-demo-account.workers.dev`
   - Um eine andere API URL zu verwenden, setze die Environment Variable:
     ```
     VITE_API_URL = https://your-backend-api.workers.dev
     ```

4. **Deployment starten**
   - Klicke auf **Save and Deploy**
   - Jeder Push zu deinem Repository triggert automatisch ein neues Deployment

### Methode 2: Manuelles Deployment mit Wrangler CLI

1. **Wrangler CLI installieren**
   ```bash
   npm install -g wrangler
   ```

2. **Bei Cloudflare anmelden**
   ```bash
   wrangler login
   ```

3. **Projekt builden**
   ```bash
   npm run build
   ```

4. **Auf Cloudflare Pages deployen**
   ```bash
   wrangler pages deploy dist --project-name=funding-rate-dashboard
   ```

5. **Environment Variables setzen (einmalig)**
   ```bash
   wrangler pages secret put VITE_API_URL --project-name=funding-rate-dashboard
   # Wenn prompt erscheint, eingeben: https://your-backend-api.workers.dev
   ```

## Wichtige Dateien

- `public/_redirects` - Routing für Single Page Application
- `public/_headers` - Security und Cache Headers
- `.node-version` - Node.js 20 für Build-Umgebung
- `src/api/client.ts` - API URL Konfiguration

## Environment Variables

### VITE_API_URL (Optional)

Die API URL ist standardmäßig auf `https://funding-rate-collector.cloudflareone-demo-account.workers.dev` gesetzt.

Um eine andere API URL zu verwenden:
1. Pages → Dein Projekt → **Settings** → **Environment variables**
2. Füge `VITE_API_URL` hinzu
3. Setze den gewünschten Wert für **Production** und/oder **Preview**

Beispiele:
- **Production**: `https://funding-api.your-domain.workers.dev`
- **Preview/Staging**: `https://funding-api-staging.your-domain.workers.dev`
- **Development**: Der Vite Proxy leitet zu `localhost:8787` weiter (siehe vite.config.ts)

## Custom Domain (Optional)

1. Gehe zu deinem Pages Projekt
2. **Custom domains** → **Set up a custom domain**
3. Füge deine Domain hinzu (z.B. `funding.beispiel.de`)
4. Folge den DNS-Anweisungen
5. SSL/TLS wird automatisch von Cloudflare bereitgestellt

## Continuous Deployment

Cloudflare Pages deployed automatisch:
- **Production** - Bei jedem Push zum Main/Master Branch
- **Preview** - Bei jedem Push zu Feature Branches
- **Pull Request Previews** - Für jeden Pull Request

## Lokale Preview des Production Builds

```bash
# Build erstellen
npm run build

# Preview Server starten
npm run preview

# Oder mit Wrangler
wrangler pages dev dist
```

## Troubleshooting

### Build schlägt fehl

1. Überprüfe Node.js Version (sollte 20+ sein)
   ```bash
   node --version
   ```

2. Lösche `node_modules` und installiere neu
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. Teste Build lokal
   ```bash
   npm run build
   ```

### API Requests schlagen fehl

1. Überprüfe `VITE_API_URL` Environment Variable
2. Stelle sicher, dass CORS auf dem Backend korrekt konfiguriert ist
3. Überprüfe die Browser Console für Fehler

### 404 bei Routing

- Stelle sicher, dass `public/_redirects` existiert und korrekt ist
- Die Datei wird automatisch beim Build in `dist/` kopiert

## Performance-Optimierung

Cloudflare Pages bietet automatisch:
- ✅ Global CDN (über 300 Standorte weltweit)
- ✅ HTTP/3 und QUIC Support
- ✅ Brotli Kompression
- ✅ Smart Routing
- ✅ DDoS Protection
- ✅ Unbegrenzte Bandbreite

## Kosten

Cloudflare Pages **Free Plan**:
- 500 Builds pro Monat
- Unbegrenzte Requests
- Unbegrenzte Bandbreite
- 1 Build gleichzeitig
- Mehr als ausreichend für die meisten Projekte!

## Nützliche Links

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)

## Nächste Schritte

Nach erfolgreichem Deployment:

1. ✅ Teste die deployed App unter der Pages URL
2. ✅ Konfiguriere Custom Domain (optional)
3. ✅ Setze Environment Variables für Production
4. ✅ Teste API-Verbindung zum Backend
5. ✅ Richte Analytics ein (Cloudflare Web Analytics)
