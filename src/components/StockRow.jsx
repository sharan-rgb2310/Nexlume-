export default function StockRow({ item }) {
  const Graphic = item.graphic
  const isLowStock = item.status === 'low_stock'
  const isOutOfStock = item.status === 'out_of_stock'
  const stockClass = isOutOfStock ? 'out-of-stock' : isLowStock ? 'low-stock' : ''

  return (
    <tr className="stock-row">
      <th scope="row" className="commodity-cell">
        <span className="commodity-art" style={{ width: 78, height: 78, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.en}
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
              onError={(e) => {
                // Fallback to graphic on broken image
                e.currentTarget.style.display = 'none'
              }}
            />
          ) : Graphic ? (
            <Graphic size={78} />
          ) : null}
        </span>
        <span className="commodity-name">
          <strong lang="ta">{item.ta}</strong>
          <span>{item.en}</span>
        </span>
      </th>
      <td className="stock-cell">
        <span className={`stock-pill ${stockClass}`.trim()} title={item.status.replaceAll('_', ' ')}>
          {item.stock.toLocaleString('en-US')}
        </span>
      </td>
      <td className="unit-cell">
        <strong lang="ta">{item.unitTa}</strong>
        <span>{item.unitEn}</span>
      </td>
    </tr>
  )
}
