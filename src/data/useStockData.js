import { useCallback, useEffect, useRef, useState } from 'react'
import { getCommodityGraphic, formatUnitLabel } from './stock'
import { getProducts, subscribeToProductChanges, computeProductStatus } from '../services/productService'
import { fetchLiveStock } from '../services/stockAdapter'
import { getShops } from '../services/shopService'
import { getPanels } from '../services/panelService'

const REFRESH_INTERVAL_MS = 10000 // Exact 10 seconds requirement

export default function useStockData(filterOptions = {}) {
  const { shopId, panelId } = filterOptions

  const [dbProducts, setDbProducts] = useState([])
  const [liveFeed, setLiveFeed] = useState(null)
  const [shops, setShops] = useState([])
  const [panels, setPanels] = useState([])
  const [selectedShop, setSelectedShop] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)

  const requestRef = useRef(null)
  const pollTimerRef = useRef(null)

  // 1. Load Shops & Panels metadata
  useEffect(() => {
    let mounted = true
    Promise.all([getShops(), getPanels()]).then(([shopsList, panelsList]) => {
      if (!mounted) return
      setShops(shopsList)
      setPanels(panelsList)
      const current = shopsList.find((s) => s.id === shopId) || shopsList[0]
      setSelectedShop(current)
    }).catch(console.error)

    return () => {
      mounted = false
    }
  }, [shopId])

  // 2. Fetch base products from Supabase
  const loadDbProducts = useCallback(async () => {
    try {
      const records = await getProducts({ shopId, panelId })
      setDbProducts(records)
      setError('')
    } catch (err) {
      console.warn('Could not fetch products from database', err)
      setError(err.message || 'Unable to load products from database.')
    } finally {
      setIsLoading(false)
    }
  }, [shopId, panelId])

  useEffect(() => {
    loadDbProducts()
  }, [loadDbProducts])

  // 3. Supabase Realtime subscription
  useEffect(() => {
    const unsubscribe = subscribeToProductChanges(() => {
      loadDbProducts()
    })
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe()
    }
  }, [loadDbProducts])

  // 4. Poll stock feed every 10 seconds (10,000 ms)
  const refreshFeed = useCallback(async () => {
    if (requestRef.current) return // Prevent overlapping requests

    const controller = new AbortController()
    requestRef.current = controller
    setIsRefreshing(true)

    try {
      const feed = await fetchLiveStock({ signal: controller.signal })
      setLiveFeed(feed)
      setError('')
      setLastUpdated(new Date())
    } catch (err) {
      if (err.name !== 'AbortError') {
        // Keep previously valid data, just record error message
        setError(err.message || 'Unable to refresh live stock feed.')
      }
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null
        setIsRefreshing(false)
      }
    }
  }, [])

  useEffect(() => {
    // Initial fetch on mount
    refreshFeed()

    // 10-second polling interval
    pollTimerRef.current = window.setInterval(() => {
      refreshFeed()
    }, REFRESH_INTERVAL_MS)

    return () => {
      if (pollTimerRef.current) window.clearInterval(pollTimerRef.current)
      requestRef.current?.abort()
      requestRef.current = null
    }
  }, [refreshFeed])

  // 5. Merge Supabase persistent catalog with live stock feed readings
  const mergedProducts = dbProducts.map((prod) => {
    // Look for matching product in live feed by product_code or product name
    const match = liveFeed?.products?.find((feedItem) => {
      if (prod.product_code && feedItem.productId && prod.product_code === feedItem.productId) return true
      if (feedItem.productName && prod.name && feedItem.productName.toLowerCase() === prod.name.toLowerCase()) return true
      return false
    })

    const finalStock = match ? match.availableQuantity : Number(prod.quantity || 0)
    const threshold = Number(prod.low_stock_threshold || match?.lowStockThreshold || 20)
    const status = match?.status || computeProductStatus(finalStock, threshold)
    const unitInfo = formatUnitLabel(prod.unit)

    return {
      id: prod.id,
      product_code: prod.product_code,
      en: prod.name,
      ta: prod.name_ta || prod.name,
      stock: finalStock,
      unitEn: unitInfo.en,
      unitTa: prod.unit_ta || unitInfo.ta,
      image_url: prod.image_url,
      image_path: prod.image_path,
      graphic: getCommodityGraphic(prod.name),
      status,
      lowStockThreshold: threshold,
      shop_id: prod.shop_id,
      panel_id: prod.panel_id,
      category: prod.category,
      description: prod.description,
      lastUpdated,
    }
  })

  const shopInfo = {
    code: selectedShop?.shop_code || selectedShop?.id || liveFeed?.shopId || 'TN-RS-1001',
    name: selectedShop?.name || 'Tamil Nadu Fair Price Shop',
    locationTa: selectedShop?.district === 'Chennai' ? 'சென்னை, தமிழ்நாடு' : `${selectedShop?.district || 'சென்னை'}, தமிழ்நாடு`,
    locationEn: `${selectedShop?.district || 'Chennai'}, Tamil Nadu`,
  }

  return {
    shopInfo,
    shops,
    panels,
    products: mergedProducts,
    isDummyData: liveFeed?.isDummyData ?? true,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    refresh: refreshFeed,
  }
}
