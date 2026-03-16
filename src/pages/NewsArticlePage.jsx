import { useEffect } from 'react'
import { getAllNews, getNewsBySlug } from '../lib/news'
import MarkdownArticle from '../components/MarkdownArticle'
import { IMAGES, img } from '../assets/images'
import { trackEvent } from '../lib/analytics'
import { setArticleSEO } from '../lib/seo'

const getCoverImage = (article) => {
  if (article.coverImage && article.coverImage.startsWith('http')) return article.coverImage
  if (article.coverImage && article.coverImage.startsWith('/')) return article.coverImage
  return IMAGES.platformHero
}

export default function NewsArticlePage({ slug }) {
  const article = getNewsBySlug(slug)
  const allNews = getAllNews()
  const related = allNews.filter(item => item.slug !== slug).slice(0, 3)

  useEffect(() => {
    if (!article) return

    setArticleSEO(article)
    trackEvent('news_open', { slug: article.slug, tag: article.tag })
  }, [article])

  if (!article) {
    return (
      <section className="py-24 bg-white">
        <div className="container-xl">
          <h1 className="font-heading text-3xl font-bold text-ink mb-4">Nyhet ikke funnet</h1>
          <p className="text-gray-600 mb-6">Artikkelen finnes ikke eller er ikke publisert.</p>
          <a href="/" className="text-primary-600 font-semibold hover:text-primary-700">
            Tilbake til forsiden
          </a>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="container-xl max-w-4xl">
        <a href="/#nyheter" className="inline-flex items-center text-primary-600 text-sm font-semibold hover:text-primary-700 mb-8">
          ← Tilbake til nyheter
        </a>

        <div className="mb-6 flex items-center gap-3 text-sm text-gray-500">
          <span className="px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 font-semibold">{article.tag}</span>
          <time>{article.dateLabel}</time>
          <span aria-hidden="true">·</span>
          <span>{article.readTime} lesetid</span>
        </div>

        <h1 className="font-heading text-3xl lg:text-5xl font-bold text-ink leading-tight mb-4">
          {article.title}
        </h1>
        <p className="text-lg text-gray-600 mb-8">{article.excerpt}</p>

        <div className="rounded-3xl overflow-hidden mb-10 border border-gray-100">
          <img
            src={img(getCoverImage(article), 1200)}
            alt={article.title}
            className="w-full h-auto object-cover"
            loading="lazy"
          />
        </div>

        <article className="prose prose-lg max-w-none">
          <MarkdownArticle markdown={article.body} />
        </article>

        {!!related.length && (
          <div className="mt-14 pt-10 border-t border-gray-100">
            <h2 className="font-heading text-2xl font-bold text-ink mb-5">Relaterte nyheter</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {related.map(item => (
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
