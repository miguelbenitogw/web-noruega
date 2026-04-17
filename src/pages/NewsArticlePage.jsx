import { useEffect, useMemo, useState } from 'react'
import MarkdownArticle, { getMarkdownSections } from '../components/MarkdownArticle'
import { IMAGES, img } from '../assets/images'
import { trackEvent } from '../lib/analytics'
import { setArticleSEO } from '../lib/seo'
import { useNewsArticle } from '../hooks/useNews'
import EditableRichText from '../components/editable/EditableRichText'
import EditableText, { readOverrideValue } from '../components/editable/EditableText'
import { CONTENT_OVERRIDE_EVENT, getByPath, readContentOverrides } from '../lib/contentOverrides'
import { registerVisualEditPersistor } from '../lib/visualEditSession'
import { upsertNews } from '../lib/contentServices'
import useContent from '../hooks/useContent'

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

const getCoverImage = (article) => {
  if (article.coverImageAssetUrl) return article.coverImageAssetUrl
  if (article.coverImageAsset?.publicUrl) return article.coverImageAsset.publicUrl
  if (article.coverImage && article.coverImage.startsWith('http')) return article.coverImage
  if (article.coverImage && article.coverImage.startsWith('/')) return article.coverImage
  return IMAGES.platformHero
}

const useOverrideRefresh = () => {
  const [refreshTick, setRefreshTick] = useState(0)

  useEffect(() => {
    const sync = () => setRefreshTick((value) => value + 1)
    window.addEventListener(CONTENT_OVERRIDE_EVENT, sync)
    return () => window.removeEventListener(CONTENT_OVERRIDE_EVENT, sync)
  }, [])

  return refreshTick
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
  const coverImageAssetId = article.coverImageAssetId || article.content?.coverImageAssetId || article.metadata?.content?.coverImageAssetId || ''
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
    coverImageAssetId: coverImageAssetId || undefined,
    status: mode === 'publish' ? 'published' : 'draft',
    publishAt: article.publishAt || article.date || null,
    seoTitle: article.seoTitle || '',
    seoDescription: article.seoDescription || '',
    templateId: article.templateId || undefined,
    templateKey: article.templateKey || article.template?.key || undefined,
    metadata,
    content: {
      ...content,
      ...(coverImageAssetId ? { coverImageAssetId } : {}),
    },
    featured,
  }
}

export default function NewsArticlePage({ slug }) {
  const { article, articles: allNews, loading } = useNewsArticle(slug)
  const nyheter = useContent('nyheterSection')
  const overrideTick = useOverrideRefresh()

  const effectiveArticle = useMemo(() => {
    if (!article) return null
    void overrideTick

    return {
      ...article,
      title: resolveNewsField(article, 'title'),
      excerpt: resolveNewsField(article, 'excerpt'),
      tag: resolveNewsField(article, 'tag'),
      readTime: resolveNewsField(article, 'readTime'),
      body: resolveNewsField(article, 'body'),
    }
  }, [article, overrideTick])

  const related = useMemo(
    () => sortNewsForDisplay(allNews.filter((item) => item.slug !== slug)).slice(0, 3),
    [allNews, slug],
  )
  const sections = effectiveArticle ? getMarkdownSections(effectiveArticle.body || '') : []

  useEffect(() => {
    if (!article) return
    trackEvent('news_open', { slug: article.slug, tag: article.tag })
  }, [article])

  useEffect(() => {
    if (!effectiveArticle) return
    setArticleSEO(effectiveArticle)
  }, [effectiveArticle])

  useEffect(() => {
    if (!article) return undefined
    if (!isAdminNewsEditingContext()) return undefined

    const persistArticle = async (mode) => upsertNews(buildNewsPayload(article, mode))

    return registerVisualEditPersistor(`visual-edit-news-article-${article.slug}`, {
      hasChanges: () => {
        const overrides = readContentOverrides()
        return hasNewsOverrideForSlug(overrides, article.slug)
      },
      saveDraft: () => persistArticle('draft'),
      publish: () => persistArticle('publish'),
    })
  }, [article])

  if (loading && !article) {
    return (
      <section className="py-24 bg-white">
        <div className="container-xl">
          <h1 className="font-heading text-3xl font-bold text-ink mb-4">{nyheter.loadingTitle}</h1>
          <p className="text-gray-600">{nyheter.loadingDescription}</p>
        </div>
      </section>
    )
  }

  if (!article) {
    return (
      <section className="py-24 bg-white">
        <div className="container-xl">
          <h1 className="font-heading text-3xl font-bold text-ink mb-4">{nyheter.notFoundTitle}</h1>
          <p className="text-gray-600 mb-6">{nyheter.notFoundDescription}</p>
          <a href="/" className="text-primary-600 font-semibold hover:text-primary-700">
            {nyheter.backToNewsLabel || 'Tilbake til forsiden'}
          </a>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="container-xl max-w-4xl">
        <a href="/nyheter#nyheter-arkiv" className="inline-flex items-center text-primary-600 text-sm font-semibold hover:text-primary-700 mb-8">
          ← {nyheter.backToNewsLabel}
        </a>

        <div className="mb-6 flex items-center gap-3 text-sm text-gray-500">
          <EditableText
            as="span"
            path={`news.${effectiveArticle.slug}.tag`}
            value={effectiveArticle.tag}
            className="px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 font-semibold"
          />
          <time>{effectiveArticle.dateLabel}</time>
          <span aria-hidden="true">·</span>
          <span>
            <EditableText as="span" path={`news.${effectiveArticle.slug}.readTime`} value={effectiveArticle.readTime} className="inline" />
            {' '}{nyheter.readTimeSuffix}
          </span>
        </div>

        <EditableText
          as="h1"
          path={`news.${effectiveArticle.slug}.title`}
          value={effectiveArticle.title}
          className="font-heading text-3xl lg:text-5xl font-bold text-ink leading-tight mb-4"
        />
        <EditableText
          as="p"
          path={`news.${effectiveArticle.slug}.excerpt`}
          value={effectiveArticle.excerpt}
          multiline
          className="text-lg text-gray-600 mb-8"
        />

        <div className="rounded-3xl overflow-hidden mb-10 border border-gray-100">
          <img
            src={img(getCoverImage(effectiveArticle), 1200)}
            alt={effectiveArticle.title}
            className="w-full object-cover max-h-[420px]"
            loading="lazy"
          />
        </div>

        {!!sections.length && (
          <nav
            aria-label="Innholdsoversikt"
            className="mb-10 rounded-2xl border border-gray-100 bg-surface px-5 py-4"
          >
            <p className="text-sm font-semibold text-ink mb-3">{nyheter.jumpToSectionLabel}</p>
            <div className="flex flex-wrap gap-2">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="inline-flex items-center rounded-full bg-white border border-gray-200 px-3 py-1.5 text-sm text-primary-700 hover:border-primary-300 hover:bg-primary-50 transition-colors"
                >
                  {section.title}
                </a>
              ))}
            </div>
          </nav>
        )}

        <EditableRichText
          path={`news.${effectiveArticle.slug}.body`}
          value={effectiveArticle.body}
          modalTitle="Rediger artikkelinnhold"
          renderPreview={(markdown) => <MarkdownArticle markdown={markdown} />}
        />

        {!!related.length && (
          <div className="mt-14 pt-10 border-t border-gray-100">
            <h2 className="font-heading text-2xl font-bold text-ink mb-5">{nyheter.relatedLabel}</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {related.map((item) => (
                <a
                  key={item.slug}
                  href={`/nyheter/${item.slug}`}
                  onClick={() => trackEvent('news_related_click', { from_slug: article.slug, to_slug: item.slug })}
                  className="block border border-gray-100 rounded-2xl p-4 hover:border-primary-200 hover:shadow-sm transition-all"
                >
                  <p className="text-xs text-gray-500 mb-1">{item.dateLabel}</p>
                  <h3 className="font-heading text-base font-semibold text-ink leading-snug mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-3">{item.excerpt}</p>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
