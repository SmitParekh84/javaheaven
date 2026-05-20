# Java Heaven — Full Stack Coffee SaaS

A multi-tenant coffee shop platform. One codebase, many brands. Each tenant gets its own domain, colors, logo, and menu — all managed from a super-admin panel.

---

## Architecture

```
javaheaven/                     ← pnpm monorepo root
├── apps/
│   ├── web/                    ← Next.js 16 (Vercel)
│   └── api/                    ← Express 5 + TypeScript (Render)
└── packages/
    └── types/                  ← Shared TypeScript interfaces
```

| Concern | Service |
|---|---|
| Auth | Supabase (email/password, JWT) |
| Database | MongoDB Atlas — `JavaHeaven` database |
| Payments | Stripe Checkout |
| Image uploads | Cloudinary (tenant logos, hero images) |
| Frontend | Vercel |
| Backend API | Render.com |

---

## Tech Stack

- **Frontend:** Next.js 16, TypeScript, Tailwind CSS 3, `@supabase/ssr`
- **Backend:** Express 5, TypeScript, Mongoose 8, Stripe Node SDK
- **Auth:** Supabase — browser + server clients, JWT verified via service role key
- **Storage:** Cloudinary (`javaheaven-tenants` folder)
- **Testing:** Jest + supertest — 14 tests, 6 suites

---

## Repository Structure

```
apps/web/src/
├── app/
│   ├── login/            ← Supabase signInWithPassword
│   ├── sign-up/          ← Supabase signUp (name + phone in user_metadata)
│   ├── cart/             ← Cart page + Stripe checkout trigger
│   ├── order-success/    ← Fetches order from Express after Stripe redirect
│   ├── admin/            ← Admin dashboard (requires app_metadata.role=admin)
│   ├── super-admin/      ← Tenant management (cookie-based SUPER_ADMIN_PASSWORD)
│   └── api/
│       └── super-admin/
│           └── upload/   ← Cloudinary image upload route (POST)
├── components/providers/
│   ├── UserContext.tsx   ← Supabase onAuthStateChange session
│   └── CartContext.tsx   ← localStorage + syncs to Express /api/cart
├── lib/
│   ├── supabase.ts       ← Browser client (createBrowserClient)
│   └── supabase-server.ts← Server component client (createServerClient)
└── middleware.ts          ← Supabase session refresh + protected route guard

apps/api/src/
├── routes/
│   ├── menu.ts           ← GET /api/menu (public), POST/PUT/DELETE (admin only)
│   ├── cart.ts           ← GET/POST/DELETE /api/cart (auth required)
│   ├── orders.ts         ← GET /api/orders, /api/orders/:id (auth required)
│   ├── admin.ts          ← /api/admin/orders, /stock, /revenue (admin only)
│   ├── users.ts          ← GET/PUT /api/users/me (auth required)
│   └── payments.ts       ← POST /api/payments/create-checkout, /webhook, /session/:id
├── middleware/
│   ├── auth.ts           ← Supabase JWT → req.user (reads app_metadata.role)
│   └── adminRole.ts      ← 403 if role !== 'admin'
└── models/               ← MenuItem, Order, Cart, UserProfile (Mongoose)
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+ (`npm i -g pnpm`)
- MongoDB Atlas account (or local)
- Supabase project
- Stripe account (test mode)
- Cloudinary account

### Install

```bash
git clone https://github.com/SmitParekh84/javaheaven.git
cd javaheaven
NODE_OPTIONS=--max-old-space-size=4096 pnpm install
```

### Environment Variables

**`apps/web/.env.local`**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SUPABASE_URL=https://eyrzzhxsqytmivodombk.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xVKP5ADUbMJl0neBv-OFLA_Jl9-15Q8
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/JavaHeaven?retryWrites=true&w=majority
SUPER_ADMIN_PASSWORD=<choose-a-secure-password>
CLOUDINARY_CLOUD_NAME=djhhay893
CLOUDINARY_API_KEY=597297877798143
CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_<from-stripe-dashboard>
```

**`apps/api/.env`**
```env
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/JavaHeaven?retryWrites=true&w=majority
SUPABASE_URL=https://eyrzzhxsqytmivodombk.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_xVKP5ADUbMJl0neBv-OFLA_Jl9-15Q8
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
STRIPE_SECRET_KEY=sk_test_<from-stripe-dashboard>
STRIPE_WEBHOOK_SECRET=whsec_<register-after-deploy>
CLOUDINARY_CLOUD_NAME=djhhay893
CLOUDINARY_API_KEY=597297877798143
CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>
FRONTEND_URL=http://localhost:3000
```

> **Never commit `.env` or `.env.local`** — they are in `.gitignore`.

### Run Locally

```bash
# Both apps in parallel
pnpm dev

# Or individually
pnpm dev:web   # http://localhost:3000
pnpm dev:api   # http://localhost:5000
```

### Run Tests

```bash
pnpm --filter @javaheaven/api test
# 14 tests, 6 suites — auth, menu, cart, orders, admin, payments
```

---

## Multi-Tenant System

Each tenant is a document in the `tenants` MongoDB collection with:

| Field | Purpose |
|---|---|
| `domain` | e.g. `javaheaven.com` — resolved by middleware |
| `brandName` | Displayed in navbar and page title |
| `theme.*` | CSS custom properties (primary, secondary, bg colors) |
| `assets.logoUrl` | Cloudinary URL — uploaded via super-admin panel |
| `assets.heroImage` | Cloudinary URL — uploaded via super-admin panel |
| `contact`, `social` | Footer content |

### How Tenant Resolution Works

1. `src/middleware.ts` reads the request `Host` header and sets `x-tenant-domain`
2. `src/lib/tenant.ts` queries MongoDB for a matching tenant document
3. Theme CSS variables are injected into `<html>` via `layout.tsx`
4. All menu items, orders, and carts are scoped by `tenantId`

### Image Uploads (Cloudinary)

The super-admin panel (`/super-admin`) handles all image uploads:

- **Endpoint:** `POST /api/super-admin/upload`
- **Auth:** `super-admin-session` cookie must match `SUPER_ADMIN_PASSWORD`
- **Destination:** Cloudinary folder `javaheaven-tenants`
- **Returns:** `{ url: "https://res.cloudinary.com/djhhay893/..." }`
- **Limits:** 10 MB max, auto quality + format optimization

All returned URLs are stored in the tenant's `assets` fields in MongoDB and served directly via Cloudinary CDN.

---

## Auth Flow

```
User → /login → supabase.auth.signInWithPassword()
             → Supabase session cookie (sb-*)
             → middleware.ts refreshes token on every request
             → Express verifies JWT via supabaseAdmin.auth.getUser(token)
             → req.user = { id, email, role }  ← role from app_metadata only
```

### Setting Admin Role

In Supabase Dashboard → Authentication → Users → click user → edit `app_metadata`:

```json
{ "role": "admin" }
```

> `app_metadata` is server-only. `user_metadata` is user-writable and **not** used for role checks.

---

## Stripe Payment Flow

```
1. User clicks "Proceed to Checkout" on /cart
2. POST /api/payments/create-checkout  (Bearer token required)
3. Express creates Stripe Checkout Session → returns { url }
4. Browser redirects to Stripe hosted checkout
5. User pays → Stripe calls POST /api/payments/webhook
6. Webhook: checkout.session.completed → creates Order + clears Cart
7. Stripe redirects to /order-success?session_id=...
8. Page fetches order via GET /api/payments/session/:id
```

**Test card:** `4242 4242 4242 4242` · any future expiry · any CVC

---

## Deployment

### Vercel (apps/web)

1. Connect `https://github.com/SmitParekh84/javaheaven` to Vercel
2. Set **Root Directory** → `apps/web`
3. Set **Framework** → Next.js
4. Add all `NEXT_PUBLIC_*` and server env vars in Vercel Dashboard

### Render.com (apps/api)

1. New Web Service → connect same GitHub repo
2. **Root Directory** → `apps/api`
3. **Build Command** → `pnpm install && pnpm build`
4. **Start Command** → `pnpm start`
5. Add all env vars from `apps/api/.env`

### Register Stripe Webhook (after deploy)

1. Stripe Dashboard → Developers → Webhooks → Add endpoint
2. URL: `https://your-render-url.onrender.com/api/payments/webhook`
3. Event: `checkout.session.completed`
4. Copy `whsec_...` secret → add as `STRIPE_WEBHOOK_SECRET` in Render

---

## Post-Deploy Checklist

- [ ] Supabase → Dashboard → Auth → URL Configuration → set Site URL to your Vercel URL
- [ ] Set `SUPER_ADMIN_PASSWORD` in Vercel env vars (anything secure)
- [ ] Create first tenant at `https://your-vercel-url/super-admin`
- [ ] Upload logo and hero image via super-admin panel (Cloudinary)
- [ ] Set admin role: Supabase Dashboard → Users → `app_metadata: { "role": "admin" }`
- [ ] Test Stripe checkout with card `4242 4242 4242 4242`
- [ ] Verify webhook receives `checkout.session.completed` in Stripe Dashboard

---

## MongoDB Collections

| Collection | Managed by | Description |
|---|---|---|
| `tenants` | Next.js API routes | Brand config, theme, assets, contact |
| `menuitems` | Express `/api/menu` | Name, price, category, stock, imageUrl |
| `orders` | Express webhook | userId (Supabase UUID), items, Stripe IDs |
| `carts` | Express `/api/cart` | Per-user cart, synced on every change |
| `userprofiles` | Express `/api/users/me` | Name, phone, address |

All `userId` fields are Supabase UUIDs — no separate users collection needed.
