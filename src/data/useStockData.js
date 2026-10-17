import { useCallback, useEffect, useRef, useState } from 'react'
import { normalizeStockResponse } from './stock'

const apiUrl = import.meta.env.VITE_STOCK_API_URL || '/mock/stock.json'
const configuredRefreshInterval = Number(import.meta.env.VITE_STOCK_REFRESH_INTERVAL_MS || 5000)
const fallbackRefreshInterval = Number.isFinite(configuredRefreshInterval) && configuredRefreshInterval >= 1000
  ? configuredRefreshInterval
  : 5000

export default function useStockData() {
  const [stock, setStock] = useState({
    shopInfo: null,
    products: [],
    refreshIntervalMs: fallbackRefreshInterval,
    autoRefreshEnabled: true,
    isDummyData: false,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)
  const requestRef = useRef(null)

  const refresh = useCallback(async () => {
    if (requestRef.current) return

    const controller = new AbortController()
    requestRef.current = controller
    setIsRefreshing(true)

    try {
      const response = await fetch(apiUrl, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      })
      if (!response.ok) {
        throw new Error(`Stock request failed with HTTP ${response.status}.`)
      }

      const result = normalizeStockResponse(await response.json())
      setStock({
        ...result,
        refreshIntervalMs: result.apiConfig.refreshIntervalMs,
        autoRefreshEnabled: result.apiConfig.autoRefreshEnabled,
      })
      setError('')
      setLastUpdated(new Date())
    } catch (refreshError) {
      if (refreshError.name !== 'AbortError') {
        setError(refreshError.message || 'Unable to fetch stock data.')
      }
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null
        setIsLoading(false)
        setIsRefreshing(false)
      }
    }
  }, [])

  useEffect(() => {
    const initialRequest = window.setTimeout(() => void refresh(), 0)
    return () => {
      window.clearTimeout(initialRequest)
      requestRef.current?.abort()
      requestRef.current = null
    }
  }, [refresh])

  useEffect(() => {
    if (!stock.autoRefreshEnabled || !Number.isFinite(stock.refreshIntervalMs)) return undefined

    const intervalId = window.setInterval(() => void refresh(), stock.refreshIntervalMs)
    return () => window.clearInterval(intervalId)
  }, [refresh, stock.autoRefreshEnabled, stock.refreshIntervalMs])

  return {
    shopInfo: stock.shopInfo,
    products: stock.products,
    isDummyData: stock.isDummyData,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    refresh,
  }
}
