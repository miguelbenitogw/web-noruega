import { useEffect, useMemo, useState } from 'react'
import { getContentLocale, shouldUseSupabaseContent } from '../lib/supabaseClient'
import { getAllNews, loadPublishedNews } from '../lib/news'

export function useNewsCollection() {
  const locale = getContentLocale()
  const [articles, setArticles] = useState(() => getAllNews())
  const [loading, setLoading] = useState(() => shouldUseSupabaseContent())
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    if (!shouldUseSupabaseContent()) {
      return undefined
    }

    loadPublishedNews(locale)
      .then(({ articles: remoteArticles }) => {
        if (cancelled) return
        setArticles(remoteArticles && remoteArticles.length > 0 ? remoteArticles : getAllNews())
        setError(null)
      })
      .catch((err) => {
        if (cancelled) return
        setArticles(getAllNews())
        setError(err instanceof Error ? err : new Error('Kunne ikke laste nyheter.'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [locale])

  return { articles, loading, error }
}

export function useNewsArticle(slug) {
  const { articles, loading, error } = useNewsCollection()

  const article = useMemo(
    () => articles.find((item) => item.slug === slug) || null,
    [articles, slug],
  )

  return { article, articles, loading, error }
}
