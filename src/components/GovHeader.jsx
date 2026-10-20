import tamilNaduSeal from '../assets/Seal_of_Tamil_Nadu.svg.webp'

export default function GovHeader() {
  return (
    <header className="gov-header">
      <div className="gov-copy gov-copy-left">
        <strong className="gov-tamil">தமிழ்நாடு அரசு</strong>
        <span className="gov-english">Government of Tamil Nadu</span>
      </div>
      <div className="emblem-wrap">
        <img src={tamilNaduSeal} alt="Tamil Nadu government seal" />
      </div>
      <div className="gov-copy gov-copy-right">
        <span className="gov-department-ta">உணவுப் பொருள் வழங்கல் மற்றும் நுகர்வோர் பாதுகாப்புத் துறை</span>
        <span className="gov-department-en">Civil Supplies and Consumer Protection Department</span>
      </div>
    </header>
  )
}
