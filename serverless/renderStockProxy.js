import { timingSafeEqual } from 'node:crypto'

const JSON_HEADERS = {
  'Cache-Control': 'no-store',
  'Content-Type': 'application/json; charset=utf-8',
  'X-Content-Type-Options': 'nosniff',
}

function sendJson(response, status, body) {
  response.writeHead(status, JSON_HEADERS)
  response.end(JSON.stringify(body))
}

function safeEquals(expectedValue, providedValue) {
  if (typeof expectedValue !== 'string' || typeof providedValue !== 'string') return false
  const expected = Buffer.from(expectedValue)
  const provided = Buffer.from(providedValue)
  return expected.length === provided.length && timingSafeEqual(expected, provided)
}

function parseAdjustment(request) {
  let body = request.body
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch {
      return null
    }
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)
    || typeof body.productId !== 'string'
    || body.productId.length < 1
    || body.productId.length > 40
    || !['increase', 'decrease'].includes(body.action)
    || !Number.isSafeInteger(body.quantity)
    || body.quantity < 1
    || body.quantity > 1_000_000) {
    return null
  }
  return body
}

export function createRenderStockProxy({ method, path, write = false, fetchImpl = fetch }) {
  return async function renderStockProxy(request, response) {
    if (request.method !== method) {
      response.setHeader('Allow', method)
      sendJson(response, 405, { error: 'Method not allowed.' })
      return
    }

    if (write) {
      if (!process.env.STOCK_WRITE_TOKEN) {
        sendJson(response, 503, { error: 'Stock adjustments are not configured on this deployment.' })
        return
      }
      if (!safeEquals(process.env.STOCK_WRITE_TOKEN, request.headers['x-stock-write-token'])) {
        sendJson(response, 401, { error: 'Unauthorized stock adjustment.' })
        return
      }
    }

    const apiKey = process.env.STOCK_API_KEY
    const apiUrl = process.env.RENDER_API_URL
    if (!apiKey || !apiUrl) {
      sendJson(response, 500, { error: 'Render stock API server configuration is incomplete.' })
      return
    }

    let target
    try {
      target = new URL(apiUrl)
      if (target.protocol !== 'https:') throw new Error('HTTPS is required.')
      target.pathname = `${target.pathname.replace(/\/+$/, '')}${path}`
      target.search = ''
      target.hash = ''
    } catch {
      sendJson(response, 500, { error: 'Render stock API URL configuration is invalid.' })
      return
    }

    const headers = { Accept: 'application/json', 'x-api-key': apiKey }
    const options = { method, headers, signal: AbortSignal.timeout(15000) }
    if (write) {
      const adjustment = parseAdjustment(request)
      if (!adjustment) {
        sendJson(response, 400, {
          error: 'Provide productId, action (increase or decrease), and a quantity from 1 to 1000000.',
        })
        return
      }
      headers['Content-Type'] = 'application/json'
      options.body = JSON.stringify(adjustment)
    }

    try {
      const upstream = await fetchImpl(target, options)
      const body = await upstream.text()
      response.writeHead(upstream.status, {
        'Cache-Control': 'no-store',
        'Content-Type': upstream.headers.get('content-type') || 'application/json; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
      })
      response.end(body)
    } catch (error) {
      const timedOut = error?.name === 'TimeoutError'
      console.error(`Render stock API ${method} request ${timedOut ? 'timed out' : 'failed'}.`)
      sendJson(response, 502, {
        error: timedOut
          ? 'Render stock API timed out. Check the Render service status and try again.'
          : 'Unable to reach the Render stock API. Check the service URL and network status.',
      })
    }
  }
}
