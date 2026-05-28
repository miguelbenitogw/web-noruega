import { useEffect, useMemo, useState } from 'react'
import { readContentOverrides, sanitizeContentOverrides, CONTENT_OVERRIDE_EVENT } from '../lib/contentOverrides'
import { fetchPublishedContentSnapshot } from '../lib/contentRemote'
import { getContentLocale, shouldUseSupabaseContent } from '../lib/supabaseClient'
import defaultContent from '../data/siteContent'
import { deepMergeContent, isPlainObject } from '../lib/contentMappers.js'
import { loadPublishedPageForPath, resolveRouteContext } from '../lib/contentRuntime.js'

// ─── Stale snapshot guard ─────────────────────────────────────────────────────
// Removes top-level content sections from a remote snapshot where the section
// has far fewer fields than the current local defaults — a sign that the snapshot
// was published from an older version of the page and its overrides are outdated.
// Threshold: remote section must have at least 50% as many fields as local default
// (only checked when the local section has 8+ fields, to avoid small utility sections).
const stripStaleSections = (remoteContent) => {
  if (!isPlainObject(remoteContent)) return remoteContent
  const cleaned = { ...remoteContent }
  Object.keys(cleaned).forEach((key) => {
    const remoteSection = cleaned[key]
    const localSection = defaultContent[key]
    if (isPlainObject(remoteSection) && isPlainObject(localSection)) {
      const remoteKeys = Object.keys(remoteSection).length
      const localKeys = Object.keys(localSection).length
      if (localKeys >= 8 && remoteKeys < localKeys * 0.5) {
        delete cleaned[key]
      }
    }
  })
  return cleaned
}
// ─────────────────────────────────────────────────────────────────────────────

// ─── localStorage cache helpers ──────────────────────────────────────────────
// Persist the last known remote content so the first render already has the
// correct data and avoids the visible image-swap flash on every page load.

const SITE_CACHE_KEY = 'gw-remote-content-v2'
const PAGE_CACHE_PREFIX = 'gw-page-content-v2:'

const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

const readCacheEntry = (key) => {
  try {
    const raw = JSON.parse(localStorage.getItem(key))
    if (!raw || !raw._ts) return null
    if (Date.now() - raw._ts > CACHE_TTL_MS) {
      localStorage.removeItem(key)
      return null
    }
    return raw.data
  } catch { return null }
}
const writeCacheEntry = (key, data) => {
  try { localStorage.setItem(key, JSON.stringify({ _ts: Date.now(), data })) } catch {}
}

const readSiteCache = () => readCacheEntry(SITE_CACHE_KEY)
const writeSiteCache = (content) => writeCacheEntry(SITE_CACHE_KEY, content)
const readPageCache = (pathname) => readCacheEntry(PAGE_CACHE_PREFIX + pathname)
const writePageCache = (pathname, content) => writeCacheEntry(PAGE_CACHE_PREFIX + pathname, content)

const currentPathname = () => (typeof window !== 'undefined' ? window.location.pathname : '/')

// ─────────────────────────────────────────────────────────────────────────────

export default function useContent(section) {
  const pathname = currentPathname()

  const [overrides, setOverrides] = useState(() => {
    sanitizeContentOverrides()
    return readContentOverrides()
  })

  // Initialise with cached remote content → zero flash on subsequent visits
  const [remoteSiteContent, setRemoteSiteContent] = useState(() => {
    const cached = readSiteCache()
    return cached ? stripStaleSections(cached) : null
  })

  const [remotePageState, setRemotePageState] = useState(() => {
    const cached = readPageCache(pathname)
    return cached ? { pathname, content: cached } : { pathname: null, content: null }
  })

  const routeContext = useMemo(() => resolveRouteContext(pathname), [pathname])

  // Keep overrides in sync with localStorage changes
  useEffect(() => {
    const handler = () => setOverrides(readContentOverrides())
    window.addEventListener(CONTENT_OVERRIDE_EVENT, handler)
    return () => window.removeEventListener(CONTENT_OVERRIDE_EVENT, handler)
  }, [])

  // Fetch & cache global site content snapshot
  useEffect(() => {
    if (!shouldUseSupabaseContent()) return

    let cancelled = false
    const locale = getContentLocale()

    const doFetch = () => {
      cancelled = false
      fetchPublishedContentSnapshot(locale)
        .then((snapshot) => {
          if (cancelled) return
          const raw = snapshot?.content || null
          const content = raw ? stripStaleSections(raw) : null
          setRemoteSiteContent(content)
          if (content) writeSiteCache(content)
        })
        .catch(() => { if (!cancelled) setRemoteSiteContent(null) })
    }

    doFetch()

    const handleContentPublished = () => { cancelled = false; doFetch() }
    window.addEventListener('gw-content-published', handleContentPublished)

    return () => {
      cancelled = true
      window.removeEventListener('gw-content-published', handleContentPublished)
    }
  }, [])

  // Fetch & cache per-page content
  useEffect(() => {
    if (!section) return
    if (!shouldUseSupabaseContent() || routeContext.isAdmin || routeContext.isNewsDetail || !routeContext.sectionRoute) return

    let cancelled = false
    const locale = getContentLocale()

    loadPublishedPageForPath(pathname, locale)
      .then((page) => {
        if (cancelled) return
        const content = page?.content || null
        setRemotePageState({ pathname, content })
        if (content) writePageCache(pathname, content)
      })
      .catch(() => { if (!cancelled) setRemotePageState({ pathname, content: null }) })

    return () => { cancelled = true }
  }, [pathname, routeContext.isAdmin, routeContext.isNewsDetail, routeContext.sectionRoute, section])

  const pageContent = section
    ? remotePageState.pathname === pathname
      ? remotePageState.content
      : null
    : null

  const merged = deepMergeContent(
    deepMergeContent(deepMergeContent(defaultContent, remoteSiteContent || {}), pageContent || {}),
    overrides
  )
  if (section) return merged[section] ?? defaultContent[section] ?? {}
  return merged
}
