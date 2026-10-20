import { timingSafeEqual } from 'node:crypto'
import { readFile, rename, writeFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { fileURLToPath } from 'node:url'

const apiKey = process.env.STOCK_API_KEY
const port = Number(process.env.API_PORT || 3001)
const stockFile = fileURLToPath(new URL('./private/commodities.json', import.meta.url))
const temporaryStockFile = `${stockFile}.${process.pid}.tmp`
let adjustmentQueue = Promise.resolve()

if (!apiKey) {
  throw new Error('STOCK_API_KEY is missing. Generate it in the local .env file before starting the API.')
}

function isAuthorized(providedKey) {
  if (typeof providedKey !== 'string') return false

  const expected = Buffer.from(apiKey)
  const provided = Buffer.from(providedKey)
  return expected.length === provided.length && timingSafeEqual(expected, provided)
}

function sendJson(response, status, payload) {
  response.writeHead(status, {
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
  })
  response.end(JSON.stringify(payload))
}

async function readRequestBody(request) {
  let body = ''
  for await (const chunk of request) {
    body += chunk
    if (body.length > 4096) throw new Error('Request body is too large.')
  }
  return JSON.parse(body)
}

async function adjustStock({ productId, action, quantity }) {
  const stock = JSON.parse(await readFile(stockFile, 'utf8'))
  const product = stock.products.find((item) => item.productId === productId)
  if (!product) return { status: 404, payload: { error: 'Commodity not found.' } }

  if (action === 'decrease' && quantity > product.availableQuantity) {
    return { status: 409, payload: { error: 'Cannot distribute more than the available quantity.' } }
  }

  if (action === 'increase') {
    product.receivedQuantity = (product.receivedQuantity || 0) + quantity
    product.availableQuantity += quantity
  } else {
    product.distributedQuantity += quantity
    product.availableQuantity -= quantity
  }
  product.status = product.availableQuantity === 0
    ? 'out_of_stock'
    : product.availableQuantity <= product.lowStockThreshold
      ? 'low_stock'
      : 'in_stock'

  await writeFile(temporaryStockFile, `${JSON.stringify(stock, null, 2)}\n`)
  await rename(temporaryStockFile, stockFile)
  return {
    status: 200,
    payload: {
      productId: product.productId,
      productName: product.productName,
      action,
      quantity,
      availableQuantity: product.availableQuantity,
      status: product.status,
    },
  }
}

const server = createServer(async (request, response) => {
  const requestUrl = new URL(request.url || '/', 'http://localhost')
  if (!['GET', 'POST'].includes(request.method)
    || !['/api/stock', '/api/stock/adjustments'].includes(requestUrl.pathname)
    || (request.method === 'GET' && requestUrl.pathname !== '/api/stock')
    || (request.method === 'POST' && requestUrl.pathname !== '/api/stock/adjustments')) {
    sendJson(response, 404, { error: 'Not found.' })
    return
  }

  if (!isAuthorized(request.headers['x-api-key'])) {
    sendJson(response, 401, { error: 'Unauthorized.' })
    return
  }

  try {
    if (request.method === 'GET') {
      const stock = await readFile(stockFile)
      response.writeHead(200, {
        'Cache-Control': 'no-store',
        'Content-Type': 'application/json; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
      })
      response.end(stock)
      return
    }

    let adjustment
    try {
      adjustment = await readRequestBody(request)
    } catch {
      sendJson(response, 400, { error: 'Request body must be valid JSON and no larger than 4 KB.' })
      return
    }
    if (!adjustment || typeof adjustment !== 'object' || Array.isArray(adjustment)
      || typeof adjustment.productId !== 'string'
      || !['increase', 'decrease'].includes(adjustment.action)
      || !Number.isSafeInteger(adjustment.quantity)
      || adjustment.quantity < 1
      || adjustment.quantity > 1_000_000) {
      sendJson(response, 400, {
        error: 'Provide productId, action (increase or decrease), and a quantity from 1 to 1000000.',
      })
      return
    }

    const result = adjustmentQueue.then(() => adjustStock(adjustment))
    adjustmentQueue = result.then(() => undefined, () => undefined)
    const { status, payload } = await result
    sendJson(response, status, payload)
  } catch (error) {
    console.error('Commodity stock request failed.', error)
    sendJson(response, 500, { error: 'Commodity data is temporarily unavailable.' })
  }
})

const PORT = process.env.PORT || 3001;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Commodity API listening on port ${PORT}`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)))
}
