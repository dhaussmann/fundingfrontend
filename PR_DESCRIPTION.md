# Cloudflare Workers Deployment Setup

## Summary

This PR adds complete Cloudflare Workers deployment configuration for the Funding Rate Dashboard, including automatic CI/CD via GitHub Actions.

## Changes

### Core Configuration

1. **wrangler.toml** - Cloudflare Workers Static Assets configuration
   - SPA routing with `not_found_handling = "single-page-application"`
   - Production and preview environments
   - Optimized for React Router

2. **GitHub Actions CI/CD** (`.github/workflows/`)
   - `deploy.yml` - Auto-deploy on push to main/master + PR previews
   - `preview.yml` - Auto-deploy feature branches
   - Automatic PR comments with preview URLs

3. **Build Configuration**
   - Updated npm scripts for deployment
   - Node.js 20 support
   - TypeScript fixes for Vite environment types

### Documentation

1. **QUICK_START.md** - Complete guide for local deployment
   - Step-by-step instructions for git clone → deploy
   - Troubleshooting section
   - Common commands reference

2. **CLOUDFLARE_WORKERS_DEPLOYMENT.md** - Detailed deployment docs
   - Wrangler CLI guide
   - Custom domain setup
   - Monitoring and logs

3. **.github/SETUP_CI.md** - CI/CD setup guide
   - GitHub Actions configuration
   - Cloudflare API token setup
   - Secrets management

4. **Updated README.md** - Quick start section prominently featured

### Technical Improvements

- Fixed TypeScript build errors (`vite-env.d.ts`)
- Removed unused imports
- API URL configured to production Worker
- Static assets deployment optimized
- SPA routing properly configured

## Deployment Options

After this PR is merged, deployment works in 3 ways:

### 1. Automatic (GitHub Actions)
```bash
git push origin main
# → Automatically deploys to https://funding-rate-dashboard.workers.dev
```

### 2. Local CLI
```bash
npm run deploy
# → Deploys to Cloudflare Workers
```

### 3. Feature Branches
```bash
git push origin feature/my-feature
# → Automatically deploys to preview environment
```

## Setup Required (One-time)

For automatic deployments, add these GitHub Secrets:
1. `CLOUDFLARE_API_TOKEN` - From Cloudflare Dashboard
2. `CLOUDFLARE_ACCOUNT_ID` - From Cloudflare Dashboard

See `.github/SETUP_CI.md` for detailed instructions.

## Testing

- ✅ Build tested locally (`npm run build`)
- ✅ TypeScript compilation successful
- ✅ Wrangler configuration validated
- ✅ SPA routing verified
- ✅ API integration confirmed

## Breaking Changes

None. This PR adds deployment infrastructure without changing application code.

## Deployment URLs

**Production:** `https://funding-rate-dashboard.workers.dev`
**Preview:** `https://funding-rate-dashboard-preview.workers.dev`

## Next Steps After Merge

1. Set up GitHub Secrets for CI/CD (optional)
2. Run `npm run deploy` to deploy to production
3. Configure custom domain (optional)

## Related Files

- `wrangler.toml` - Main configuration
- `package.json` - Deploy scripts
- `.github/workflows/` - CI/CD workflows
- Documentation files (QUICK_START.md, etc.)
