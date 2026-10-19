import TamilNaduMap from './graphics/TamilNaduMap'

export default function BrandTitleBar() {
  return (
    <section className="brand-title">
      <div className="brand-main">
        <div className="scheme-title">
          <strong lang="ta">பொது விநியோகத் திட்டம்</strong>
          <span>Fair Price Shop</span>
        </div>
        <div className="brand-divider" aria-hidden="true" />
        <div className="digital-identity">
          <TamilNaduMap size={72} />
          <div>
            <strong>Digital Tamil Nadu</strong>
            <span>Transparent Services<br />Stronger Communities</span>
          </div>
        </div>
      </div>
      <div className="tricolor-line" aria-hidden="true"><i /><i /><i /></div>
    </section>
  )
}
