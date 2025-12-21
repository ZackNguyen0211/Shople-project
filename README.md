# Shople Project

Next.js (App Router) + Supabase demo ecommerce. Monorepo with a single workspace apps/web.

## Tech stack

- Next.js 14 (app directory)
- React 18
- Supabase (PostgreSQL + Storage) via service role key
- JWT auth with HTTP-only cookie

## Prerequisites

- Node.js 18.17+ (Next.js 14 requirement)
- npm 9+ (comes with recent Node)

## Getting started

```bash
# Install dependencies
npm install

# Start dev server (root runs workspace script)
npm run dev

# Alternatively from workspace
npm run dev -w @shoople/web

# Build
npm run build

# Run production server (after build)
npm run start -w @shoople/web
```

The app runs on http://localhost:3000 by default.

## Environment variables

Create a .env (or configure in your hosting) with at least:

```env
# Supabase
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_BUCKET=product-images # optional, defaults to product-images

# Auth
API_JWT_SECRET=change_me
API_COOKIE_NAME=shoople_token
API_JWT_EXPIRES_IN=7d
```

Notes:

- Service role key is required because the server routes talk directly to Supabase.
- API_JWT_SECRET should be a strong secret in production.

## Database

- Schema and seed live in supabase/schema.sql and supabase/seed.sql.
- Core tables: users, shops, products, product_images, carts, cart_items, invoices, shop_requests, notifications.
- RLS is disabled in the provided schema (development use). Enable and add policies for production.

## App structure (high level)

- apps/web/app: Next.js app routes (site, admin, auth, api/\*)
- apps/web/components: shared UI (ImageUploader, admin actions, etc.)
- apps/web/lib: auth, db client, formatting, i18n helpers
- supabase: SQL schema and seed data

## Error demo

/error-demo is a dynamic route that intentionally throws to show the global error boundary. It does not break builds because it is marked dynamic = 'force-dynamic'.

## Linting & formatting

```bash
npm run lint
npm run format
```

## Deploy

- Vercel friendly (root vercel.json provided).
- Configure the env vars above in Vercel (or your host) before deploying.
