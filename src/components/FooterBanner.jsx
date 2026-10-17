import { ChevronRight, Globe } from 'lucide-react'
import PeopleIcon from './graphics/PeopleIcon'

export default function FooterBanner() {
  return (
    <footer className="footer-banner">
      <div className="footer-message">
        <PeopleIcon size={79} />
        <div>
          <strong lang="ta">வெளிப்படைத் தன்மை கொண்ட பொது விநியோகம்</strong>
          <span>Transparent Stock. Informed Citizens.</span>
        </div>
      </div>
      <div className="footer-divider" />
      <div className="website-info">
        <div className="globe-badge"><Globe role="img" aria-label="Government website" size={34} strokeWidth={1.7} /></div>
        <div className="website-copy">
          <strong lang="ta">அரசு இணையதளம்</strong>
          <span>Government Website</span>
          <a href="https://www.tnpds.gov.in" target="_blank" rel="noreferrer">
            <span>www.tnpds.gov.in</span>
            <ChevronRight role="img" aria-label="Open website" size={21} strokeWidth={2.5} />
          </a>
        </div>
      </div>
    </footer>
  )
}
