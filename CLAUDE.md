# Shop Editor — CLAUDE.md

## Project Overview

Shop Editor is a free, self-hostable e-commerce platform similar to Shopify and Amazon SmartBiz. It lets merchants build a storefront, manage products, process orders, and accept payments — all without subscription fees.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14+ (App Router) with TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | PostgreSQL via Prisma ORM |
| Auth | NextAuth.js (credentials + OAuth) |
| Payments | Stripe |
| Storage | Cloudinary or AWS S3 (product images) |
| State | Zustand (client), React Query / SWR (server state) |
| Validation | Zod |
| Testing | Vitest + React Testing Library + Playwright (E2E) |

## Project Structure

```
shop-editor/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Login, register, forgot-password
│   ├── (dashboard)/            # Merchant admin panel
│   │   ├── products/           # Product CRUD
│   │   ├── orders/             # Order management
│   │   ├── storefront/         # Storefront builder
│   │   └── settings/           # Shop settings, payments
│   ├── (store)/                # Public-facing storefront
│   │   ├── [shopSlug]/         # Per-shop routes
│   │   └── checkout/           # Cart + checkout flow
│   └── api/                    # API route handlers
│       ├── auth/
│       ├── products/
│       ├── orders/
│       ├── storefront/
│       └── webhooks/stripe/
├── components/
│   ├── ui/                     # shadcn/ui primitives
│   ├── dashboard/              # Admin-side components
│   ├── storefront/             # Customer-facing components
│   └── editor/                 # Drag-and-drop storefront builder
├── lib/
│   ├── db.ts                   # Prisma client singleton
│   ├── auth.ts                 # NextAuth config
│   ├── stripe.ts               # Stripe client
│   └── validations/            # Zod schemas
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/
├── hooks/                      # Shared React hooks
├── store/                      # Zustand stores
├── types/                      # Shared TypeScript types
└── tests/
    ├── unit/
    └── e2e/
```

## Core Domain Models (Prisma)

- **User** — merchant account (email, passwordHash, role)
- **Shop** — a merchant's store (name, slug, theme, logoUrl)
- **Product** — product listing (title, description, price, stock, images, variants)
- **ProductVariant** — size/color/etc variants with individual pricing
- **Category** — product categorization
- **Order** — customer order (status, total, stripePaymentIntentId)
- **OrderItem** — line items linking Order → ProductVariant
- **Customer** — buyer profile attached to orders
- **StorefrontPage** — serialized page layout JSON for the storefront builder
- **StorefrontBlock** — reusable UI blocks within a page (hero, grid, banner, etc.)

## Key Development Conventions

### TypeScript
- Strict mode enabled (`"strict": true` in tsconfig)
- No `any` — use `unknown` and narrow properly
- Export types from `types/` for cross-module sharing

### API Routes
- All API routes live under `app/api/`
- Return consistent JSON shape: `{ data, error, meta? }`
- Validate request bodies with Zod before any DB call
- Use HTTP status codes correctly (200, 201, 400, 401, 403, 404, 500)

### Database
- All DB access goes through the Prisma client in `lib/db.ts`
- Never write raw SQL unless Prisma cannot express the query
- Migrations are version-controlled — never edit applied migrations
- Seed data lives in `prisma/seed.ts`

### Auth & Authorization
- NextAuth.js manages sessions
- Role check middleware wraps all dashboard routes
- Merchants can only access their own shop's data (row-level isolation via `shopId`)

### Payments (Stripe)
- Use Payment Intents API (not legacy Charges)
- Webhook handler at `app/api/webhooks/stripe/route.ts`
- Always verify webhook signatures — never trust unverified Stripe events
- Store `stripePaymentIntentId` on orders for reconciliation

### Storefront Builder
- Pages are stored as JSON (array of blocks with layout + props)
- Block types: `hero`, `product-grid`, `banner`, `text`, `image`, `cta`
- Editor uses `@dnd-kit` for drag-and-drop block reordering
- Preview renders the same JSON in read-only mode

### Error Handling
- Use `try/catch` in API routes and log errors server-side
- Surface safe, human-readable messages to the client (no stack traces)
- Client errors go to an error boundary; server errors log to console (add Sentry later)

### Environment Variables
Required in `.env.local`:
```
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## Commands

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Database
npx prisma migrate dev       # Apply migrations in dev
npx prisma migrate deploy    # Apply migrations in production
npx prisma db seed           # Seed initial data
npx prisma studio            # Visual DB browser

# Type check
npm run typecheck

# Lint
npm run lint

# Tests
npm run test                 # Vitest unit tests
npm run test:e2e             # Playwright E2E tests

# Build
npm run build
```

## MVP Milestones

1. **Auth** — merchant register, login, session management
2. **Shop setup** — create shop, configure name/slug/logo
3. **Product management** — CRUD products with images and variants
4. **Storefront builder** — visual block-based page editor
5. **Public storefront** — customer-facing shop pages rendered from saved layouts
6. **Cart & checkout** — add to cart, checkout flow
7. **Payments** — Stripe integration, webhook order fulfillment
8. **Order management** — dashboard view of orders, status updates

## Out of Scope (Post-MVP)

- Multi-currency support
- Tax calculation (integrate TaxJar/Avalara later)
- Shipping rate APIs (EasyPost, Shippo)
- Analytics dashboard
- Email marketing / abandoned cart
- Mobile app
- Multi-vendor marketplace
