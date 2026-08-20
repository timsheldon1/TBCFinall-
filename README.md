# The Bush Collection

Booking platform for a collection of African safari lodges and beach properties, lets guests browse properties, book rooms and packages, and pay online, while staff manage listings, rates, and reservations from an admin dashboard.

Live demo: https://thebushcollection.africa
Stack: React, TypeScript, Node.js, Express, MongoDB, Tailwind CSS

## What it does

Small hospitality groups often juggle a handful of properties across spreadsheets, WhatsApp, and manual invoicing. This platform gives them a single system: a public site where guests can browse bush and beach properties, check seasonal rates, and book directly, plus an admin side for managing properties, rooms, packages, media, and reviews without touching the database. Bookings generate PDF receipts and confirmation emails automatically, and payments are settled through Pesapal.

## Features

- Browse properties and rooms with seasonal, guest-count-aware pricing
- Book rooms/packages and pay online via Pesapal
- Admin dashboard for properties, rooms, amenities, media, and reviews, no code changes needed to update a listing
- Automated booking confirmations and PDF receipts by email
- Contact form and Mailchimp newsletter signup for lead capture

## Running it locally

```bash
git clone https://github.com/timsheldon1/TBCFinall-.git
cd TBCFinall-

# backend
cd TheBushCollection-bend
npm install
cp .env.example .env      # add your own MongoDB URI, JWT secret, Pesapal/SMTP keys, etc.
npm run dev                # http://localhost:5000

# frontend (new terminal)
cd ../TheBushCollection-fend
pnpm install
pnpm run dev                # http://localhost:5173
```

API docs are served at `/api-docs` (Swagger UI) once the backend is running.

## How it is built

The backend is an Express 5 API with Mongoose models for properties, rooms, bookings, packages, reviews, and two separate user collections (`User` and `Admin`), each with its own JWT-protected routes and login rate limiter. State on the frontend is split between TanStack Query for server data (properties, bookings, availability) and Zustand for local UI state, with the shadcn/ui + Tailwind component set handling presentation. Booking receipts are generated server-side with `pdf-lib`/`pdfkit` and emailed via Nodemailer/SMTP; payments round-trip through Pesapal's callback flow.

## Decisions and trade-offs

- Used MongoDB over Postgres because properties vary a lot in shape — a beach villa and a bush lodge don't share the same amenity or media structure. Trade-off: no relational integrity, so things like room-to-property consistency are enforced in application code rather than by the database.
- Kept `User` and `Admin` as separate Mongoose models and route sets instead of one collection with a role flag, to avoid ever accidentally exposing admin-only data through a user token. Trade-off: some duplicated auth middleware (`protectUser`, `protectAdmin`, `protectAdminOrUser`) instead of one generic guard.
- CORS origins are an explicit allowlist in `server.js` rather than a wildcard or config-driven list. Trade-off: adding a new frontend domain (e.g. a staging URL) means a code change and redeploy, but it's a deliberate trade against accidentally allowing an arbitrary origin in a payments-handling API.

## What I would do differently

The CORS allowlist and a couple of other settings are hardcoded in `server.js` rather than pulled from environment config, fine at the current scale, but I'd move those to env vars before adding another environment (e.g. a staging deployment).

## Status

In production and actively maintained. Live at thebushcollection.africa.
