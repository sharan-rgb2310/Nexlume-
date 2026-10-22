import { CalendarDays, MapPin } from 'lucide-react'
import { useEffect, useState } from 'react'

const fallbackDateTime = { date: '16 Oct 2026', time: '10:30 AM' }

function getCurrentDateTime() {
  const current = new Date()
  if (Number.isNaN(current.getTime())) return fallbackDateTime

  return {
    date: new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(current),
    time: new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(current),
  }
}

export default function ShopInfoBar({ shopInfo }) {
  const [dateTime, setDateTime] = useState(getCurrentDateTime)

  useEffect(() => {
    let intervalId
    const updateDateTime = () => setDateTime(getCurrentDateTime())
    const timeoutId = window.setTimeout(() => {
      updateDateTime()
      intervalId = window.setInterval(updateDateTime, 60_000)
    }, 60_000 - (Date.now() % 60_000))
    const syncWhenVisible = () => {
      if (document.visibilityState === 'visible') updateDateTime()
    }

    document.addEventListener('visibilitychange', syncWhenVisible)

    return () => {
      window.clearTimeout(timeoutId)
      window.clearInterval(intervalId)
      document.removeEventListener('visibilitychange', syncWhenVisible)
    }
  }, [])

  return (
    <section className="shop-info" aria-label="Shop information">
      <div className="shop-info-item shop-code">
        <div className="map-pin-circle"><MapPin role="img" aria-label="Shop code location pin" size={36} strokeWidth={3} fill="white" /></div>
        <div>
          <div className="info-label"><span lang="ta">கடை எண்</span><span>/</span><span>Shop ID</span></div>
          <strong className="shop-code-number">{shopInfo.code}</strong>
        </div>
      </div>
      <div className="shop-info-item shop-location">
        <div>
          <div className="info-label"><span lang="ta">கடை இருப்பிடம்</span><span>/</span><span>Shop Location</span></div>
          <strong lang="ta" className="location-ta">{shopInfo.locationTa}</strong>
          <span className="location-en">{shopInfo.locationEn}</span>
        </div>
      </div>
      <div className="shop-info-item shop-date">
        <CalendarDays role="img" aria-label="Current date and time" className="calendar-icon" size={33} strokeWidth={2.5} />
        <div>
          <div className="info-label"><span lang="ta">இன்றைய தேதி &amp; நேரம்</span></div>
          <strong className="date-value">{dateTime.date}</strong>
          <strong className="time-value">{dateTime.time}</strong>
        </div>
      </div>
    </section>
  )
}
