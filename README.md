# The Bush Collection

Booking and property management platform for The Bush Collection — a full-stack web app for showcasing lodges/properties, managing rooms, packages, bookings, payments, and admin content.

The repo is a monorepo with two apps:

- [`TheBushCollection-bend/`](TheBushCollection-bend) — REST API server
- [`TheBushCollection-fend/`](TheBushCollection-fend) — customer-facing web app + admin UI

## Tech Stack

**Backend**
- Node.js (18.18.2) + Express 5
- MongoDB with Mongoose
- JWT authentication (`jsonwebtoken`, `bcrypt`/`bcryptjs`)
- Nodemailer / SMTP + Mandrill/Mailchimp for email & marketing
- Multer for file uploads, `pdf-lib` / `pdfkit` / Puppeteer for PDF generation (receipts, etc.)
- Pesapal for payments
- Swagger (`swagger-jsdoc` + `swagger-ui-express`) for API docs
- `nodemon` for local dev reloads

**Frontend**
- React 19 + TypeScript
- Vite build tooling
- shadcn/ui (Radix UI primitives) + Tailwind CSS
- React Router, TanStack Query, React Hook Form + Zod
- Zustand for state, Recharts for charts, Axios for API calls
- pnpm as package manager

## Project Structure

```
TheBushCollection-bend/
├── config/          # DB connection, Swagger config
├── controllers/      # Route handlers (auth, bookings, properties, payments, etc.)
├── middleware/
├── models/            # Mongoose schemas
├── routes/            # Express routers
├── templates/         # Email/receipt HTML templates
├── utils/
└── server.js

TheBushCollection-fend/
├── public/
├── src/
│   ├── components/    # Reusable UI (incl. shadcn/ui components under components/ui)
│   ├── hooks/
│   ├── pages/
│   └── App.tsx
└── vite.config.ts
```

## Getting Started

### Prerequisites
- Node.js 18.x
- MongoDB instance (local or hosted, e.g. Atlas)
- pnpm (`npm i -g pnpm`)

### Backend setup

```bash
cd TheBushCollection-bend
npm install
```

Create a `.env` file with the following variables:

```
PORT=
MONGO_URI=
JWT_SECRET=
JWT_EXPIRES_IN=
NGROK_AUTH_TOKEN=
ADMIN_TOKEN=
PESAPAL_CONSUMER_KEY=
PESAPAL_CONSUMER_SECRET=
PESAPAL_CALLBACK_URL=
FRONTEND_URL=
MAILCHIMP_API_KEY=
MAILCHIMP_SERVER_PREFIX=
MAILCHIMP_LIST_ID=
MAILCHIMP_AUDIENCE_ID=
MANDRILL_API_KEY=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

Run the server:

```bash
npm run dev     # nodemon, auto-reload
npm start        # production
```

API docs are served at `/api-docs` (Swagger UI) once the server is running.

### Frontend setup

```bash
cd TheBushCollection-fend
pnpm install
pnpm run dev      # start dev server
pnpm run build    # production build
pnpm run preview  # preview production build
```

## Key Features

- Property, room, package, and seasonal rate management
- Booking flow with Pesapal payment integration
- Admin dashboard for managing content, media, and reviews
- Contact form + Mailchimp newsletter signup
- Automated booking confirmation / receipt emails (PDF generation)
- Swagger-documented REST API

## License

ISC
