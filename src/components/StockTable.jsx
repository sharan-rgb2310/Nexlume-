import { Package, RefreshCw } from 'lucide-react'
import StockRow from './StockRow'

export default function StockTable({
  products,
  isDummyData,
  isLoading,
  isRefreshing,
  error,
  lastUpdated,
  onRefresh,
}) {
  const updatedLabel = lastUpdated
    ? new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(lastUpdated)
    : 'not synced yet'

  return (
    <section className="stock-section" aria-labelledby="stock-heading">
      <div className="stock-titlebar">
        <Package role="img" aria-label="Commodity stock package" className="stock-package-icon" size={43} strokeWidth={2.5} />
        <div className="stock-heading-copy">
          <h2 id="stock-heading" lang="ta">பொருட்கள் இருப்பு விவரம்</h2>
          <span>Commodity Stock Available</span>
        </div>
        <div className="live-stock">
          <span className="live-dot" />
          <span>Live Stock</span>
          <span className="sr-only" aria-live="polite">
            {isDummyData ? 'Using dummy data. ' : 'Connected to stock API. '}Last updated at {updatedLabel}
          </span>
          <button
            type="button"
            className={`refresh-button${isRefreshing ? ' is-refreshing' : ''}`}
            aria-label={`Refresh stock data. Last updated ${updatedLabel}`}
            title={`Last updated ${updatedLabel}`}
            onClick={onRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw role="img" aria-label="Refresh stock" size={22} strokeWidth={2.2} />
          </button>
        </div>
      </div>
      {error && <p className="stock-error" role="alert">Unable to sync stock data: {error}</p>}
      <div className="table-shell">
        <table className="stock-table">
          <colgroup><col className="commodity-column" /><col className="stock-column" /><col className="unit-column" /></colgroup>
          <thead>
            <tr>
              <th scope="col"><span lang="ta">பொருள்</span><span>/</span><span>Commodity</span></th>
              <th scope="col"><span lang="ta">இருப்பு அளவு</span><span>/</span><span>Stock Available</span></th>
              <th scope="col"><span lang="ta">அலகு</span><span>/</span><span>Unit</span></th>
            </tr>
          </thead>
          <tbody>
            {products.map((item) => <StockRow key={item.id} item={item} />)}
            {isLoading && products.length === 0 && (
              <tr><td className="empty-stock" colSpan="3">Connecting to stock data…</td></tr>
            )}
            {!isLoading && products.length === 0 && !error && (
              <tr><td className="empty-stock" colSpan="3">No stock data is available.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
