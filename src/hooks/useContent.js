import { useEffect, useMemo, useState } from 'react'
import { readContentOverrides, CONTENT_OVERRIDE_EVENT } from '../lib/contentOverrides'
import { fetchPublishedContentSnapshot } from '../lib/contentRemote'
import { getContentLocale, shouldUseSupabaseContent } from '../lib/supabaseClient'
import defaultContent from '../data/siteContent'
import { deepMergeContent } from '../lib/contentMappers.js'
import { loadPublishedPageForPath, resolveRouteContext } from '../lib/contentRuntime.js'

export default function useContent(section) {
  const [overrides, setOverrides] = useState(() => readContentOverrides())
  const [remoteSiteContent, setRemoteSiteContent] = useState(null)
  const [remotePageState, setRemotePageState] = useState({ pathname: null, content: null })
  const currentPathname = typeof window !== 'undefined' ? window.location.pathname : '/'
  const routeContext = useMemo(() => resolveRouteContext(currentPathname), [currentPathname])

  useEffect(() => {
    const handler = () => setOverrides(readContentOverrides())
    window.addEventListener(CONTENT_OVERRIDE_EVENT, handler)
    return () => window.removeEventListener(CONTENT_OVERRIDE_EVENT, handler)
  }, [])

  useEffect(() => {
    if (section) {
      return
    }

    if (!shouldUseSupabaseContent()) {
      return
    }

    let cancelled = false
    const locale = getContentLocale()

    fetchPublishedContentSnapshot(locale)
      .then((snapshot) => {
        if (!cancelled) setRemoteSiteContent(snapshot?.content || null)
      })
      .catch(() => {
        if (!cancelled) setRemoteSiteContent(null)
      })

    return () => {
      cancelled = true
    }
  }, [section])

  useEffect(() => {
    if (!section) {
      return
    }

    if (!shouldUseSupabaseContent() || routeContext.isAdmin || routeContext.isNewsDetail || !routeContext.sectionRoute) {
      return
    }

    let cancelled = false
    const locale = getContentLocale()

    loadPublishedPageForPath(currentPathname, locale)
      .then((page) => {
        if (!cancelled) setRemotePageState({ pathname: currentPathname, content: page?.content || null })
      })
      .catch(() => {
        if (!cancelled) setRemotePageState({ pathname: currentPathname, content: null })
      })

    return () => {
      cancelled = true
    }
  }, [currentPathname, routeContext.isAdmin, routeContext.isNewsDetail, routeContext.sectionRoute, section])

  const resolvedRemoteContent = section
    ? remotePageState.pathname === currentPathname
      ? remotePageState.content
      : null
    : remoteSiteContent

  const merged = deepMergeContent(deepMergeContent(defaultContent, resolvedRemoteContent || {}), overrides)
  if (section) return merged[section] ?? defaultContent[section] ?? {}
  return merged
}
