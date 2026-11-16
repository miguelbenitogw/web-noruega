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

  // Solo el aspecto: la logica de consentimiento de arriba no se toca.
  //
  // Antes era una tarjeta blanca con `rounded-2xl` y `shadow-2xl` — la sombra
  // mas fuerte de todo el sitio, en el elemento menos importante. Ahora es una
  // banda navy: el contraste con la pagina basta para despegarla del fondo, sin
  // sombra, y el navy dice «esto es el sistema, no el contenido».
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[70] p-3 sm:p-4 animate-riseIn"
      role="dialog"
      aria-label="Informasjonskapsler"
    >
      <div className="container-xl">
        <div className="bg-navy border border-white/10 rounded-panel px-5 py-5 sm:px-7 sm:py-6
                        flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
          <div className="flex-1">
            <p className="font-heading text-body-sm font-semibold text-white">{cookie.title}</p>
            <p className="mt-1.5 max-w-measure text-[0.875rem] leading-[1.6] text-primary-200">
              {cookie.description}
            </p>
          </div>
          <div className="flex shrink-0 gap-2.5">
            <button
              onClick={decline}
              className="flex-1 rounded-pill border border-white/30 px-5 py-2.5 font-ui text-[0.875rem]
                         font-semibold text-white/85 transition-colors hover:bg-white/10 hover:text-white cursor-pointer sm:flex-none"
            >
              {cookie.declineLabel}
            </button>
            <button
              onClick={accept}
              className="flex-1 rounded-pill bg-white px-5 py-2.5 font-ui text-[0.875rem] font-semibold
                         text-navy transition-colors hover:bg-primary-100 cursor-pointer sm:flex-none"
            >
              {cookie.acceptLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
