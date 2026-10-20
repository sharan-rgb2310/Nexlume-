import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import { createRenderStockProxy } from '../serverless/renderStockProxy.js'

const originalEnvironment = {
  RENDER_API_URL: process.env.RENDER_API_URL,
  STOCK_API_KEY: process.env.STOCK_API_KEY,
  STOCK_WRITE_TOKEN: process.env.STOCK_WRITE_TOKEN,
}

afterEach(() => {
  for (const [key, value] of Object.entries(originalEnvironment)) {
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
})

function configureEnvironment() {
  process.env.RENDER_API_URL = 'https://render.example'
  process.env.STOCK_API_KEY = 'server-render-key'
  process.env.STOCK_WRITE_TOKEN = 'authorized-write-token'
}

function createResponse() {
  return {
    headers: {},
    setHeader(name, value) {
      this.headers[name] = value
    },
    writeHead(status, headers = {}) {
      this.status = status
      this.headers = { ...this.headers, ...headers }
    },
    end(body) {
      this.body = body
    },
  }
}

test('GET forwards server authentication and preserves Render JSON', async () => {
  configureEnvironment()
  let requestedUrl
  let requestOptions
  const proxy = createRenderStockProxy({
    method: 'GET',
    path: '/api/stock',
    fetchImpl: async (url, options) => {
      requestedUrl = url.href
      requestOptions = options
      return new Response('{"products":[]}', {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    },
  })
  const response = createResponse()

  await proxy({ method: 'GET', headers: {} }, response)

  assert.equal(requestedUrl, 'https://render.example/api/stock')
  assert.equal(requestOptions.headers['x-api-key'], 'server-render-key')
  assert.equal(response.status, 200)
  assert.equal(response.body, '{"products":[]}')
})

test('POST rejects missing write authorization without contacting Render', async () => {
  configureEnvironment()
  let fetchCalled = false
  const proxy = createRenderStockProxy({
    method: 'POST',
    path: '/api/stock/adjustments',
    write: true,
    fetchImpl: async () => {
      fetchCalled = true
      return new Response('{}')
    },
  })
  const response = createResponse()

  await proxy({ method: 'POST', headers: {}, body: { productId: 'P001', action: 'decrease', quantity: 1 } }, response)

  assert.equal(response.status, 401)
  assert.equal(fetchCalled, false)
})

test('authorized POST forwards a validated adjustment but not the write token', async () => {
  configureEnvironment()
  let requestedUrl
  let requestOptions
  const proxy = createRenderStockProxy({
    method: 'POST',
    path: '/api/stock/adjustments',
    write: true,
    fetchImpl: async (url, options) => {
      requestedUrl = url.href
      requestOptions = options
      return new Response('{"availableQuantity":9}', {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    },
  })
  const response = createResponse()

  await proxy({
    method: 'POST',
    headers: { 'x-stock-write-token': 'authorized-write-token' },
    body: { productId: 'P001', action: 'decrease', quantity: 1 },
  }, response)

  assert.equal(requestedUrl, 'https://render.example/api/stock/adjustments')
  assert.equal(requestOptions.headers['x-api-key'], 'server-render-key')
  assert.equal(requestOptions.headers['x-stock-write-token'], undefined)
  assert.equal(requestOptions.body, '{"productId":"P001","action":"decrease","quantity":1}')
  assert.equal(response.status, 200)
})

test('upstream 401, 404, and 500 statuses and bodies are preserved', async (context) => {
  for (const status of [401, 404, 500]) {
    await context.test(`preserves HTTP ${status}`, async () => {
      configureEnvironment()
      const proxy = createRenderStockProxy({
        method: 'GET',
        path: '/api/stock',
        fetchImpl: async () => new Response('{"error":"Upstream error"}', {
          status,
          headers: { 'Content-Type': 'application/json' },
        }),
      })
      const response = createResponse()

      await proxy({ method: 'GET', headers: {} }, response)

      assert.equal(response.status, status)
      assert.equal(response.body, '{"error":"Upstream error"}')
    })
  }
})

test('network failure returns a gateway error', async () => {
  configureEnvironment()
  const proxy = createRenderStockProxy({
    method: 'GET',
    path: '/api/stock',
    fetchImpl: async () => {
      throw new TypeError('network failed')
    },
  })
  const response = createResponse()

  await proxy({ method: 'GET', headers: {} }, response)

  assert.equal(response.status, 502)
  assert.match(response.body, /Unable to reach the Render stock API/)
})

test('invalid adjustment is rejected before contacting Render', async () => {
  configureEnvironment()
  let fetchCalled = false
  const proxy = createRenderStockProxy({
    method: 'POST',
    path: '/api/stock/adjustments',
    write: true,
    fetchImpl: async () => {
      fetchCalled = true
      return new Response('{}')
    },
  })
  const response = createResponse()

  await proxy({
    method: 'POST',
    headers: { 'x-stock-write-token': 'authorized-write-token' },
    body: { productId: 'P001', action: 'decrease', quantity: 0 },
  }, response)

  assert.equal(response.status, 400)
  assert.equal(fetchCalled, false)
})
