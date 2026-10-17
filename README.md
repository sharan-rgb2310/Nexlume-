# Tamil Nadu Fair Price Shop Stock Dashboard

A responsive, frontend-only React dashboard with inline SVG illustrations and a JSON-backed stock feed. The development build fetches the mock response from `public/mock/stock.json` and refreshes at the interval returned by that response.

## Run locally

```sh
npm install
npm run dev
```

## Connect a backend later

Set `VITE_STOCK_API_URL` in `.env` to the backend stock endpoint. The endpoint should return the same JSON shape as `public/mock/stock.json`. `VITE_STOCK_REFRESH_INTERVAL_MS` is the fallback polling interval; the response's `apiConfig` controls automatic refresh after the first successful fetch. Restart Vite after changing environment variables.
