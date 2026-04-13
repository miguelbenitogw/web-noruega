import { getContentLocale, isSupabaseConfigured } from './supabaseClient.js'
import { getAssetById } from './contentAssetsService.js'
import { listPublishedNews } from './contentServices.js'

const DEFAULT_CACHE_TTL_MS = 55 * 60 * 1000

const markdownModules = typeof import.meta.glob === 'function'
  ? import.meta.glob('../content/news/*.md', {
      query: '?raw',
      import: 'default',
      eager: true,
    })
  : {}

const stripQuotes = (value) => value.replace(/^["']|["']$/g, '').trim()

const getContentAssetId = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return ''
  const assetId = value.coverImageAssetId
  return typeof assetId === 'string' ? assetId.trim() : ''
}

const extractCoverImageAssetId = (article) => {
  if (!article || typeof article !== 'object' || Array.isArray(article)) return ''

  const topLevel = typeof article.coverImageAssetId === 'string' ? article.coverImageAssetId.trim() : ''
  if (topLevel) return topLevel

  const contentLevel = getContentAssetId(article.content)
  if (contentLevel) return contentLevel

  const metadataRootLevel = getContentAssetId(article.metadata)
  if (metadataRootLevel) return metadataRootLevel

  const metadataLevel = getContentAssetId(article.metadata?.content)
  if (metadataLevel) return metadataLevel

  return ''
}

const applyCoverImageAsset = (article, asset) => {
  if (!article) return null

  const assetId = extractCoverImageAssetId(article)
  const resolvedUrl = asset?.publicUrl || article.coverImageAssetUrl || article.coverImage || ''

  return {
    ...article,
    coverImageAssetId: assetId || article.coverImageAssetId || '',
    coverImageAsset: asset || article.coverImageAsset || null,
    coverImageAssetUrl: resolvedUrl,
    coverImage: resolvedUrl || article.coverImage || '',
  }
}

const createTimedPromiseCache = (ttlMs = DEFAULT_CACHE_TTL_MS, now = () => Date.now()) => {
  const cache = new Map()

  const get = (key, loader) => {
    const entry = cache.get(key)
    if (entry && entry.expiresAt > now()) {
      return entry.promise
    }

    if (entry) {
      cache.delete(key)
    }

    const promise = Promise.resolve().then(loader)
    cache.set(key, {
      promise,
      expiresAt: now() + ttlMs,
    })
    return promise
  }

  const clear = () => {
    cache.clear()
  }

  return { get, clear }
}

const assetResolutionCache = createTimedPromiseCache()

const loadAssetForCoverImage = async (assetId) => {
  if (!assetId) return null

  return assetResolutionCache.get(assetId, () => getAssetById(assetId).catch(() => null))
}

const resolveCoverImageAsset = async (article) => {
  const assetId = extractCoverImageAssetId(article)
  if (!assetId) return applyCoverImageAsset(article, null)

  const asset = await loadAssetForCoverImage(assetId)
  return applyCoverImageAsset(article, asset)
}

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
  const coverImageAssetId = extractCoverImageAssetId(meta)

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
    coverImageAssetId,
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
  const coverImageAssetId = extractCoverImageAssetId(row)

  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt || '',
    date: dateValue,
    dateLabel: formatNorwegianDate(publishedValue || dateValue || row.updatedAt || row.createdAt || row.slug),
    tag: row.tag || 'Nyhet',
    readTime: row.readTime || '3 min',
    coverImage: row.coverImage || '',
    coverImageAssetId,
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

const newsCache = createTimedPromiseCache()

export async function loadPublishedNews(locale) {
  if (!isSupabaseConfigured) {
    return { source: 'local', articles: localNewsSorted }
  }

  const resolvedLocale = getContentLocale(locale)
  return newsCache.get(resolvedLocale, async () => {
    try {
      const rows = await listPublishedNews(resolvedLocale)
      const resolvedArticles = await Promise.all(rows.map(async (row) => {
        const article = normalizeRemoteNews(row)
        return article ? resolveCoverImageAsset(article) : null
      }))
      const articles = sortNews(resolvedArticles.filter(Boolean))
      return articles.length > 0
        ? { source: 'remote', articles }
        : { source: 'local', articles: localNewsSorted }
    } catch {
      return { source: 'local', articles: localNewsSorted }
    }
  })
}

export async function loadPublishedNewsBySlug(slug, locale) {
  const collection = await loadPublishedNews(locale)
  return collection.articles.find((article) => article.slug === slug) || null
}

export const __newsTestables = {
  applyCoverImageAsset,
  extractCoverImageAssetId,
  createTimedPromiseCache,
}
