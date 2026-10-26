import assert from 'node:assert/strict'
import { test } from 'node:test'
import { demoAdapter } from '../src/services/stockAdapter/demoAdapter.js'
import { computeProductStatus } from '../src/services/productService.js'

test('computeProductStatus correctly determines stock availability', () => {
  assert.equal(computeProductStatus(0, 50), 'out_of_stock')
  assert.equal(computeProductStatus(-5, 50), 'out_of_stock')
  assert.equal(computeProductStatus(50, 50), 'low_stock')
  assert.equal(computeProductStatus(25, 50), 'low_stock')
  assert.equal(computeProductStatus(51, 50), 'in_stock')
  assert.equal(computeProductStatus(1200, 200), 'in_stock')
})

test('demoAdapter normalizes stock response into standard format', async () => {
  const fakePayload = {
    shopId: 'TN-RS-1001',
    district: 'Chennai',
    apiConfig: {
      autoRefreshEnabled: true,
      refreshIntervalMs: 10000,
    },
    products: [
      {
        productId: 'P001',
        productName: 'Rice',
        unit: 'kg',
        availableQuantity: 1800,
        lowStockThreshold: 200,
        status: 'in_stock',
      },
      {
        productId: 'P002',
        productName: 'Sugar',
        unit: 'kg',
        availableQuantity: 45,
        lowStockThreshold: 50,
        status: 'low_stock',
      },
    ],
  }

  // Intercept fetch
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => new Response(JSON.stringify(fakePayload), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })

  try {
    const result = await demoAdapter.fetchStock()
    assert.equal(result.source, 'demo')
    assert.equal(result.isDummyData, true)
    assert.equal(result.shopId, 'TN-RS-1001')
    assert.equal(result.products.length, 2)
    assert.equal(result.products[0].productName, 'Rice')
    assert.equal(result.products[0].availableQuantity, 1800)
    assert.equal(result.products[1].status, 'low_stock')
  } finally {
    globalThis.fetch = originalFetch
  }
})
