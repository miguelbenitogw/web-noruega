const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID
let analyticsInitialized = false
let lastTrackedPagePath = ''

function isAnalyticsConfigured() {
  return typeof MEASUREMENT_ID === 'string' && MEASUREMENT_ID.trim().length > 0
}

function getCurrentPagePath() {
  return `${window.location.pathname}${window.location.search}`
}

function getDefaultEventContext() {
  return {
    page_path: getCurrentPagePath(),
    page_location: window.location.href,
    page_title: document.title,
  }
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
  if (!analyticsInitialized) {
    window.gtag('config', MEASUREMENT_ID, {
      anonymize_ip: true,
      send_page_view: false,
    })
    analyticsInitialized = true
  }
  return true
}

export function trackEvent(eventName, params = {}) {
  if (!window.gtag || !isAnalyticsConfigured()) return
  const payload = {
    ...getDefaultEventContext(),
    ...params,
    ...(import.meta.env.DEV ? { debug_mode: true } : {}),
  }
  window.gtag('event', eventName, payload)
}

export function trackPageView(path) {
  if (!window.gtag || !isAnalyticsConfigured()) return false
  if (typeof path !== 'string' || !path.trim()) return false
  if (path === lastTrackedPagePath) return false

  window.gtag('event', 'page_view', {
    page_path: path,
    page_location: `${window.location.origin}${path}`,
    page_title: document.title,
    ...(import.meta.env.DEV ? { debug_mode: true } : {}),
  })
  lastTrackedPagePath = path
  return true
}

export function getAnalyticsMeasurementId() {
  return MEASUREMENT_ID || ''
}
