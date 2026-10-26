/**
 * Demo Stock Adapter
 * Fetches stock data from the local mock/Node stock endpoint (/api/stock).
 */

export const demoAdapter = {
  name: 'demo',
  isLiveGovernment: false,

  async fetchStock(options = {}) {
    const { signal, endpoint = '/api/stock' } = options

    const response = await fetch(endpoint, {
      headers: { Accept: 'application/json' },
      signal,
    })

    if (!response.ok) {
      throw new Error(`Demo stock request failed with HTTP ${response.status}`)
    }

    const payload = await response.json()
    if (!payload || !Array.isArray(payload.products)) {
      throw new Error('Invalid demo stock payload structure.')
    }

    return {
      source: 'demo',
      isDummyData: true,
      shopId: payload.shopId || 'TN-RS-1001',
      district: payload.district || 'Chennai',
      apiConfig: {
        autoRefreshEnabled: payload.apiConfig?.autoRefreshEnabled ?? true,
        refreshIntervalMs: payload.apiConfig?.refreshIntervalMs || 10000,
      },
      products: payload.products.map((item) => ({
        productId: item.productId || item.id,
        productName: item.productName || item.en || item.name,
        availableQuantity: Number(item.availableQuantity ?? item.stock ?? 0),
        unit: item.unit || 'kg',
        lowStockThreshold: Number(item.lowStockThreshold || 20),
        status: item.status || 'in_stock',
        pricePerUnit: item.pricePerUnit || 0,
      })),
      timestamp: new Date().toISOString(),
    }
  },
}
