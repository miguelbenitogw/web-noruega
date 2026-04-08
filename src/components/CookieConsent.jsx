import { useState, useEffect } from 'react'
import { initAnalyticsWithConsent, trackEvent, trackPageView } from '../lib/analytics'
import useContent from '../hooks/useContent'

export default function CookieConsent() {
  const cookie = useContent('cookieConsent')
  const [show, setShow] = useState(false)

  useEffect(() => {
    const accepted = localStorage.getItem('gw-cookies')
    if (!accepted) {
      const timer = setTimeout(() => setShow(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const accept = () => {
    localStorage.setItem('gw-cookies', 'accepted')
    if (initAnalyticsWithConsent()) {
      trackPageView(`${window.location.pathname}${window.location.search}`)
    }
    trackEvent('cookie_consent_accept')
    setShow(false)
  }

  const decline = () => {
    localStorage.setItem('gw-cookies', 'declined')
    trackEvent('cookie_consent_decline')
    setShow(false)
  }

  if (!show) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[70] p-4 animate-[fadeInUp_0.5s_ease-out]"
      role="dialog"
      aria-label="Informasjonskapsler"
    >
      <div className="container-xl">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <p className="font-heading font-semibold text-ink text-sm mb-1">{cookie.title}</p>
            <p className="text-gray-500 text-xs leading-relaxed">
              {cookie.description}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={decline}
              className="px-4 py-2.5 text-gray-500 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              {cookie.declineLabel}
            </button>
            <button
              onClick={accept}
              className="px-5 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-colors shadow-sm cursor-pointer"
            >
              {cookie.acceptLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
