import { useState, useEffect } from 'react'
import { getStoredConsent, setAnalyticsConsent, trackEvent } from '../lib/analytics'
import useContent from '../hooks/useContent'

export default function CookieConsent() {
  const cookie = useContent('cookieConsent')
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Solo se pregunta a quien no haya decidido todavia.
    if (getStoredConsent()) return undefined
    const timer = setTimeout(() => setShow(true), 1500)
    return () => clearTimeout(timer)
  }, [])

  // Ya no hace falta arrancar nada aqui: la medicion arranca al cargar la web, denegada.
  // Esto solo cambia el permiso. La vista de pagina tampoco se reenvia, porque ya se mando
  // al entrar y `trackPageView` no repite la misma ruta.
  const accept = () => {
    setAnalyticsConsent(true)
    trackEvent('cookie_consent_accept')
    setShow(false)
  }

  // Rechazar deja el permiso denegado de forma EXPLICITA, que no es lo mismo que no haber
  // decidido. Y ahora este evento si llega: antes se enviaba a un gtag que no existia, asi
  // que nunca se supo cuanta gente rechazaba.
  const decline = () => {
    setAnalyticsConsent(false)
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
