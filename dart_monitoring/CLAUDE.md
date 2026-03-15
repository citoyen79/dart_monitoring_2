# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start local dev server at http://localhost:3000
npm run build    # Production build
npm run lint     # ESLint check
```

Environment variables required (create `.env.local`):
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
DART_API_KEY=
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

## Architecture

This is a **Next.js 16 App Router** application — a DART (한국 전자공시시스템) monitoring dashboard that sends Telegram alerts for new filings from watched companies.

**Data flow:**
1. A cron job (`/api/cron`) runs every 10 minutes (via both `vercel.json` and `.github/workflows/cron.yml` as a backup trigger using `secrets.VERCEL_DOMAIN`).
2. The cron handler fetches today's filings from the DART OpenAPI (`opendart.fss.or.kr`) using KST date, paginating up to 20 pages.
3. It cross-references filings against the `companies` Supabase table; skips filings whose `report_nm` contains any keyword from the `keywords` table (exclusion filter).
4. New filings (not already in `announcements`) are inserted into Supabase first (deduplication guard), then a Telegram HTML-formatted message is sent.

**Supabase tables:**
- `companies` — `id, corp_code (8-digit), corp_name, created_at`
- `keywords` — `id, keyword, created_at` (exclusion list)
- `announcements` — `id, rcept_no (unique), corp_code, corp_name, report_nm, sent_at`

**Frontend pages (all `"use client"`):**
- `/` — Dashboard with counts from all three tables
- `/companies` — CRUD for monitored companies; `corp_code` is auto-padded to 8 digits
- `/keywords` — CRUD for exclusion keywords
- `/notifications` — Read-only list of last 100 sent announcements with links to `dart.fss.or.kr`

**Key implementation notes:**
- The Supabase client in `src/lib/supabase.ts` is a module-level singleton used by all frontend pages.
- The cron route (`src/app/api/cron/route.ts`) creates its own Supabase client per-invocation with `cache: 'no-store'` to avoid Vercel edge caching issues; it must NOT use the module-level singleton.
- `.maybeSingle()` is used (not `.single()`) when checking for existing announcements to avoid errors on zero rows.
- Insert-before-send ordering prevents duplicate Telegram alerts if the function is retried.
- Styling uses Tailwind CSS v4 with custom `glass-card` and `glass-panel` CSS classes defined in `globals.css`, plus `framer-motion` for animations.
