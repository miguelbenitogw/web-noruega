const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID

function isAnalyticsConfigured() {
  return typeof MEASUREMENT_ID === 'string' && MEASUREMENT_ID.trim().length > 0
}

function ensureGtagBootstrap() {
  if (window.gtag) return
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    window.dataLayer.push(arguments)
  }
  window.gtag('js', new Date())
}

function ensureGtagScript() {
  const scriptId = 'ga4-script'
  if (document.getElementById(scriptId)) return

  const script = document.createElement('script')
  script.id = scriptId
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`
  document.head.appendChild(script)
}

export function initAnalyticsWithConsent() {
  if (!isAnalyticsConfigured()) return false
  ensureGtagScript()
  ensureGtagBootstrap()
  window.gtag('config', MEASUREMENT_ID, { anonymize_ip: true })
  return true
}

export function trackEvent(eventName, params = {}) {
  if (!window.gtag || !isAnalyticsConfigured()) return
  window.gtag('event', eventName, params)
}

export function getAnalyticsMeasurementId() {
  return MEASUREMENT_ID || ''
}
