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

const formatNorwegianDate = (isoDate) => {
  const date = new Date(`${isoDate}T00:00:00`)
  if (Number.isNaN(date.getTime())) return isoDate
  return new Intl.DateTimeFormat('no-NO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

const normalizeNews = (filePath, rawContent) => {
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
  }
}

const allNews = Object.entries(markdownModules)
  .map(([filePath, rawContent]) => normalizeNews(filePath, rawContent))
  .filter(article => article.published)
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

export const getAllNews = () => allNews
export const getNewsBySlug = (slug) => allNews.find(article => article.slug === slug) || null
export const getFeaturedNews = () => allNews[0] || null
export const getSecondaryNews = (limit = 3) => allNews.slice(1, 1 + limit)

