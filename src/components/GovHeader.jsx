import tamilNaduSeal from '../assets/Seal_of_Tamil_Nadu.svg.webp'

export default function GovHeader() {
  return (
    <header className="gov-header">
      <div className="gov-identity">
        <div className="emblem-wrap">
          <img src={tamilNaduSeal} alt="Tamil Nadu government seal" />
        </div>
        <div className="gov-copy">
          <strong className="gov-tamil">தமிழ்நாடு அரசு</strong>
          <span className="gov-english">Government of Tamil Nadu</span>
          <span className="gov-department-ta">நுகர்வோர் விவகாரம் மற்றும் பொது விநியோகத் துறை</span>
          <span className="gov-department-en">Department of Consumer Affairs<br className="desktop-break" /> and Public Distribution</span>
        </div>
      </div>
    </header>
  )
}
