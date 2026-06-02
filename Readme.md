# JMV Grocery API

Backend API for the JMV grocery ecommerce platform.

## Getting Started

```bash
npm install
cp .env.example .env
npm run dev
```

The API starts on `http://localhost:5000` by default.

## Scripts

- `npm run dev` - start the development server
- `npm run build` - compile TypeScript
- `npm run start` - run the compiled server
- `npm run typecheck` - run TypeScript checks
- `npm run lint` - run ESLint
- `npm run prisma:migrate` - run Prisma migrations
- `npm run prisma:studio` - open Prisma Studio
- `npm run seed:admin` - create or promote the admin user from `.env`
- `npm run seed:dev` - seed development catalog, users, carts, and orders

## Development Seed

```bash
npm run seed:dev
```

This creates reusable test data for the admin and customer flows:

- Admin: `admin@jmv.local`
- Customers: `asha.rao@example.com`, `vikram.mehta@example.com`
- Default password: `Password123!`

Set `DEV_SEED_PASSWORD` in `.env` if you want a different password for seeded users.
# jmv-backend
