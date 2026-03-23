import { useState, useEffect } from 'react'
import { readContentOverrides, CONTENT_OVERRIDE_EVENT } from '../lib/contentOverrides'
import { fetchPublishedContentSnapshot, isSupabaseConfigured } from '../lib/contentRemote'
import { getContentLocale } from '../lib/supabaseClient'
import defaultContent from '../data/siteContent'

function mergeDeep(target, source) {
  if (!source || typeof source !== 'object') return target
  if (Array.isArray(target)) {
    if (!Array.isArray(source) || source.length === 0) return target
    return source.map((item, i) => {
      const def = target[i]
      if (def && typeof def === 'object' && !Array.isArray(def) && typeof item === 'object' && item !== null && !Array.isArray(item)) {
        return mergeDeep(def, item)
      }
      return item !== undefined ? item : def
    })
  }
  const result = { ...target }
  for (const key of Object.keys(source)) {
    const srcVal = source[key]
    const tgtVal = target[key]
    if (srcVal === null || srcVal === undefined) continue
    if (typeof srcVal === 'object' && !Array.isArray(srcVal) && typeof tgtVal === 'object' && tgtVal !== null && !Array.isArray(tgtVal)) {
      result[key] = mergeDeep(tgtVal, srcVal)
    } else {
      result[key] = srcVal
    }
  }
  return result
}

export default function useContent(section) {
  const [overrides, setOverrides] = useState(() => readContentOverrides())
  const [remoteContent, setRemoteContent] = useState(null)

  useEffect(() => {
    const handler = () => setOverrides(readContentOverrides())
    window.addEventListener(CONTENT_OVERRIDE_EVENT, handler)
    return () => window.removeEventListener(CONTENT_OVERRIDE_EVENT, handler)
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return
    }

    let cancelled = false
    const locale = getContentLocale()

    fetchPublishedContentSnapshot(locale)
      .then((snapshot) => {
        if (!cancelled) setRemoteContent(snapshot?.content || null)
      })
      .catch(() => {
        if (!cancelled) setRemoteContent(null)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const merged = mergeDeep(mergeDeep(defaultContent, remoteContent || {}), overrides)
  if (section) return merged[section] ?? defaultContent[section] ?? {}
  return merged
}
