import BrandTitleBar from './components/BrandTitleBar'
import BottomStripe from './components/BottomStripe'
import FooterBanner from './components/FooterBanner'
import GovHeader from './components/GovHeader'
import InfoNote from './components/InfoNote'
import ShopInfoBar from './components/ShopInfoBar'
import StockTable from './components/StockTable'
import useStockData from './data/useStockData'

export default function App() {
  const {
    shopInfo,
    products,
    isDummyData,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    refresh,
  } = useStockData()

  return (
    <main className="dashboard-card">
      <GovHeader />
      <BrandTitleBar />
      <div className="dashboard-content">
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
