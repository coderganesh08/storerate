# Store Rating Platform

Full stack store rating app with a React/Vite frontend, Express REST API, and PostgreSQL managed by Prisma 6.

## Requirements

- Node.js 18 or newer
- PostgreSQL 14 or newer, running locally

## Configure PostgreSQL and the API

Create a database named `store_rating` (or choose another name and put it in `DATABASE_URL`). From the project root, create the backend environment file:

```powershell
Copy-Item backend/.env.example backend/.env
```

Edit `backend/.env` with your PostgreSQL username/password and a long random `JWT_SECRET` (at least 32 characters). The default database URL expects a local PostgreSQL user named `postgres` with password `password`; change it to match your setup.

Install and initialize the backend:

```powershell
Set-Location backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

The API listens on `http://localhost:4000`; `/api/health` reports whether it is running. Keep this terminal open.

## Run the frontend

In a second terminal, from the project root:

```powershell
Set-Location frontend
npm install
npm run dev
```

Open the local URL Vite prints, usually `http://localhost:5173`. Vite forwards `/api` requests to the local Express server.

## First administrator

The seed command creates the administrator from `SEED_ADMIN_*` in `backend/.env`. Defaults:

- Email: `admin@storerating.local`
- Password: `Admin@12345`

Change these values before seeding if you prefer different credentials. Admin users can create store owners and stores. Public registration always creates a normal user.

## Roles and features

- **Administrator:** platform totals, user/store management, search, filters, sorting, pagination, and owner assignment.
- **User:** registration, store directory, and one editable 1–5 rating per store.
- **Store owner:** owned-store averages and rating activity for their stores only.
- All roles can change their password and sign out.

Names must be 2–60 characters; addresses are limited to 400 characters; passwords must be 8–16 characters with an uppercase letter and a special character. Email addresses are normalized to lowercase and unique.

## Production

Use separate hosting for the frontend and API, set `CLIENT_ORIGIN` to the frontend origin, and provide a managed PostgreSQL URL plus a strong `JWT_SECRET`. For deployment use:

```bash
npm ci
npx prisma generate
npm run db:deploy
npm start
```

Never commit `backend/.env`. Passwords are stored as bcrypt hashes; all protected routes validate a signed JWT and enforce role permissions.
