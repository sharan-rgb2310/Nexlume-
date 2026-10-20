# Tamil Nadu Fair Price Shop Stock Dashboard

A responsive React dashboard with inline SVG illustrations and a server-backed commodity stock feed. Seven sample commodities are stored outside the public web directory and served by an API protected with a generated server-side key.

The stock dashboard is available at `/`. The Admin console is integrated into the same application at `/admin`, with its Shops and Settings pages at `/admin/shops` and `/admin/settings`.
The Admin console starts with no shop or device records. Previously saved built-in sample records are removed when the Admin app loads; other saved records are kept.

## Run locally

```sh
npm install
npm run dev
```

The API key is generated into the ignored `.env` file when you set up the local API. The Vite server proxies browser requests through the backend using that key; it is never included in the frontend bundle. Do not commit `.env`.

For production preview, run `npm run api` in one terminal and `npm run preview` in another. The preview proxy also forwards API requests to the local backend. The response's `apiConfig` controls automatic stock refresh.

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
