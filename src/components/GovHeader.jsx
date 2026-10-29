import { useEffect, useState } from 'react'
import tamilNaduSeal from '../assets/Seal_of_Tamil_Nadu.svg.webp'

export default function GovHeader() {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const syncFullscreenState = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', syncFullscreenState)
    return () => document.removeEventListener('fullscreenchange', syncFullscreenState)
  }, [])

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else {
        await document.documentElement.requestFullscreen()
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Fullscreen mode could not be changed.'
      window.alert(`Fullscreen mode could not be changed: ${message}`)
    }
  }

  return (
    <header className="gov-header">
      <div className="gov-copy gov-copy-left">
        <strong className="gov-tamil">தமிழ்நாடு அரசு</strong>
        <span className="gov-english">Government of Tamil Nadu</span>
      </div>
      <div className="gov-header-divider" aria-hidden="true" />
      <div className="emblem-wrap">
        <button
          type="button"
          className="emblem-fullscreen-toggle"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          <img src={tamilNaduSeal} alt="Tamil Nadu government seal" />
        </button>
      </div>
      <div className="gov-header-divider" aria-hidden="true" />
      <div className="gov-copy gov-copy-right">
        <span className="gov-department-ta">உணவு வழங்கல் மற்றும்<br />நுகர்வோர் பாதுகாப்புத் துறை</span>
        <span className="gov-department-en">Civil Supplies and Consumer<br />Protection Department</span>
      </div>
    </header>
  )
}
