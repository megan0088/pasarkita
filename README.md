# PasarKita

> Full-stack marketplace platform — Next.js 15, Supabase, Stripe.

Live demo: _coming soon_

## Features

| Feature | Description |
|---|---|
| Multi-role Auth | Buyer / Seller / Admin via Supabase Auth |
| Product Catalog | Search, filter by category, sort by price/rating/sales |
| Shopping Cart | Persisted with Zustand across sessions |
| Checkout | Shipping address form + Stripe payment |
| Order Tracking | Status stepper (pending → paid → processing → shipped → delivered) |
| Seller Dashboard | Product CRUD, order management, revenue stats |
| Admin Panel | Users, products, orders overview |
| Image Upload | Supabase Storage |
| Auto Stock Update | DB trigger on payment confirmation |
| Auto Rating | DB trigger on review submission |

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 App Router + Server Actions |
| Language | TypeScript |
| Styling | Tailwind CSS |
| State | Zustand (cart) |
| Backend | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| Payment | Stripe |
| Deploy | Vercel |
| CI | GitHub Actions |

## Project Structure

```
src/
  app/
    (store)/        # Public — home, products, cart, checkout, orders
    (seller)/       # Seller dashboard — products CRUD, orders
    (admin)/        # Admin panel
    (auth)/         # Login, Register
    api/            # payment/create-intent, webhooks/stripe
  components/
    layout/         # Navbar, Footer
    product/        # ProductCard, AddToCartButton
    dashboard/      # ProductForm
  lib/
    supabase/       # client.ts, server.ts, middleware.ts
    stripe/         # stripe.ts
    utils/          # formatPrice (IDR), cn, formatDate, etc.
  stores/           # Zustand cart store (persisted)
  types/            # TypeScript interfaces
supabase/
  schema.sql        # Full DB schema — RLS + triggers + seed
.github/
  workflows/ci.yml  # Type-check + build on every PR
```

## Getting Started

```bash
# 1. Clone & install
git clone https://github.com/megan0088/pasarkita
cd pasarkita
npm install

# 2. Create Supabase project at supabase.com
# 3. Run supabase/schema.sql in SQL Editor
# 4. Create Stripe account at stripe.com

# 5. Setup env
cp .env.example .env.local
# Fill: SUPABASE_URL, SUPABASE_ANON_KEY, STRIPE_SECRET_KEY, etc.

# 6. Run dev server
npm run dev
# → http://localhost:3000
```

## Database Schema

```
profiles      — buyer / seller / admin roles, auto-created on signup
categories    — 8 categories seeded
products      — slug, image_urls[], price in IDR
orders        — status flow, Stripe payment intent ID
order_items   — linked to orders + products
reviews       — auto-updates product rating via DB trigger
```

## Deployment

1. Push to GitHub
2. Connect repo to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Every push to `main` auto-deploys

---

Built by **Muhamad Ega Nugraha** — [github.com/megan0088](https://github.com/megan0088)
