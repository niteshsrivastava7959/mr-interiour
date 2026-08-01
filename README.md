# Mr. Interior - Cloudflare Pages & D1 Database

This project is configured for deployment on **Cloudflare Pages** with a **Cloudflare D1** serverless database powered by **Drizzle ORM**.

## Prerequisites

- Node.js 18+
- Cloudflare account & Wrangler CLI (`npm install -g wrangler` or `npx wrangler`)

## Local Development & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Apply Local Database Migrations
Run the initial SQL migration against the local D1 database:
```bash
npm run db:migrate:local
```

### 3. Start Local Development Server
Start the local Cloudflare Pages server (including Pages Functions and local D1 DB):
```bash
npm run dev
```
Open `http://localhost:8788` in your browser to view the app, or `http://localhost:8788/admin.html` to log in as administrator.

## Production Deployment to Cloudflare

### 1. Create a Cloudflare D1 Database
Create your remote D1 database using Wrangler:
```bash
npx wrangler d1 create mr-interiour-db
```
Wrangler will output a `database_id`. Update `wrangler.json` with your database ID:
```json
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "mr-interiour-db",
    "database_id": "<YOUR_DATABASE_ID>"
  }
]
```

### 2. Apply Migrations to Remote D1 Database
```bash
npm run db:migrate:prod
```

### 3. Deploy to Cloudflare Pages
```bash
npm run deploy
```
Follow the Wrangler prompts to connect your Cloudflare project. Once deployed, Cloudflare Pages will serve static assets (`index.html`, `admin.html`) alongside serverless edge functions (`/api/*`).

## Database Schema Management

To update the database schema:
1. Modify `db/schema.ts`.
2. Generate migration SQL: `npm run db:generate`.
3. Apply locally: `npm run db:migrate:local`.
4. Apply remotely: `npm run db:migrate:prod`.
