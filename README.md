# CARD4ME — Publish Package

CARD4ME is a Nigerian digital-services web app for account registration, wallet funding, airtime, data, transaction history, and account management.

## What is included

- Static frontend: HTML, CSS, and JavaScript in the project root.
- Node.js/Express backend in `backend/`.
- SQLite database created at runtime by `backend/database.js`.
- Flutterwave wallet-funding integration.
- MELE data/airtime integration.
- JWT authentication and password hashing.
- Duplicate-payment protection for wallet credits.

## Important: what you must configure before going live

This ZIP contains **no secret keys**. On your backend host, create these environment variables:

- `PORT` — usually supplied by the host; the app defaults to 3000.
- `JWT_SECRET` — a long random secret.
- `MELE_API_TOKEN` — your MELE API key.
- `FLW_CLIENT_ID` — your Flutterwave client ID.
- `FLW_CLIENT_SECRET` — your Flutterwave client secret.
- `FLW_BASE_URL` — use the appropriate Flutterwave API base URL for your account/environment.
- `FLW_REDIRECT_URL` — the public URL for the payment-success page.
- `FLW_WEBHOOK_SECRET` — the secret used to validate Flutterwave webhooks.
- `FRONTEND_URL` — your public frontend origin. Multiple origins can be separated by commas.

Never put these secrets inside the HTML/JavaScript files or commit a `.env` file.

## Backend deployment

1. Deploy the `backend/` folder as a Node.js service.
2. Use `npm ci` during the build/install step.
3. Use `npm start` as the start command.
4. Add the environment variables above in the host's secret/environment settings.
5. Confirm `GET /api/health` returns a successful online response.

### Database warning

The current application uses `sql.js` and writes `backend/card4me.db` to the server filesystem. This is suitable for development/small controlled deployments, but **do not assume the database survives host restarts/redeploys**. Before handling significant customer funds, move wallet/transaction storage to a managed persistent database (for example PostgreSQL) or use persistent disk storage supported by your host.

## Frontend deployment

Upload the project-root HTML/CSS/JS files to a static hosting service. The frontend currently points to the CARD4ME Render backend URL in its API configuration. If your backend URL changes, update the frontend API base URL references before publishing.

## Payment safety

Do not use real money during initial testing. Verify registration, login, wallet funding, payment verification, webhook processing, duplicate webhook handling, airtime, data, failed transactions, and transaction history with test/sandbox credentials first.

## Files intentionally excluded

The publish ZIP does not include: `.env` secrets, `node_modules`, runtime SQLite databases, logs, or maintenance backup scripts.

## Publishing the frontend
The backend is designed to run at `https://card4me-backend.onrender.com`. The frontend is a static site and can be deployed as a Render Static Site. After Render gives the frontend its URL, set the backend `FRONTEND_URL` environment variable to that exact URL and redeploy the backend.
