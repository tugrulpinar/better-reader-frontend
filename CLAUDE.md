# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## About

Açık Kuran is an open-source, ad-free Qur'an reading platform. The Turkish version runs at acikkuran.com and the English version at quran.so. It is non-profit and unaffiliated with any organization.

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

## Environment Setup

Copy `.env.example` to `.env`. Key variables:

- `NEXT_PUBLIC_API_URL` — Quran data API (defaults to `https://api.acikkuran.com`)
- `NEXT_PUBLIC_LOCALE` — `tr` or `en`
- `NEXT_PUBLIC_DOMAIN_LOCALE_TR` / `NEXT_PUBLIC_DOMAIN_LOCALE_EN` — use `"localhost"` locally
- `NEXTAUTH_URL` — set to `http://localhost:2018`
- `HASURA_API_ENDPOINT` / `HASURA_ADMIN_SECRET` — required for auth/membership features
- `REDIS_URL` — required for session caching
- `RECOIL_DUPLICATE_ATOM_KEY_CHECKING_ENABLED=false` — keep this set

Membership-related API routes (`/api/`) require Hasura integration. Without it, the app still loads Qur'an content.

## Architecture

### Routing & Pages

Next.js 14 with SSR/SSG. Key routes:

- `pages/[surah_id]/index.js` — Surah (chapter) page
- `pages/[surah_id]/[verse_number].js` — Individual verse page
- `pages/search.js` — Search
- `pages/root/[id].js` — Root word analysis
- `pages/api/` — Backend API routes (auth, bookmarks, settings, user scores)

### State Management

Recoil atoms/selectors in `recoil/atoms.js` and `recoil/selectors.js`. State is persisted via `recoil-persist`. The `_app.js` wraps the app in `RecoilRoot` and `SessionProvider` (NextAuth).

### Styling

Styled-components (v5) with SSR support enabled in `next.config.js`. Theme (dark/light) defined in `styles/theme.js`. Global styles in `styles/global.style.js`. Page-specific styles live alongside their page in `styles/`.

### Internationalization

`next-i18next` with Turkish (`tr`) and English (`en`) support. Translation files in `public/locales/`. Domain-based locale routing: Turkish on acikkuran.com, English on quran.so. Config in `next-i18next.config.js` and `locales.config.js`.

### Data Fetching

- Qur'an data: fetched from `NEXT_PUBLIC_API_URL` (REST API)
- User data: GraphQL via `graphql-request` to Hasura
- Authentication: NextAuth with Google OAuth and email magic link (Mailgun)

### Custom Server

`server.js` is a custom Express wrapper around Next.js, primarily to serve service worker files. Runs on port 2018.

### Path Aliases

Configured in `jsconfig.json`:
- `@components/`, `@pages/`, `@styles/`, `@utils/`, `@hooks/`, `@recoil/`, `@lib/`, `@data/`, `@assets/`, `@api/`, `@auth/`

### Audio Player

`components/ui/Player.js` uses `react-h5-audio-player`. Player state is managed globally via `utils/playerProvider.js`.

### AMP

AMP variants of pages exist for SEO. AMP-specific components are in `components/amp/`.
