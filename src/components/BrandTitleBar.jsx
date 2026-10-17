import nexlumeLogo from '../assets/nexlume-logo.png'

export default function BrandTitleBar() {
  return (
    <section className="brand-title">
      <div className="brand-main">
        <img className="nexlume-logo" src={nexlumeLogo} alt="NEXLUME, Immersive Tomorrow" />
        <div className="brand-divider" />
        <div className="scheme-title">
          <strong lang="ta">பொது விநியோகத் திட்டம்</strong>
          <span>Fair Price Shop</span>
        </div>
      </div>
      <div className="tricolor-line" aria-hidden="true"><i /><i /><i /></div>
    </section>
  )
}
