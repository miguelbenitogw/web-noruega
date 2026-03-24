import { getContentLocale, isSupabaseConfigured } from './supabaseClient'
import { listPublishedPages } from './contentServices'

const ROUTE_DEFINITIONS = {
  '/': { sectionRoute: 'home', pageSlug: 'home', aliases: ['home', 'forside'] },
  '/vr-rekrutteringsmodell': { sectionRoute: 'rekruttering', pageSlug: 'vr-rekrutteringsmodell', aliases: ['vr-rekrutteringsmodell', 'rekruttering'] },
  '/helse': { sectionRoute: 'helse', pageSlug: 'helse', aliases: ['helse'] },
  '/nyheter': { sectionRoute: 'nyheter', pageSlug: 'nyheter', aliases: ['nyheter', 'journal'] },
  '/journal': { sectionRoute: 'nyheter', pageSlug: 'nyheter', aliases: ['journal', 'nyheter'] },
  '/talentportalen': { sectionRoute: 'talentportalen', pageSlug: 'talentportalen', aliases: ['talentportalen'] },
  '/om-oss': { sectionRoute: 'om-oss', pageSlug: 'om-oss', aliases: ['om-oss'] },
  '/kontakt': { sectionRoute: 'kontakt', pageSlug: 'kontakt', aliases: ['kontakt'] },
  '/admin': { sectionRoute: 'admin', pageSlug: 'admin', aliases: ['admin'] },
}

const normalizePath = (pathname) => {
  if (!pathname || pathname === '/') return '/'
  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
}

const normalizeLookupValue = (value) => String(value || '').trim().toLowerCase().replace(/\s+/g, '-').replace(/_/g, '-')

const unique = (values) => Array.from(new Set(values.filter(Boolean)))

const getPageLookupValues = (page) => {
  if (!page) return []

  const metadata = page.metadata || {}
  const metadataContent = metadata.content || {}

  return unique([
    page.slug,
    metadata.slug,
    metadata.route,
    metadata.page_kind,
    metadata.pageKind,
    metadataContent.slug,
    metadataContent.route,
    metadataContent.page_kind,
    metadataContent.pageKind,
  ].map(normalizeLookupValue))
}

export const resolveRouteContext = (pathname) => {
  const normalizedPath = normalizePath(pathname)
  const newsMatch = normalizedPath.match(/^\/(?:nyheter|journal)\/([^/]+)\/?$/)

  if (newsMatch) {
    const newsSlug = newsMatch[1]
    return {
      pathname: normalizedPath,
      sectionRoute: 'nyheter',
      pageSlug: 'nyheter',
      pageKind: 'nyheter',
      newsSlug,
      isNewsList: false,
      isNewsDetail: true,
      isAdmin: false,
      lookupSlugs: unique([newsSlug]),
      pageLookupSlugs: [],
    }
  }

  const definition = ROUTE_DEFINITIONS[normalizedPath] || null

  if (!definition) {
    return {
      pathname: normalizedPath,
      sectionRoute: null,
      pageSlug: null,
      pageKind: null,
      newsSlug: null,
      isNewsList: false,
      isNewsDetail: false,
      isAdmin: false,
      lookupSlugs: [],
      pageLookupSlugs: [],
    }
  }

  const pageLookupSlugs = unique([
    definition.pageSlug,
    definition.sectionRoute,
    ...(definition.aliases || []),
  ].map(normalizeLookupValue))

  return {
    pathname: normalizedPath,
    sectionRoute: definition.sectionRoute,
    pageSlug: definition.pageSlug,
    pageKind: definition.sectionRoute,
    newsSlug: null,
    isNewsList: definition.sectionRoute === 'nyheter',
    isNewsDetail: false,
    isAdmin: definition.sectionRoute === 'admin',
    lookupSlugs: pageLookupSlugs,
    pageLookupSlugs,
  }
}

const pagesCache = new Map()

const getPublishedPages = async (locale) => {
  if (!isSupabaseConfigured) return []

  const resolvedLocale = getContentLocale(locale)
  if (pagesCache.has(resolvedLocale)) {
    return pagesCache.get(resolvedLocale)
  }

  const promise = listPublishedPages(resolvedLocale).catch(() => [])
  pagesCache.set(resolvedLocale, promise)
  return promise
}

export const findPublishedPageForRoute = (pages, routeContext) => {
  if (!Array.isArray(pages) || !routeContext || routeContext.isAdmin || routeContext.isNewsDetail) {
    return null
  }

  const candidateSlugs = unique(routeContext.pageLookupSlugs || [])
  if (!candidateSlugs.length) return null

  const exactMatch = pages.find((page) => candidateSlugs.includes(normalizeLookupValue(page.slug)))
  if (exactMatch) return exactMatch

  return pages.find((page) => {
    const lookupValues = getPageLookupValues(page)
    return lookupValues.some((value) => candidateSlugs.includes(value))
  }) || null
}

export const loadPublishedPageForPath = async (pathname, locale) => {
  if (!isSupabaseConfigured) return null

  const routeContext = resolveRouteContext(pathname)
  if (!routeContext.sectionRoute || routeContext.isAdmin || routeContext.isNewsDetail) {
    return null
  }

  const pages = await getPublishedPages(locale)
  return findPublishedPageForRoute(pages, routeContext)
}
