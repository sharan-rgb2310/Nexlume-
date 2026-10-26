import { demoAdapter } from './demoAdapter'
import { governmentAdapter } from './governmentAdapter'

const adapters = {
  demo: demoAdapter,
  government: governmentAdapter,
  gov: governmentAdapter,
}

export function getActiveStockAdapter() {
  const configured = (import.meta.env.VITE_STOCK_SOURCE || 'demo').toLowerCase()
  return adapters[configured] || demoAdapter
}

export async function fetchLiveStock(options = {}) {
  const adapter = getActiveStockAdapter()
  return adapter.fetchStock(options)
}

export { demoAdapter, governmentAdapter }
