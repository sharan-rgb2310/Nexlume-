/**
 * Government PDS API Stock Adapter (Future Integration Specification)
 * Connects to the official Tamil Nadu Civil Supplies and Consumer Protection
 * Department public distribution system API via a secure backend proxy.
 *
 * NOTE: Confidential API keys and tokens must remain on the backend proxy
 * and are never exposed in browser-facing code.
 */

export const governmentAdapter = {
  name: 'government',
  isLiveGovernment: true,

  async fetchStock(options = {}) {
    const { signal, endpoint = '/api/gov/stock' } = options

    const response = await fetch(endpoint, {
      headers: {
        Accept: 'application/json',
      },
      signal,
    })

    if (!response.ok) {
      if (response.status === 501 || response.status === 404) {
        throw new Error('The Government PDS stock API proxy is not yet configured or operational.')
      }
      throw new Error(`Government stock API returned HTTP ${response.status}`)
    }

    const payload = await response.json()
    if (!payload || !Array.isArray(payload.commodities)) {
      throw new Error('Unexpected government PDS response format.')
    }

    // Normalizes official government field names to the common Nexlume schema
    return {
      source: 'government',
      isDummyData: false,
      shopId: payload.fps_code || payload.shop_id,
      district: payload.district_name || 'Tamil Nadu',
      apiConfig: {
        autoRefreshEnabled: true,
        refreshIntervalMs: payload.refresh_interval_ms || 30000,
      },
      products: payload.commodities.map((item) => ({
        productId: item.commodity_code || item.item_id,
        productName: item.commodity_name_en || item.item_name,
        productNameTa: item.commodity_name_ta,
        availableQuantity: Number(item.balance_qty || item.stock_quantity || 0),
        unit: (item.measurement_unit || 'KG').toLowerCase(),
        lowStockThreshold: Number(item.buffer_limit || 25),
        status: Number(item.balance_qty || 0) <= 0
          ? 'out_of_stock'
          : Number(item.balance_qty || 0) <= Number(item.buffer_limit || 25)
            ? 'low_stock'
            : 'in_stock',
        pricePerUnit: Number(item.retail_rate || 0),
      })),
      timestamp: payload.generated_at || new Date().toISOString(),
    }
  },
}
