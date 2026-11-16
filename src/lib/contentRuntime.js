/**
 * Rutas del sitio.
 *
 * Antes este módulo además buscaba en Supabase la página publicada que
 * correspondía a cada ruta, con su caché y su resolución por alias. La tabla
 * `content_pages` estaba vacía — esa capa nunca llegó a usarse —, así que al
 * desconectar Supabase se fue entera y queda solo la resolución de rutas.
 */

const ROUTE_DEFINITIONS = {
  '/': { sectionRoute: 'home' },
  '/vr-rekrutteringsmodell': { sectionRoute: 'rekruttering' },
  '/helse': { sectionRoute: 'helse' },
  '/nyheter': { sectionRoute: 'nyheter' },
  '/journal': { sectionRoute: 'nyheter' },
  '/talentportalen': { sectionRoute: 'talentportalen' },
  '/om-oss': { sectionRoute: 'om-oss' },
  '/kontakt': { sectionRoute: 'kontakt' },
  '/spansk-i-alicante': { sectionRoute: 'spansk-i-alicante' },
  '/spansk-i-alicante/hvorfor': { sectionRoute: 'spansk-i-alicante-hvorfor' },
  '/spansk-i-alicante/livet-som-student': { sectionRoute: 'spansk-i-alicante-livet-som-student' },
  '/spansk-i-alicante/helsenorsk': { sectionRoute: 'spansk-i-alicante-helsenorsk' },
  '/personvern': { sectionRoute: 'personvern' },
  '/vilkar': { sectionRoute: 'vilkar' },
  '/cookies': { sectionRoute: 'cookies' },
}

const normalizePath = (pathname) => {
  if (!pathname || pathname === '/') return '/'
  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
}

export const resolveRouteContext = (pathname) => {
  const normalizedPath = normalizePath(pathname)
  const newsMatch = normalizedPath.match(/^\/(?:nyheter|journal)\/([^/]+)\/?$/)

  if (newsMatch) {
    return {
      pathname: normalizedPath,
      sectionRoute: 'nyheter',
      newsSlug: newsMatch[1],
      isNewsList: false,
      isNewsDetail: true,
    }
  }

  const definition = ROUTE_DEFINITIONS[normalizedPath] || null

  if (!definition) {
    return {
      pathname: normalizedPath,
      sectionRoute: null,
      newsSlug: null,
      isNewsList: false,
      isNewsDetail: false,
    }
  }

  return {
    pathname: normalizedPath,
    sectionRoute: definition.sectionRoute,
    newsSlug: null,
    isNewsList: definition.sectionRoute === 'nyheter',
    isNewsDetail: false,
  }
}

export const getKnownRoutes = () => Object.keys(ROUTE_DEFINITIONS)
