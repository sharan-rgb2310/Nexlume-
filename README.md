# Tamil Nadu Fair Price Shop Stock Dashboard

A responsive React dashboard with inline SVG illustrations and a server-backed commodity stock feed. Seven sample commodities are stored outside the public web directory and served by an API protected with a generated server-side key.

The stock dashboard is available at `/`. The Admin console is integrated into the same application at `/admin`, with its Shops and Settings pages at `/admin/shops` and `/admin/settings`.
The Admin console starts with no shop or device records. Previously saved built-in sample records are removed when the Admin app loads; other saved records are kept.
When the stock API marks its response as dummy data, quantities animate locally every 4 seconds and cycle back to their sample values at their configured minimum; this simulation does not write to the API or JSON file. All commodity rows remain visible together instead of rotating through separate table pages.

## Run locally

```sh
npm install
npm run dev
```

The API key is generated into the ignored `.env` file when you set up the local API. The Vite server proxies browser requests through the backend using that key; it is never included in the frontend bundle. Do not commit `.env`.

For production preview, run `npm run api` in one terminal and `npm run preview` in another. The preview proxy also forwards API requests to the local backend. The response's `apiConfig` controls automatic stock refresh.

## Deploy the frontend and Render proxy to Vercel

The frontend reads stock from the same-origin `/api/stock` route. Vercel Functions in `api/` proxy to Render using server-side credentials. The browser never receives `STOCK_API_KEY`.

In Vercel, set **Project Root Directory** to the repository root (`.`), where `package.json`, `api/`, `serverless/`, and `vercel.json` live. The included Vercel configuration builds the Vite app into `dist`, maps stock API paths to their functions, and rewrites `/admin/...` to the SPA entry without rewriting `/api/...`.

In Vercel **Settings → Environment Variables**, configure the following for Production (and Preview if you use preview deployments):

| Variable | Value |
| --- | --- |
| `RENDER_API_URL` | `https://nexlume-qpds.onrender.com` |
| `STOCK_API_KEY` | The server-side key configured on the Render API |
| `STOCK_WRITE_TOKEN` | A separate secret required to authorize stock adjustments |

Generate a write token locally with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. Enter the generated value directly in Vercel and keep it private. Do not prefix secrets with `VITE_`, place them in React/browser code, or commit `.env`. Redeploy Vercel after adding or changing environment variables.

Test stock reads at `https://<your-vercel-domain>/api/stock`. The adjustment endpoint is `POST https://<your-vercel-domain>/api/stock/adjustments` with JSON `{ "productId": "P001", "action": "decrease", "quantity": 1 }` and header `x-stock-write-token` set to the configured write token. The function checks that authorization, then adds `STOCK_API_KEY` privately when it forwards the request to Render.

Latest live checks: the Vercel homepage returned **200**, while `/api/stock` returned **500** with `Render stock API server configuration is incomplete.` This is emitted before the proxy calls Render and means one or both required server-side Vercel values, `RENDER_API_URL` and `STOCK_API_KEY`, are missing. The Render `/api/stock` returned **401** without credentials, confirming that unauthenticated request is rejected; its authorized JSON response could not be verified without the private key. After deploying the fix, the function reports which setting is missing by variable name. HTTP **401** from Render means rejected credentials, **404** means a route is missing, **500** means a server/configuration error, and **502** means a network failure or timeout.

The local Node API stores stock in `server/private/commodities.json`. Render's filesystem persistence setting belongs to the separate backend deployment and cannot be verified from this frontend repository. If Render writes stock to a JSON file, configure a persistent disk for changes to survive restarts.

## Adjust and verify commodity quantities

The development server proxies requests to the API and adds the local key, so use the Vite URL printed by `npm run dev` (usually `http://localhost:5173`) for these PowerShell examples:

```powershell
$api = 'http://localhost:5173/api'
Invoke-RestMethod "$api/stock" # Read all seven current quantities
Invoke-RestMethod -Method Post -Uri "$api/stock/adjustments" -ContentType 'application/json' -Body '{"productId":"P001","action":"decrease","quantity":10}'
Invoke-RestMethod -Method Post -Uri "$api/stock/adjustments" -ContentType 'application/json' -Body '{"productId":"P001","action":"increase","quantity":10}'
Invoke-RestMethod "$api/stock" # Confirm the persisted quantity
```

Use `increase` to record a restock and `decrease` to record a distribution; the API rejects distributions greater than the available stock. The dashboard polls the API every five seconds, so leave it open and watch the quantity and status update after an adjustment.
