/**
 * Noticias — Markdown local, sin red.
 *
 * Antes esto tenía dos caminos: los .md del repo como respaldo y una consulta
 * a Supabase que, si devolvía algo, REEMPLAZABA por completo a los locales.
 * En la práctica el visitante veía siempre los de Supabase y los .md del repo
 * no los leía nadie.
 *
 * Al desconectar Supabase se exportaron los 10 artículos publicados a
 * `src/content/news/*.md`, así que ahora los locales son los de verdad.
 * Para publicar: un .md nuevo con el frontmatter de `_template.md`.
 */

// Sin guard a propósito. `import.meta.glob` NO es una función en runtime:
// Vite sustituye la llamada en tiempo de compilación. El guard que había aquí
// (`typeof import.meta.glob === 'function'`) se evaluaba en el navegador, daba
// falso y descartaba el resultado ya expandido, así que los .md locales nunca
// se leían. No se notaba porque las noticias venían de Supabase.
const markdownModules = import.meta.glob('../content/news/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const stripQuotes = (value) => value.replace(/^["']|["']$/g, '').trim()

const parseFrontmatter = (input) => {
  // Ver el comentario gemelo en scripts/prerender-meta.mjs: BOM y CRLF son las
  // dos formas de perder el frontmatter sin que nadie se entere.
  const raw = input.replace(/^\uFEFF/, '')
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) {
    return { meta: {}, body: raw.trim() }
  }

  const [, frontmatter, body] = match
  const meta = {}

  for (const line of frontmatter.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const splitIndex = trimmed.indexOf(':')
    if (splitIndex < 1) continue

    const key = trimmed.slice(0, splitIndex).trim()
    const value = trimmed.slice(splitIndex + 1).trim()
    meta[key] = stripQuotes(value)
  }

  return { meta, body: body.trim() }
}

const formatNorwegianDate = (value) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value || '')

  return new Intl.DateTimeFormat('no-NO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

const normalizeLocalNews = (filePath, rawContent) => {
  const { meta, body } = parseFrontmatter(rawContent)
  const slugFromPath = filePath.split('/').pop().replace(/\.md$/, '')

  const slug = meta.slug || slugFromPath
  const title = meta.title || slug.replace(/-/g, ' ')
  const date = meta.date || '1970-01-01'
  const isPublished = (meta.status || 'published') === 'published'

  return {
    slug,
    title,
    excerpt: meta.excerpt || '',
    date,
    dateLabel: formatNorwegianDate(date),
    tag: meta.tag || 'Nyhet',
    readTime: meta.readTime || '3 min',
    coverImage: meta.coverImage || '',
    // `featured` venía del campo metadata de Supabase y ordenaba la lista.
    // Se conserva como bandera del frontmatter para no perder ese orden.
    featured: meta.featured === 'true',
    status: meta.status || 'published',
    publishAt: meta.publishAt || '',
    author: meta.author || 'Global Working',
    seoTitle: meta.seoTitle || title,
    seoDescription: meta.seoDescription || meta.excerpt || '',
    body,
    published: isPublished,
    source: 'local',
  }
}

// Destacados primero, luego por fecha descendente — el mismo orden que
// aplicaba el backend.
const sortNews = (articles) => articles.slice().sort((a, b) => {
  if (a.featured !== b.featured) return a.featured ? -1 : 1
  const left = new Date(a.publishAt || a.date || 0).getTime()
  const right = new Date(b.publishAt || b.date || 0).getTime()
  return right - left
})

const localNews = Object.entries(markdownModules)
  .map(([filePath, rawContent]) => normalizeLocalNews(filePath, rawContent))
  .filter((article) => article.published)

const localNewsSorted = sortNews(localNews)

export const getAllNews = () => localNewsSorted
export const getNewsBySlug = (slug) => localNewsSorted.find((article) => article.slug === slug) || null
export const getFeaturedNews = () => localNewsSorted[0] || null
export const getSecondaryNews = (limit = 3) => localNewsSorted.slice(1, 1 + limit)

export async function loadPublishedNews() {
  return { source: 'local', articles: localNewsSorted }
}

export async function loadPublishedNewsBySlug(slug) {
  return getNewsBySlug(slug)
}

export const __newsTestables = {
  parseFrontmatter,
  normalizeLocalNews,
  sortNews,
}
