import { useCallback, useEffect, useRef, useState } from 'react'
import { advanceDemoProducts } from './demoStock'
import { normalizeStockResponse } from './stock'

const configuredRefreshInterval = Number(import.meta.env.VITE_STOCK_REFRESH_INTERVAL_MS || 5000)
const demoRefreshInterval = 4000
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
      const response = await fetch('/api/stock', {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      })
      if (!response.ok) {
        const details = await response.json().catch(() => null)
        const diagnosis = {
          401: 'The Render API rejected its server-side key. Check the server-side Render API key configuration.',
          404: 'The stock route was not found. Check the Vercel API deployment and Render endpoint path.',
          500: 'The stock API reported a server error. Check the Vercel and Render service logs.',
          502: 'The Vercel proxy could not reach Render. Check the Render service status and URL.',
        }[response.status]
        const serverMessage = typeof details?.error === 'string' ? ` ${details.error}` : ''
        throw new Error(`Stock request failed with HTTP ${response.status}.${diagnosis ? ` ${diagnosis}` : ''}${serverMessage}`)
      }

      const contentType = response.headers.get('content-type') ?? ''
      if (!contentType.includes('application/json')) {
        throw new Error(`The stock API returned an unexpected response (${response.status}). The server may not be configured correctly — check that the /api/stock route is deployed and returning JSON.`)
      }
      const result = normalizeStockResponse(await response.json())
      setStock({
        ...result,
        refreshIntervalMs: result.isDummyData ? demoRefreshInterval : result.apiConfig.refreshIntervalMs,
        autoRefreshEnabled: result.apiConfig.autoRefreshEnabled,
      })
      setError('')
      setLastUpdated(new Date())
    } catch (refreshError) {
      if (refreshError.name !== 'AbortError') {
        setError(refreshError instanceof TypeError
          ? 'Unable to reach the stock API. Check the network connection and deployed API service.'
          : refreshError.message || 'Unable to fetch stock data.')
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
    if (stock.isDummyData || !stock.autoRefreshEnabled || !Number.isFinite(stock.refreshIntervalMs)) return undefined

    const intervalId = window.setInterval(() => void refresh(), stock.refreshIntervalMs)
    return () => window.clearInterval(intervalId)
  }, [refresh, stock.autoRefreshEnabled, stock.isDummyData, stock.refreshIntervalMs])

  useEffect(() => {
    if (!stock.isDummyData || stock.products.length === 0) return undefined

    const intervalId = window.setInterval(() => {
      setStock((current) => ({ ...current, products: advanceDemoProducts(current.products) }))
      setLastUpdated(new Date())
    }, demoRefreshInterval)

    return () => window.clearInterval(intervalId)
  }, [stock.isDummyData, stock.products.length])

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
