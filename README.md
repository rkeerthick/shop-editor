# Shop Editor

A free, open-source e-commerce platform for building and managing online stores — no subscription fees, fully self-hostable.

Inspired by Shopify and Amazon SmartBiz, Shop Editor gives merchants a drag-and-drop storefront builder, product catalog management, order tracking, and integrated payments out of the box.

---

## Features

- **Storefront Builder** — drag-and-drop block editor (hero, product grid, banners, text) to design your shop without writing code
- **Product Management** — add products with images, descriptions, pricing, stock levels, and variants (size, color, etc.)
- **Order Management** — view and manage customer orders, update fulfillment status, track payment state
- **Payments** — Stripe integration with secure checkout and webhook-driven order confirmation
- **Multi-shop** — one account can manage multiple shops
- **Auth** — merchant login/register with NextAuth.js; optional OAuth (Google, GitHub)

---

## Tech Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **Styling:** Tailwind CSS + shadcn/ui
- **Auth:** NextAuth.js
- **Payments:** Stripe
- **Storage:** Cloudinary (product images)
- **Drag & Drop:** @dnd-kit

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or hosted — [Supabase](https://supabase.com) is free)
- Stripe account (free to create, test mode available)
- Cloudinary account (free tier is sufficient for most shops)

### 1. Clone the repo

```bash
git clone https://github.com/your-username/shop-editor.git
cd shop-editor
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

```env
# Database
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

Visit [http://localhost:3000](http://localhost:3000) to see the app.

---

## Project Structure

```
shop-editor/
├── app/
│   ├── (auth)/          # Login & register pages
│   ├── (dashboard)/     # Merchant admin panel
│   ├── (store)/         # Public storefront routes
│   └── api/             # REST API handlers
├── components/
│   ├── ui/              # shadcn/ui base components
│   ├── dashboard/       # Admin UI components
│   ├── storefront/      # Customer-facing components
│   └── editor/          # Storefront block editor
├── lib/                 # Shared utilities (db, auth, stripe)
├── prisma/              # Schema and migrations
└── tests/               # Unit and E2E tests
```

---

## Development

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run typecheck    # TypeScript type checking
npm run lint         # ESLint
npm run test         # Unit tests (Vitest)
npm run test:e2e     # E2E tests (Playwright)
npx prisma studio    # Visual database browser
```

---

## Deployment

Shop Editor can be deployed anywhere Next.js runs:

| Platform | Notes |
|---|---|
| **Vercel** | Recommended — zero config, free tier available |
| **Railway** | Postgres + app in one place, free starter |
| **Fly.io** | Docker-based, full control |
| **Self-hosted** | Run `npm run build && npm start` on any VPS |

For production, make sure to:
1. Set all environment variables in your hosting provider
2. Run `npx prisma migrate deploy` (not `dev`) for migrations
3. Set up a Stripe webhook pointing to `https://your-domain/api/webhooks/stripe`

---

## Roadmap

- [x] Project setup and architecture
- [ ] Auth (login, register, sessions)
- [ ] Shop setup wizard
- [ ] Product management (CRUD + image upload)
- [ ] Storefront block editor
- [ ] Public storefront rendering
- [ ] Cart and checkout
- [ ] Stripe payment integration
- [ ] Order management dashboard
- [ ] Post-MVP: analytics, email, shipping APIs

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
