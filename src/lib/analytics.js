/**
 * analytics.js — medición con Consent Mode v2.
 *
 * QUÉ PROBLEMA RESUELVE (18-09-2026)
 * Antes, Analytics no arrancaba hasta que alguien pulsaba "Godta" en el aviso de cookies.
 * Era legalmente impecable y prácticamente ciego: en un periodo medido, Google dijo que nos
 * mandó 83 personas desde su buscador y Analytics registró 4. Una de cada veinte.
 *
 * (El dato de Google es fiable porque cuenta el clic en SU propia página de resultados, del
 * lado del servidor: no depende de JavaScript, ni de cookies, ni de que nadie acepte nada.)
 *
 * QUÉ CAMBIA Y QUÉ NO CAMBIA
 * Ahora la medición arranca SIEMPRE, pero arranca con el consentimiento DENEGADO por
 * defecto. Eso significa:
 *
 *   · Sin aceptar → gtag no escribe NINGUNA cookie ni identifica a nadie. Manda señales
 *     anónimas y sin identificador, que es lo que Google llama "cookieless pings".
 *   · Al aceptar  → se le dice a gtag que ya puede, y a partir de ahí mide con normalidad.
 *   · Al rechazar → se queda denegado para siempre en ese navegador.
 *
 * Lo que NO cambia es lo único que la ley protege: sin consentimiento no se guarda nada en
 * el dispositivo de nadie. Este es el mecanismo que el propio Google diseñó para el RGPD, y
 * es la razón por la que existe.
 *
 * EL ORDEN DE ESTE ARCHIVO ES LO ÚNICO QUE IMPORTA DE VERDAD
 * El `consent default` tiene que estar en la cola ANTES de que se cargue el script de
 * Google. Si se pone después, el script ya ha arrancado creyendo que tiene permiso y habrá
 * escrito cookies antes de enterarse de que no lo tenía. Por eso `initAnalytics()` hace las
 * cosas en este orden exacto y hay un comentario en cada paso: es el fallo clásico de esta
 * implementación y no se ve por ningún lado cuando ocurre.
 *
 * HASTA DÓNDE LLEGA ESTO, PARA QUE NADIE ESPERE DE MÁS
 * Las señales anónimas llegan a Google, pero para rellenar el hueco con estimaciones Google
 * exige un volumen mínimo de tráfico que esta web NO tiene. Así que las cifras mejorarán,
 * pero seguirán por debajo de la realidad. Para saber cuánta gente entra de verdad, la
 * fuente buena sigue siendo Search Console.
 */

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID

/** Dónde se recuerda la decisión del visitante. Compartido con CookieConsent.jsx. */
export const CONSENT_STORAGE_KEY = 'gw-cookies'

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

/**
 * Lee la decisión guardada. Devuelve `'accepted'`, `'declined'` o `null` si aún no decidió.
 *
 * El acceso va en try/catch porque en navegación privada, o con el almacenamiento del sitio
 * bloqueado, `localStorage` no lanza `undefined`: lanza una excepción. Sin esto, la web
 * entera se cae en blanco para ese visitante, y por medir.
 */
export function getStoredConsent() {
  try {
    return localStorage.getItem(CONSENT_STORAGE_KEY)
  } catch {
    return null
  }
}

function storeConsent(value) {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, value)
  } catch {
    // Si no se puede guardar, la decisión vale solo para esta visita. Es peor experiencia
    // (volverá a preguntar) pero nunca es un fallo de privacidad.
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

/**
 * Arranca la medición. Se puede llamar tantas veces como se quiera: solo hace algo la
 * primera. Devuelve `false` si no hay ID configurado.
 *
 * NO COMPRUEBA EL CONSENTIMIENTO PARA DECIDIR SI ARRANCA, y esa es justo la diferencia con
 * la versión anterior. Arranca siempre y le dice a Google qué tiene permitido hacer.
 */
export function initAnalytics() {
  if (!isAnalyticsConfigured()) return false
  if (analyticsInitialized) return true

  // 1. La cola primero. `gtag` no es más que un `push` a `window.dataLayer`, así que todo
  //    lo que se encole aquí lo leerá el script de Google en cuanto cargue.
  ensureGtagBootstrap()

  // 2. DENEGADO POR DEFECTO, Y ANTES DE CARGAR NADA. Este es el paso que hace que esto sea
  //    legal. Si se pusiera después del script, Google ya habría escrito cookies.
  //
  //    `wait_for_update` le dice que espere medio segundo por si el visitante ya había
  //    decidido antes: sin eso, el primer aviso saldría siempre como denegado aunque el
  //    paso 3 estuviera a punto de conceder el permiso.
  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted',
    wait_for_update: 500,
  })

  // 3. Si este visitante ya aceptó en una visita anterior, se le concede ya, sin esperar a
  //    que vuelva a ver el aviso (que no lo verá, porque ya decidió).
  if (getStoredConsent() === 'accepted') {
    window.gtag('consent', 'update', {
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      analytics_storage: 'granted',
    })
  }

  // 4. Ahora sí, el script.
  ensureGtagScript()

  // 5. `send_page_view: false` porque las vistas se mandan a mano desde `trackPageView`:
  //    esto es una web de una sola página, y si lo hiciera Google solo contaría la primera.
  window.gtag('config', MEASUREMENT_ID, {
    anonymize_ip: true,
    send_page_view: false,
  })

  analyticsInitialized = true
  return true
}

/**
 * Guarda la decisión del visitante y se la comunica a Google.
 *
 * `granted` a true concede; a false deniega explícitamente. Denegar de forma explícita no
 * es lo mismo que no haber decidido: deja constancia de que dijo que no.
 */
export function setAnalyticsConsent(granted) {
  storeConsent(granted ? 'accepted' : 'declined')

  // Si por lo que sea aún no se había arrancado, se arranca ahora: `initAnalytics` ya lee
  // el valor que se acaba de guardar, así que el permiso queda aplicado igual.
  if (!initAnalytics()) return false
  if (!window.gtag) return false

  const estado = granted ? 'granted' : 'denied'
  window.gtag('consent', 'update', {
    ad_storage: estado,
    ad_user_data: estado,
    ad_personalization: estado,
    analytics_storage: estado,
  })

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
  // Evita contar dos veces la misma página: el efecto de ruta se dispara más de una vez en
  // React, y sin esto la primera vista de cada visita saldría duplicada.
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
