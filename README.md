# DigiCard — digital visiting cards

One link + QR per customer. Each card gets a public page (`/c/username`),
vCard download, WhatsApp/call buttons and a view counter. Sell at ৳500/year.

## Run it

```bash
npm install
cp .env.example .env   # optional — MongoDB persistence
npm run dev            # http://localhost:3000
```

Without `MONGODB_URI` cards are stored in `.data/` (gitignored file store).

## Features (built feature-by-feature)

- **F1** — card model, store, CRUD API (username validation, 12-link cap)
- **F2** — public card page with 5 themes + RFC 6350 vCard download + views
- **F3** — dashboard editor + QR codes + demo seed
- **F4** — verified live flows + shared file store (pages and API routes may
  run in isolated module graphs, so a module-level Map is NOT shared)

## Notes

- `cacheComponents: false` + `dynamic = "force-dynamic"` so every number is live.

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind v4 · react-qr-code · Mongoose (optional)
