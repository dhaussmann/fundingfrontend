# GitHub Actions CI/CD Setup

Diese Anleitung zeigt, wie du automatische Deployments bei jedem Git Push einrichtest.

## Übersicht

Mit GitHub Actions wird automatisch deployed:
- **Production**: Bei Push zu `main` oder `master` Branch
- **Preview**: Bei Push zu anderen Branches oder Pull Requests

## Setup-Schritte

### 1. Cloudflare API Token erstellen

1. Gehe zu [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Klicke auf dein Profil (oben rechts) → **My Profile** → **API Tokens**
3. Klicke auf **Create Token**
4. Wähle **Edit Cloudflare Workers** Template oder erstelle ein Custom Token:
   - **Permissions**:
     - Account → Workers Scripts → Edit
     - Account → Account Settings → Read (für Account ID)
   - **Account Resources**:
     - Include → Dein Account
5. Klicke **Continue to summary** → **Create Token**
6. **Kopiere den Token** (wird nur einmal angezeigt!)

### 2. Account ID finden

1. Gehe zu [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Wähle dein Account
3. Klicke auf **Workers & Pages** in der Sidebar
4. Deine **Account ID** steht auf der rechten Seite

### 3. GitHub Secrets hinzufügen

1. Gehe zu deinem GitHub Repository
2. **Settings** → **Secrets and variables** → **Actions**
3. Klicke auf **New repository secret**
4. Füge folgende Secrets hinzu:

   **CLOUDFLARE_API_TOKEN**
   ```
   [Dein API Token von Schritt 1]
   ```

   **CLOUDFLARE_ACCOUNT_ID**
   ```
   [Deine Account ID von Schritt 2]
   ```

### 4. Workflows aktiviert!

Die Workflows in `.github/workflows/` werden automatisch aktiv:

- **`deploy.yml`**: Deployed bei Push zu main/master
- **`preview.yml`**: Deployed Preview bei Feature Branches

## Workflow-Dateien

### deploy.yml (Production & Pull Request Previews)

```yaml
on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]
```

Dieser Workflow:
- Checkt den Code aus
- Installiert Dependencies (`npm ci`)
- Baut das Projekt (`npm run build`)
- Deployed mit Wrangler zu Cloudflare Workers
- Kommentiert automatisch PRs mit Preview-URL

### preview.yml (Feature Branch Previews)

```yaml
on:
  push:
    branches-ignore: [main, master]
```

Dieser Workflow deployed alle anderen Branches zur Preview-Umgebung.

## Testen

### Erster Push

Nach Setup:
```bash
git add .
git commit -m "Add CI/CD workflows"
git push
```

### Status überprüfen

1. Gehe zu deinem GitHub Repository
2. **Actions** Tab → Du siehst alle Workflow-Runs
3. Klicke auf einen Run für Details

### Deployment URL

Nach erfolgreichem Deployment:
- **Production**: `https://funding-rate-dashboard.workers.dev`
- **Preview**: `https://funding-rate-dashboard-preview.workers.dev`

Die genaue URL wird im Workflow-Log angezeigt.

## Deployment-Strategien

### Strategie 1: Automatisch bei jedem Push (aktuell)

✅ **Vorteile**:
- Sehr schnelles Feedback
- Immer aktuell
- Automatische Previews für PRs

⚠️ **Nachteile**:
- Jeder Push deployed (auch WIP commits)

### Strategie 2: Nur bei Tags/Releases

Ändere `.github/workflows/deploy.yml`:
```yaml
on:
  push:
    tags:
      - 'v*'
```

Deploy dann mit:
```bash
git tag v1.0.0
git push --tags
```

### Strategie 3: Manueller Trigger

Füge zu `.github/workflows/deploy.yml` hinzu:
```yaml
on:
  workflow_dispatch:
```

Dann kannst du im GitHub Actions Tab manuell deployen.

## Erweiterte Konfiguration

### Environment Secrets

Für verschiedene Environments:

1. **Settings** → **Environments**
2. Erstelle Environments: `production`, `preview`
3. Füge environment-spezifische Secrets hinzu
4. In Workflow referenzieren:
   ```yaml
   environment: production
   ```

### Deploy Notifications

Slack/Discord Notifications hinzufügen:

```yaml
- name: Notify Slack
  if: success()
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
    payload: |
      {
        "text": "✅ Deployment successful!"
      }
```

### Build-Cache optimieren

Vite build cachen:
```yaml
- name: Cache Vite build
  uses: actions/cache@v3
  with:
    path: |
      dist
      node_modules/.vite
    key: ${{ runner.os }}-vite-${{ hashFiles('**/package-lock.json') }}
```

## Troubleshooting

### "Authentication error"

→ Überprüfe `CLOUDFLARE_API_TOKEN` Secret

### "Account not found"

→ Überprüfe `CLOUDFLARE_ACCOUNT_ID` Secret

### "Build failed"

→ Teste Build lokal: `npm run build`

### Workflow läuft nicht

1. Überprüfe Branch-Namen in Workflow-Datei
2. Stelle sicher, dass Actions in Repo-Settings aktiviert sind
3. Überprüfe, dass `.github/workflows/` im Repository ist

## Lokales Deployment (weiterhin möglich)

GitHub Actions ersetzt nicht manuelles Deployment:

```bash
# Direkt deployen
npm run deploy

# Oder nur build
npm run build
wrangler deploy
```

## Kosten

GitHub Actions:
- ✅ **2.000 Minuten/Monat** gratis für Public Repos
- ✅ **Unbegrenzt** für Public Repos
- Deployment dauert ~2-3 Minuten

Cloudflare Workers:
- ✅ Siehe CLOUDFLARE_WORKERS_DEPLOYMENT.md

## Alternative: GitLab CI/CD

Für GitLab, erstelle `.gitlab-ci.yml`:

```yaml
image: node:20

stages:
  - deploy

deploy:
  stage: deploy
  only:
    - main
  script:
    - npm ci
    - npm run build
    - npm install -g wrangler
    - wrangler deploy
  variables:
    CLOUDFLARE_API_TOKEN: $CLOUDFLARE_API_TOKEN
    CLOUDFLARE_ACCOUNT_ID: $CLOUDFLARE_ACCOUNT_ID
```

## Nützliche Links

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Wrangler Action](https://github.com/cloudflare/wrangler-action)
- [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
