import { getContentLocale, isSupabaseConfigured } from './supabaseClient'
import { listPublishedNews } from './contentServices'

const markdownModules = import.meta.glob('../content/news/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const stripQuotes = (value) => value.replace(/^["']|["']$/g, '').trim()

const parseFrontmatter = (raw) => {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
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

const normalizeRemoteNews = (row) => {
  if (!row) return null

  const publishedValue = row.publishedAt || row.publishAt || row.updatedAt || row.createdAt || ''
  const dateValue = publishedValue ? String(publishedValue).slice(0, 10) : ''

  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt || '',
    date: dateValue,
    dateLabel: formatNorwegianDate(publishedValue || dateValue || row.updatedAt || row.createdAt || row.slug),
    tag: row.tag || 'Nyhet',
    readTime: row.readTime || '3 min',
    coverImage: row.coverImage || '',
    status: row.status || 'published',
    publishAt: row.publishAt || '',
    author: row.author || 'Global Working',
    seoTitle: row.seoTitle || row.title,
    seoDescription: row.seoDescription || row.excerpt || '',
    body: row.body || '',
    published: true,
    source: 'remote',
    id: row.id || null,
    metadata: row.metadata || {},
    createdAt: row.createdAt || null,
    updatedAt: row.updatedAt || null,
  }
}

const sortNews = (articles) => articles.slice().sort((a, b) => {
  const left = new Date(a.publishAt || a.date || a.updatedAt || a.createdAt || 0).getTime()
  const right = new Date(b.publishAt || b.date || b.updatedAt || b.createdAt || 0).getTime()
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

const newsCache = new Map()

export async function loadPublishedNews(locale) {
  if (!isSupabaseConfigured) {
    return { source: 'local', articles: localNewsSorted }
  }

  const resolvedLocale = getContentLocale(locale)
  if (newsCache.has(resolvedLocale)) {
    return newsCache.get(resolvedLocale)
  }

  const promise = (async () => {
    try {
      const rows = await listPublishedNews(resolvedLocale)
      const articles = sortNews(rows.map(normalizeRemoteNews).filter(Boolean))
      return articles.length > 0
        ? { source: 'remote', articles }
        : { source: 'local', articles: localNewsSorted }
    } catch {
      return { source: 'local', articles: localNewsSorted }
    }
  })()

  newsCache.set(resolvedLocale, promise)
  return promise
}

export async function loadPublishedNewsBySlug(slug, locale) {
  const collection = await loadPublishedNews(locale)
  return collection.articles.find((article) => article.slug === slug) || null
}
