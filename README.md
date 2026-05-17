# Shop Editor

A free, open-source e-commerce platform for building and managing online stores — no subscription fees, fully self-hostable.

Inspired by Shopify and Amazon SmartBiz, Shop Editor gives merchants a drag-and-drop storefront builder, product catalog management, order tracking, and integrated payments out of the box.

**Live demo:** [https://shop-editor.vercel.app](https://shop-editor.vercel.app)

---

## Features

- **Storefront Builder** — drag-and-drop block editor (hero, product grid, banner, text, image, CTA) to design your shop without writing code
- **Product Management** — add products with images (Cloudinary), descriptions, pricing, stock levels, and variants
- **Order Management** — view and manage customer orders, update fulfillment status, track payment state
- **Payments** — Stripe integration with secure checkout flow and webhook-driven order confirmation
- **Cart** — persistent cart with Zustand (survives page refresh, clears on shop change)
- **Public Storefront** — customer-facing shop pages rendered from saved block layouts, with dynamic navigation
- **Image Uploads** — Cloudinary-backed product and shop logo/banner uploads
- **Auth** — merchant register/login with NextAuth.js (credentials provider, JWT sessions)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | PostgreSQL via Prisma ORM |
| Auth | NextAuth.js v5 (JWT strategy) |
| Payments | Stripe (Payment Intents API) |
| Storage | Cloudinary (product & shop images) |
| State | Zustand v5 with persist middleware |
| Drag & Drop | @dnd-kit |
| Validation | Zod |
| Hosting | Vercel + Supabase (PostgreSQL) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or hosted — [Supabase](https://supabase.com) free tier works great)
- Stripe account (test mode available, no charges needed for development)
- Cloudinary account (free tier is sufficient)

### 1. Clone the repo

```bash
git clone https://github.com/rkeerthick/shop-editor.git
cd shop-editor
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the root:

```env
# Database (Supabase or any PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/shopeditor

# NextAuth
NEXTAUTH_SECRET=your-random-secret-here
NEXTAUTH_URL=http://localhost:3000

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 4. Set up the database

```bash
npx prisma migrate dev
npx prisma db seed
```

### 5. Start the dev server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) — you'll be redirected to the dashboard.

### 6. Set up Stripe webhooks (local)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the printed `whsec_...` secret into your `.env.local` as `STRIPE_WEBHOOK_SECRET`.

---

## Project Structure

```
shop-editor/
├── app/
│   ├── (auth)/                  # Login & register pages
│   ├── (dashboard)/             # Merchant admin panel
│   │   └── dashboard/
│   │       ├── products/        # Product CRUD
│   │       ├── orders/          # Order management
│   │       ├── storefront/      # Block editor
│   │       └── settings/        # Shop settings
│   ├── store/[shopSlug]/        # Public storefront routes
│   │   ├── products/[slug]/     # Product detail page
│   │   └── checkout/            # Cart & Stripe checkout
│   └── api/                     # REST API handlers
├── components/
│   ├── ui/                      # shadcn/ui base components
│   ├── dashboard/               # Admin UI components
│   ├── storefront/              # Customer-facing components
│   └── editor/                  # Storefront block editor
├── lib/                         # db, auth, stripe clients
├── store/                       # Zustand cart store
├── types/                       # Shared TypeScript types
└── prisma/                      # Schema and migrations
```

---

## Development Commands

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run typecheck    # TypeScript type checking
npm run lint         # ESLint
npx prisma studio    # Visual database browser
npx prisma migrate dev   # Apply schema changes
```

---

## Deployment

Deployed on **Vercel** with **Supabase** (PostgreSQL). Any Next.js-compatible host works.

| Platform | Notes |
|---|---|
| **Vercel** | Recommended — zero config, free tier available |
| **Railway** | Postgres + app in one place |
| **Fly.io** | Docker-based, full control |
| **Self-hosted** | `npm run build && npm start` on any VPS |

### Production checklist

1. Set all environment variables in your hosting provider
2. Update `NEXTAUTH_URL` to your production domain
3. Run `npx prisma migrate deploy` (not `dev`) for migrations
4. Create a Stripe webhook endpoint pointing to `https://your-domain/api/webhooks/stripe` with event `payment_intent.succeeded`
5. Add the production `whsec_...` signing secret as `STRIPE_WEBHOOK_SECRET`

---

## Roadmap

- [x] Auth — register, login, JWT sessions
- [x] Shop setup — name, slug, logo, banner, settings
- [x] Product management — CRUD with image uploads and variants
- [x] Storefront block editor — drag-and-drop hero, grid, banner, text, image, CTA
- [x] Public storefront — dynamic pages rendered from saved layouts
- [x] Cart & checkout — Stripe Elements, multi-step checkout
- [x] Payments — Stripe Payment Intents + webhook order fulfillment
- [x] Order management — dashboard with status updates
- [ ] Analytics dashboard
- [ ] Email notifications (order confirmation)
- [ ] Shipping rate APIs (EasyPost, Shippo)
- [ ] Multi-currency support
- [ ] Tax calculation (TaxJar / Avalara)

---

## Contributing

Pull requests are welcome. For major changes, open an issue first to discuss the approach.

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes
4. Push and open a PR

---

## License

MIT — free for personal and commercial use.
