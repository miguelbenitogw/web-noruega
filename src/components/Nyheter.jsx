import { useEffect, useMemo, useState } from 'react'
import { IMAGES, img } from '../assets/images'
import AnimateIn from './AnimateIn'
import EditableText, { readOverrideValue } from './editable/EditableText'
import { trackEvent } from '../lib/analytics'
import { useNewsCollection } from '../hooks/useNews'
import { CONTENT_OVERRIDE_EVENT, getByPath, readContentOverrides } from '../lib/contentOverrides'
import { upsertNews } from '../lib/contentServices'
import { registerVisualEditPersistor } from '../lib/visualEditSession'
import useContent from '../hooks/useContent'

const tagColors = {
  Plattform: 'bg-primary-50 text-primary-700',
  Lovgivning: 'bg-amber-50 text-amber-700',
  Suksesshistorie: 'bg-green-50 text-green-700',
  Veiledning: 'bg-purple-50 text-purple-700',
}

const getTagStyles = (tag) => tagColors[tag] || 'bg-gray-100 text-gray-700'

const cloneNewsValue = (value) => {
  if (Array.isArray(value)) return value.map(cloneNewsValue)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, nestedValue]) => [key, cloneNewsValue(nestedValue)]))
  }
  return value
}

const parseNewsDate = (value) => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date
}

const isAdminNewsEditingContext = () => {
  if (typeof window === 'undefined') return false
  return window.location.pathname.startsWith('/admin')
}

const isFeaturedArticle = (article) => Boolean(
  article?.featured
  || article?.content?.featured
  || article?.metadata?.featured
  || article?.metadata?.content?.featured,
)

const getNewsSortTime = (article) => {
  const candidates = [article?.publishAt, article?.publishedAt, article?.date, article?.updatedAt, article?.createdAt]
  for (const candidate of candidates) {
    const date = parseNewsDate(candidate)
    if (date) return date.getTime()
  }
  return 0
}

const sortNewsForDisplay = (articles) => articles.slice().sort((left, right) => {
  if (isFeaturedArticle(left) !== isFeaturedArticle(right)) {
    return Number(isFeaturedArticle(right)) - Number(isFeaturedArticle(left))
  }

  return getNewsSortTime(right) - getNewsSortTime(left)
})

const useOverrideRefresh = () => {
  const [, setRefreshTick] = useState(0)

  useEffect(() => {
    const sync = () => setRefreshTick((value) => value + 1)
    window.addEventListener(CONTENT_OVERRIDE_EVENT, sync)
    return () => window.removeEventListener(CONTENT_OVERRIDE_EVENT, sync)
  }, [])
}

const resolveNewsField = (article, field) => readOverrideValue(`news.${article.slug}.${field}`, article[field])

const hasNewsOverrideForSlug = (overrides, slug) => Boolean(getByPath(overrides, `news.${slug}`))

const buildNewsPayload = (article, mode = 'draft') => {
  const title = resolveNewsField(article, 'title')
  const excerpt = resolveNewsField(article, 'excerpt')
  const body = resolveNewsField(article, 'body')
  const tag = resolveNewsField(article, 'tag')
  const readTime = resolveNewsField(article, 'readTime')
  const metadata = cloneNewsValue(article.metadata || {})
  const content = cloneNewsValue(article.content || article.metadata?.content || {})
  const featured = isFeaturedArticle(article)

  return {
    id: article.id || undefined,
    locale: article.locale || undefined,
    slug: article.slug,
    title,
    excerpt,
    body,
    tag,
    readTime,
    author: article.author || 'Global Working',
    coverImage: article.coverImage || '',
    status: mode === 'publish' ? 'published' : 'draft',
    publishAt: article.publishAt || article.date || null,
    seoTitle: article.seoTitle || '',
    seoDescription: article.seoDescription || '',
    templateId: article.templateId || undefined,
    templateKey: article.templateKey || article.template?.key || undefined,
    metadata,
    content,
    featured,
  }
}

export default function Nyheter() {
  const { articles: news, loading } = useNewsCollection()
  const nyheter = useContent('nyheterSection')
  useOverrideRefresh()

  const orderedNews = useMemo(() => sortNewsForDisplay(news), [news])

  useEffect(() => {
    if (!isAdminNewsEditingContext()) return undefined

    const persistNews = async (mode) => {
      const overrides = readContentOverrides()
      const changedArticles = orderedNews.filter((article) => hasNewsOverrideForSlug(overrides, article.slug))

      if (!changedArticles.length) {
        return []
      }

      const results = []
      for (const article of changedArticles) {
        const result = await upsertNews(buildNewsPayload(article, mode))
        results.push(result)
      }

      return results
    }

    return registerVisualEditPersistor('visual-edit-news-collection', {
      hasChanges: () => {
        const overrides = readContentOverrides()
        return orderedNews.some((article) => hasNewsOverrideForSlug(overrides, article.slug))
      },
      saveDraft: () => persistNews('draft'),
      publish: () => persistNews('publish'),
    })
  }, [orderedNews])

  if (!orderedNews.length && loading) {
    return (
      <section id="nyheter" className="scroll-mt-28 py-24 lg:py-32 bg-white" aria-labelledby="nyheter-heading">
        <div className="container-xl">
          <p className="text-gray-500">{nyheter.loadingLabel}</p>
        </div>
      </section>
    )
  }

  if (!orderedNews.length) return null

  const featured = orderedNews[0]
  const featuredTitle = resolveNewsField(featured, 'title')
  const featuredExcerpt = resolveNewsField(featured, 'excerpt')
  const featuredTag = resolveNewsField(featured, 'tag')
  const featuredReadTime = resolveNewsField(featured, 'readTime')

  return (
    <section id="nyheter" className="scroll-mt-28 py-24 lg:py-32 bg-white" aria-labelledby="nyheter-heading">
      <div className="container-xl">
        <AnimateIn>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
            <div className="max-w-xl">
              <span className="inline-block text-primary-600 font-semibold text-sm tracking-wide uppercase mb-3">
                {nyheter.label}
              </span>
              <h2 id="nyheter-heading" className="font-heading text-3xl lg:text-4xl font-bold text-ink leading-tight">
                {nyheter.heading}
              </h2>
            </div>
            <a
              href="/nyheter#nyheter-arkiv"
              onClick={() => trackEvent('cta_click', { location: 'nyheter', cta: 'se_alle_nyheter' })}
              className="shrink-0 inline-flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700 transition-colors"
            >
              {nyheter.ctaLabel}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </AnimateIn>

        <div className="grid lg:grid-cols-5 gap-6">
          <article className="lg:col-span-3 bg-surface rounded-3xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
            <div className="relative h-60 overflow-hidden">
              <img
                src={img(featured.coverImage || IMAGES.platformHero, 900)}
                alt={featuredTitle}
                className="w-full h-full object-cover"
                loading="lazy"
                width="640"
                height="240"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" aria-hidden="true" />
              <EditableText
                as="span"
                path={`news.${featured.slug}.tag`}
                value={featuredTag}
                className={`absolute bottom-4 left-5 px-3 py-1.5 rounded-full text-xs font-semibold ${getTagStyles(featuredTag)}`}
              />
            </div>
            <div className="p-7 flex flex-col flex-1">
              <div className="flex items-center gap-3 text-gray-400 text-sm mb-4">
                <time>{featured.dateLabel}</time>
                <span aria-hidden="true">·</span>
                <span>
                  <EditableText as="span" path={`news.${featured.slug}.readTime`} value={featuredReadTime} className="inline" />
                  {' '}{nyheter.readTimeSuffix}
                </span>
              </div>
              <EditableText
                as="h3"
                path={`news.${featured.slug}.title`}
                value={featuredTitle}
                className="font-heading text-xl font-bold text-ink mb-3"
              />
              <EditableText
                as="p"
                path={`news.${featured.slug}.excerpt`}
                value={featuredExcerpt}
                multiline
                className="text-gray-500 leading-relaxed flex-1"
              />
              <a
                href={`/nyheter/${featured.slug}`}
                onClick={() => trackEvent('cta_click', { location: 'nyheter', cta: 'les_mer_featured' })}
                className="mt-6 inline-flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700 transition-colors text-sm"
              >
                {nyheter.readMoreLabel}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </article>

          <div className="lg:col-span-2 flex flex-col gap-4">
            {orderedNews.slice(1, 4).map((article) => {
              const title = resolveNewsField(article, 'title')
              const excerpt = resolveNewsField(article, 'excerpt')
              const tag = resolveNewsField(article, 'tag')

              return (
                <article
                  key={article.slug}
                  className="bg-surface rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:border-primary-100 transition-all duration-200 flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between">
                    <EditableText
                      as="span"
                      path={`news.${article.slug}.tag`}
                      value={tag}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getTagStyles(tag)}`}
                    />
                    <time className="text-gray-400 text-xs">{article.dateLabel}</time>
                  </div>
                  <EditableText
                    as="h3"
                    path={`news.${article.slug}.title`}
                    value={title}
                    className="font-heading text-base font-semibold text-ink leading-snug"
                  />
                  <EditableText
                    as="p"
                    path={`news.${article.slug}.excerpt`}
                    value={excerpt}
                    multiline
                    className="text-gray-500 text-sm leading-relaxed line-clamp-2"
                  />
                  <a
                    href={`/nyheter/${article.slug}`}
                    onClick={() => trackEvent('cta_click', { location: 'nyheter', cta: `les_mer_${article.slug}` })}
                    className="text-primary-600 font-semibold text-sm hover:text-primary-700 transition-colors"
                  >
                    {nyheter.readMoreLabel} →
                  </a>
                </article>
              )
            })}
          </div>
        </div>

        <div id="nyheter-arkiv" className="scroll-mt-28 mt-16 space-y-6">
          {orderedNews.map((article) => {
            const title = resolveNewsField(article, 'title')
            const excerpt = resolveNewsField(article, 'excerpt')
            const tag = resolveNewsField(article, 'tag')
            const readTime = resolveNewsField(article, 'readTime')

            return (
              <article id={`nyhet-${article.slug}`} key={article.slug} className="scroll-mt-28 border border-gray-100 rounded-2xl p-6 bg-white">
                <div className="flex items-center gap-3 mb-2 text-sm text-gray-500">
                  <EditableText
                    as="span"
                    path={`news.${article.slug}.tag`}
                    value={tag}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getTagStyles(tag)}`}
                  />
                  <time>{article.dateLabel}</time>
                  <span aria-hidden="true">·</span>
                  <span>
                    <EditableText as="span" path={`news.${article.slug}.readTime`} value={readTime} className="inline" />
                    {' '}{nyheter.readTimeSuffix}
                  </span>
                </div>
                <EditableText
                  as="h3"
                  path={`news.${article.slug}.title`}
                  value={title}
                  className="font-heading text-xl font-bold text-ink mb-2"
                />
                <EditableText
                  as="p"
                  path={`news.${article.slug}.excerpt`}
                  value={excerpt}
                  multiline
                  className="text-gray-600 leading-relaxed"
                />
                <a
                  href={`/nyheter/${article.slug}`}
                  onClick={() => trackEvent('news_read_more_click', { slug: article.slug })}
                  className="inline-flex mt-4 text-primary-600 text-sm font-semibold hover:text-primary-700"
                >
                  {nyheter.readArticleLabel}
                </a>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
