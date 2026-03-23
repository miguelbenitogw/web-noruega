import { IMAGES, img } from '../assets/images'
import AnimateIn from './AnimateIn'
import { trackEvent } from '../lib/analytics'
import { getAllNews } from '../lib/news'

const tagColors = {
  Plattform: 'bg-primary-50 text-primary-700',
  Lovgivning: 'bg-amber-50 text-amber-700',
  Suksesshistorie: 'bg-green-50 text-green-700',
  Veiledning: 'bg-purple-50 text-purple-700',
}

const getTagStyles = (tag) => tagColors[tag] || 'bg-gray-100 text-gray-700'

export default function Nyheter() {
  const news = getAllNews()
  if (!news.length) return null

  const featured = news[0]

  return (
    <section id="nyheter" className="scroll-mt-28 py-24 lg:py-32 bg-white" aria-labelledby="nyheter-heading">
      <div className="container-xl">
        <AnimateIn>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
            <div className="max-w-xl">
              <span className="inline-block text-primary-600 font-semibold text-sm tracking-wide uppercase mb-3">
                Nyheter & artikler
              </span>
              <h2 id="nyheter-heading" className="font-heading text-3xl lg:text-4xl font-bold text-ink leading-tight">
                Siste nytt fra Global Working
              </h2>
            </div>
            <a
              href="/nyheter#nyheter-arkiv"
              onClick={() => trackEvent('cta_click', { location: 'nyheter', cta: 'se_alle_nyheter' })}
              className="shrink-0 inline-flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700 transition-colors"
            >
              Se alle nyheter
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
                alt={featured.title}
                className="w-full h-full object-cover"
                loading="lazy"
                width="640"
                height="240"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" aria-hidden="true" />
              <span className={`absolute bottom-4 left-5 px-3 py-1.5 rounded-full text-xs font-semibold ${getTagStyles(featured.tag)}`}>
                {featured.tag}
              </span>
            </div>
            <div className="p-7 flex flex-col flex-1">
              <div className="flex items-center gap-3 text-gray-400 text-sm mb-4">
                <time>{featured.dateLabel}</time>
                <span aria-hidden="true">·</span>
                <span>{featured.readTime} lesetid</span>
              </div>
              <h3 className="font-heading text-xl font-bold text-ink mb-3">{featured.title}</h3>
              <p className="text-gray-500 leading-relaxed flex-1">{featured.excerpt}</p>
              <a
                href={`/nyheter/${featured.slug}`}
                onClick={() => trackEvent('cta_click', { location: 'nyheter', cta: 'les_mer_featured' })}
                className="mt-6 inline-flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700 transition-colors text-sm"
              >
                Les mer
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </article>

          <div className="lg:col-span-2 flex flex-col gap-4">
            {news.slice(1, 4).map((article) => (
              <article
                key={article.slug}
                className="bg-surface rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:border-primary-100 transition-all duration-200 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTagStyles(article.tag)}`}>
                    {article.tag}
                  </span>
                  <time className="text-gray-400 text-xs">{article.dateLabel}</time>
                </div>
                <h3 className="font-heading text-base font-semibold text-ink leading-snug">{article.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">{article.excerpt}</p>
                <a
                  href={`/nyheter/${article.slug}`}
                  onClick={() => trackEvent('cta_click', { location: 'nyheter', cta: `les_mer_${article.slug}` })}
                  className="text-primary-600 font-semibold text-sm hover:text-primary-700 transition-colors"
                >
                  Les mer →
                </a>
              </article>
            ))}
          </div>
        </div>

        <div id="nyheter-arkiv" className="scroll-mt-28 mt-16 space-y-6">
          {news.map((article) => (
            <article id={`nyhet-${article.slug}`} key={article.slug} className="scroll-mt-28 border border-gray-100 rounded-2xl p-6 bg-white">
              <div className="flex items-center gap-3 mb-2 text-sm text-gray-500">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getTagStyles(article.tag)}`}>{article.tag}</span>
                <time>{article.dateLabel}</time>
                <span aria-hidden="true">·</span>
                <span>{article.readTime} lesetid</span>
              </div>
              <h3 className="font-heading text-xl font-bold text-ink mb-2">{article.title}</h3>
              <p className="text-gray-600 leading-relaxed">{article.excerpt}</p>
              <a
                href={`/nyheter/${article.slug}`}
                onClick={() => trackEvent('news_read_more_click', { slug: article.slug })}
                className="inline-flex mt-4 text-primary-600 text-sm font-semibold hover:text-primary-700"
              >
                Les artikkel
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
