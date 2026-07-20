# 🌊 Wings River Café & Lucknow Water Sports

A luxury, responsive, high-performance **WordPress-style dynamic website** for **Wings River Café** (विंग्स रिवर) and **Lucknow Water Sports**, built with Next.js 14, TypeScript, Tailwind CSS, Framer Motion, and **Cloudflare Workers / Pages** with **Cloudflare D1 Database** integration.

---

## 🚀 Cloudflare Deployment Guide (Pages, Workers & D1)

### 1. Cloudflare D1 Database Binding
This repository is pre-configured with Cloudflare D1 Database Binding in `wrangler.json`:
- **Database Name**: `wings-river-cafe-db`
- **Database ID**: `c2491a90-0f90-4a1e-8a4d-852e6588a68a`
- **Binding Name**: `DB`

### 2. Environment Variables & Secrets (Local vs Production)
> ⚠️ **SECURITY NOTICE**: Never commit `.env` or `.env.local` files to Git. All secrets are excluded via `.gitignore`.

For local development, copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

For Cloudflare Production deployment, set secrets using Wrangler or the Cloudflare Dashboard:
```bash
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put ADMIN_SECRET_KEY
```

### 3. Initialize D1 Database Schema
Execute the SQL schema migration against your remote Cloudflare D1 database:
```bash
npx wrangler d1 execute wings-river-cafe-db --remote --file=schema.sql
```

### 4. Build & Deploy to Cloudflare Pages
To build and deploy the Next.js edge application to Cloudflare Pages:
```bash
# 1. Install dependencies
npm install

# 2. Build for Cloudflare Pages (Edge output)
npm run pages:build

# 3. Deploy to Cloudflare Pages
npx wrangler pages deploy .vercel/output/static --project-name=wings-river-cafe-blog
```

Or deploy automatically using **Cloudflare Pages GitHub Integration**:
- **Build command**: `npm run pages:build`
- **Build output directory**: `.vercel/output/static`
- **Root directory**: `/`
- **Environment variables**: Add `NODE_VERSION: 20` and D1 database binding `DB` -> `c2491a90-0f90-4a1e-8a4d-852e6588a68a`.

---

## ⚡ Local Development

```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application locally with mock D1 database fallback.

---

## 🏆 Key Features Included

1. **Circular Logo & Luxury Theme**: Mint Green (`#8FD3C7`), Cream White, Golden (`#D4AF37`), Dark (`#1B1B1B`).
2. **Blurred Hero Slideshow**: Background slideshow with blurred backdrops, image carousel, floating leaves, and CTAs.
3. **Interactive 8-Page Menu Booklet Screen**: Smooth 3D page flip booklet with page zoom, auto-flip, grid mode, and high-res image download.
4. **Lucknow Water Sports & Rides Ticket Screen**: Rate card poster for Jetski (₹350), Speed Boat (₹250), Motor Boat (₹200), Panda Train (₹50), Kids Car (₹50), and Trampoline (₹50).
5. **Table, Party & Rides Reservation System**: Multi-purpose booking modal saving directly to Cloudflare D1 database.
6. **WordPress-Style Blog Journal**: Featured post layout, category tags, recent posts grid, and inline article reader.
7. **Masonry Photo Gallery**: Pinterest grid layout with categories & zoom lightbox.
8. **Customer Reviews Carousel**: 4.1★ Google rating summary & verified guest reviews.
9. **Admin CMS Dashboard**: Protected panel at `/admin` for managing reservations, menu items, blog posts, reviews, and contact messages.
10. **SEO & Schema.org**: `Restaurant` JSON-LD structured metadata, OpenGraph, sitemap.xml, robots.txt.
