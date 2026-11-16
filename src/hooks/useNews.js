import { useMemo } from 'react'
import { getAllNews } from '../lib/news'

/**
 * Noticias — lectura directa de los .md locales.
 *
 * Ya no hay fetch ni estado de carga: los artículos entran en el bundle con
 * `import.meta.glob`, así que están disponibles en el primer render. Se
 * mantienen `loading` y `error` en el valor devuelto para no tocar las
 * vistas que los consumen.
 */
export function useNewsCollection() {
  const articles = getAllNews()
  return { articles, loading: false, error: null }
}

export function useNewsArticle(slug) {
  const { articles, loading, error } = useNewsCollection()

  const article = useMemo(
    () => articles.find((item) => item.slug === slug) || null,
    [articles, slug],
  )

  return { article, articles, loading, error }
}
