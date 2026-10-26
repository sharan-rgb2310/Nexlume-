import { useState } from 'react'
import BrandTitleBar from './components/BrandTitleBar'
import BottomStripe from './components/BottomStripe'
import FooterBanner from './components/FooterBanner'
import GovHeader from './components/GovHeader'
import InfoNote from './components/InfoNote'
import ShopInfoBar from './components/ShopInfoBar'
import StockTable from './components/StockTable'
import useStockData from './data/useStockData'

export default function App() {
  const [selectedShopId, setSelectedShopId] = useState('')
  const [selectedPanelId, setSelectedPanelId] = useState('')

  const {
    shopInfo,
    shops,
    panels,
    products,
    isDummyData,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    refresh,
  } = useStockData({ shopId: selectedShopId, panelId: selectedPanelId })

  const availablePanels = selectedShopId
    ? panels.filter((p) => p.shop_id === selectedShopId)
    : panels

  return (
    <main className="dashboard-card">
      <GovHeader />
      <BrandTitleBar />
      <div className="dashboard-content">
        {shops.length > 1 && (
          <div className="public-filter-bar" style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: '10px 4%',
            background: '#f0f6ff',
            borderBottom: '1px solid #dbeafe',
            fontSize: '13px',
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#1e3a8a' }}>
              <span>Shop:</span>
              <select
                value={selectedShopId}
                onChange={(e) => {
                  setSelectedShopId(e.target.value)
                  setSelectedPanelId('')
                }}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #bfdbfe',
                  background: '#fff',
                  fontWeight: 500,
                  color: '#1e293b',
                  fontSize: '13px',
                }}
              >
                <option value="">All Shops ({shops.length})</option>
                {shops.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.shop_code || s.id})</option>
                ))}
              </select>
            </label>

            {availablePanels.length > 0 && (
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#1e3a8a' }}>
                <span>Display Panel:</span>
                <select
                  value={selectedPanelId}
                  onChange={(e) => setSelectedPanelId(e.target.value)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid #bfdbfe',
                    background: '#fff',
                    fontWeight: 500,
                    color: '#1e293b',
                    fontSize: '13px',
                  }}
                >
                  <option value="">All Panels</option>
                  {availablePanels.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.panel_code || p.id})</option>
                  ))}
                </select>
              </label>
            )}
          </div>
        )}

        {shopInfo && <ShopInfoBar shopInfo={shopInfo} />}
        <StockTable
          products={products}
          isDummyData={isDummyData}
          isLoading={isLoading}
          isRefreshing={isRefreshing}
          error={error}
          lastUpdated={lastUpdated}
          onRefresh={refresh}
        />
        <InfoNote />
        <FooterBanner />
      </div>
      <BottomStripe />
    </main>
  )
}
