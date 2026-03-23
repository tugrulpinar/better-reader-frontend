# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## About

**Better Reader** is a fork of the open-source Açık Kuran Qur'an reading platform, rebranded and stripped of auth/membership features. It is a clean, ad-free Qur'an reader focused on reading and research — no login, no bookmarks, no user accounts.

Upstream source: [acikkuran/acikkuran-frontend](https://github.com/acikkuran/acikkuran-frontend)

## Tech Stack

- **Framework:** Next.js 14 (SSR/SSG), custom Express server on port 2018
- **Language:** JavaScript (no TypeScript)
- **Styling:** styled-components v5 with SSR, dark/light theme
- **State:** Recoil + recoil-persist, settings persisted to cookies
- **i18n:** next-i18next (Turkish `tr` / English `en`)
- **Data:** REST API at `NEXT_PUBLIC_API_URL` (defaults to `https://api.acikkuran.com`)
- **Package manager:** yarn (NOTE: system yarn may be very old — use `npm install` if `yarn install` fails)

## Commands

```bash
yarn install        # Install dependencies (Node 20.x required)
yarn dev            # Start dev server on port 2018
yarn build          # Production build
yarn start          # Start production server
yarn lint           # Run ESLint
yarn analyze        # Dev server with bundle analysis (ANALYZE=true)
yarn sitemap        # Generate SEO sitemaps
```

There is no test suite — the project has no automated tests.

## Docker Development

Run with Docker Compose for local development:

```bash
docker-compose up --build   # First run or after dependency changes
docker-compose up           # Subsequent runs (uses volume mount for hot-reload)
```

The container mounts the project directory at `/app` with hot-reload via `yarn dev`. After editing source files, changes reflect immediately. After changing `package.json` dependencies, a full rebuild (`--build`) is required.

## Environment Setup

Copy `.env.example` to `.env`. Key variables:

- `NEXT_PUBLIC_API_URL` — Quran data API (defaults to `https://api.acikkuran.com`)
- `NEXT_PUBLIC_LOCALE` — `tr` or `en`
- `NEXT_PUBLIC_DOMAIN_LOCALE_TR` / `NEXT_PUBLIC_DOMAIN_LOCALE_EN` — use `"localhost"` locally
- `NEXT_PUBLIC_ENVIRONMENT` — `"production"` or `"development"`
- `NEXT_PUBLIC_ANALYTICS_ID` — Google Analytics ID (optional)
- `RECOIL_DUPLICATE_ATOM_KEY_CHECKING_ENABLED=false` — keep this set

Auth/membership env vars (`NEXTAUTH_*`, `HASURA_*`, `REDIS_URL`, etc.) have been removed — they are no longer needed.

## What Was Removed (Auth/Membership)

The following were stripped from the upstream fork:

**Deleted files:**
- All `pages/api/` routes (auth, bookmarks, settings, scores, Redis ops)
- `components/modals/LoginModal.js`, `StatsModal.js`, `BookmarksModal.js`
- `hooks/useStreakTimer.js`
- `lib/sessionCookieControl.js`

**Removed dependencies:** `next-auth`, `graphql`, `graphql-request`, `ioredis`, `bcryptjs`, `mailgun.js`, `react-google-recaptcha-v3`, `react-idle-timer`, and related packages.

**Key changes:**
- `pages/_app.js` — `SessionProvider` removed; component renamed `BetterReader`
- `components/modals/SettingsModal.js` — Profile/History tabs removed; only display settings remain
- `components/modals/AuthorSelectionModal.js` — Saves to cookies only (no Hasura call)
- `recoil/atoms.js` — `streakState` removed
- `utils/funcs.js` — `handleBookmark` removed
- All surah/verse/page/root pages — `getServerSideProps` reads settings from cookies directly via `next-cookies`

## Architecture

### Routing & Pages

Next.js 14 with SSR/SSG. Key routes:

- `pages/[surah_id]/index.js` — Surah (chapter) page
- `pages/[surah_id]/[verse_number].js` — Individual verse page
- `pages/search.js` — Search
- `pages/root/[latin].js` — Root word analysis
- `pages/about.js` — About page
- `pages/privacy-policy.js` — Privacy policy

### State Management

Recoil atoms/selectors in `recoil/atoms.js` and `recoil/selectors.js`. State is persisted via `recoil-persist`. User display settings (author, show/hide arabic/transcription/translation, footnotes) are stored in a `settings` cookie and read in `getServerSideProps` via `next-cookies`.

### Styling

Styled-components (v5) with SSR support enabled in `next.config.js`. Theme (dark/light) defined in `styles/theme.js`. Global styles in `styles/global.style.js`. Page-specific styles live alongside their page in `styles/`.

### Internationalization

`next-i18next` with Turkish (`tr`) and English (`en`) support. Translation files in `public/locales/`. Config in `next-i18next.config.js` and `locales.config.js`. Branding strings ("Better Reader", URLs, social handles) live in `public/locales/{tr,en}/common.json`.

### Data Fetching

- Qur'an data: fetched from `NEXT_PUBLIC_API_URL` (REST API)
- No user data or authentication — all removed

### Custom Server

`server.js` is a custom Express wrapper around Next.js, primarily to serve service worker files. Runs on port 2018.

### Path Aliases

Configured in `jsconfig.json`:
- `@components/`, `@pages/`, `@styles/`, `@utils/`, `@hooks/`, `@recoil/`, `@lib/`, `@data/`, `@assets/`, `@api/`, `@auth/`

### Audio Player

`components/ui/Player.js` uses `react-h5-audio-player`. Player state is managed globally via `utils/playerProvider.js`.

### AMP

AMP variants of pages exist for SEO. AMP-specific components are in `components/amp/`.

## Branching Strategy

```
main (stable, deployable)
 └── feat/feature-name
```

Use conventional commits: `feat:`, `fix:`, `chore:`, `style:`, `refactor:`
