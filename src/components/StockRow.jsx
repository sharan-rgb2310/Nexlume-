export default function StockRow({ item }) {
  const Graphic = item.graphic
  const isLowStock = item.status === 'low_stock'
  const isOutOfStock = item.status === 'out_of_stock'
  const stockClass = isOutOfStock ? 'out-of-stock' : isLowStock ? 'low-stock' : ''

  return (
    <tr className="stock-row">
      <th scope="row" className="commodity-cell">
        <Graphic size={78} />
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
