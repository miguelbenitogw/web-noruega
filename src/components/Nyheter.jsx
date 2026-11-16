import { useMemo } from 'react'
import { IMAGES, img, srcSet } from '../assets/images'
import EditableText from './editable/EditableText'
import { trackEvent } from '../lib/analytics'
import { useNewsCollection } from '../hooks/useNews'
import useContent from '../hooks/useContent'

/**
 * Nyheter — la sección de prensa.
 *
 * Esta empresa vive de la prensa, así que la sección se compone como una
 * portada y no como una grilla de tarjetas:
 *
 *  · Una apertura: foto grande, rubro, titular grande y entradilla.
 *  · Una fila de tres breves separados por filetes verticales.
 *  · El archivo como índice de diario: fecha y rubro a la izquierda, titular y
 *    entradilla a la derecha, una línea por noticia.
 *
 * Lo que se fue: el mapa de cuatro colores de pastilla (ámbar, verde, violeta,
 * azul) que convertía el rubro en un semáforo y traía tres colores ajenos a la
 * paleta; el velo negro en degradado sobre la foto destacada; y las tarjetas
 * con `gw-panel-hover` repetidas diez veces en el archivo.
 */

// El rubro en versalitas pequeñas. Es la única caja alta permitida del sistema
// y es deliberada: es el cintillo de prensa, el mismo gesto que usa un diario.
const KICKER_CLASS = 'font-ui text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-primary-700'
const META_CLASS = 'font-ui text-[0.8125rem] text-ink-soft'

const parseNewsDate = (value) => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date
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

// Los artículos ya vienen completos del .md. Antes esto leía encima los
// overrides del editor visual, que desapareció con Supabase.
const resolveNewsField = (article, field) => article[field]

const ArrowIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
)

export default function Nyheter() {
  const { articles: news, loading } = useNewsCollection()
  const nyheter = useContent('nyheterSection')

  const orderedNews = useMemo(() => sortNewsForDisplay(news), [news])

  if (!orderedNews.length && loading) {
    return (
      <section id="nyheter" className="scroll-mt-28 py-24 lg:py-32 bg-white" aria-labelledby="nyheter-heading">
        <div className="container-xl">
          <p className="text-ink-muted">{nyheter.loadingLabel}</p>
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
  const featuredCover = featured.coverImageAssetUrl || featured.coverImage || IMAGES.platformHero
  const briefs = orderedNews.slice(1, 4)

  return (
    <section id="nyheter" className="scroll-mt-28 py-24 lg:py-32 bg-white" aria-labelledby="nyheter-heading">
      <div className="container-xl">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 pb-8 border-b border-line">
          <div className="max-w-xl">
            <span className="gw-label text-primary-600">
              {nyheter.label}
            </span>
            <h2 id="nyheter-heading" className="mt-5 text-display-sm font-semibold text-navy">
              {nyheter.heading}
            </h2>
          </div>
          <a
            href="/nyheter#nyheter-arkiv"
            onClick={() => trackEvent('cta_click', { location: 'nyheter', cta: 'se_alle_nyheter' })}
            className="shrink-0 inline-flex items-center gap-2 font-ui text-sm font-semibold text-primary-600 hover:text-navy transition-colors"
          >
            {nyheter.ctaLabel}
            <ArrowIcon />
          </a>
        </div>

        {/* ── Apertura ─────────────────────────────────────────────────────
            La noticia destacada ocupa el ancho entero: foto a la izquierda,
            texto a la derecha. Sin velo encima de la foto y sin caja. */}
        <article>
          <a
            href={`/nyheter/${featured.slug}`}
            onClick={() => trackEvent('cta_click', { location: 'nyheter', cta: 'les_mer_featured' })}
            className="group grid lg:grid-cols-12 gap-8 lg:gap-12 items-center"
          >
            <div className="lg:col-span-7 overflow-hidden rounded-panel bg-frost">
              <img
                src={img(featuredCover, 1200)}
                srcSet={srcSet(featuredCover, [640, 1024, 1200])}
                sizes="(max-width: 1024px) 100vw, 58vw"
                alt={featuredTitle}
                className="w-full h-[240px] sm:h-[340px] lg:h-[400px] object-cover"
                loading="lazy"
                decoding="async"
                width={1200}
                height={400}
              />
            </div>

            <div className="lg:col-span-5">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <EditableText
                  as="span"
                  path={`news.${featured.slug}.tag`}
                  value={featuredTag}
                  className={KICKER_CLASS}
                />
                <span className="h-px w-5 bg-line" aria-hidden="true" />
                <span className={META_CLASS}>
                  <time dateTime={featured.date}>{featured.dateLabel}</time>
                </span>
              </div>

              <EditableText
                as="h3"
                path={`news.${featured.slug}.title`}
                value={featuredTitle}
                className="mt-4 font-heading text-[1.625rem] lg:text-[2rem] font-semibold leading-[1.12]
                           tracking-[-0.025em] text-navy group-hover:text-primary-700 transition-colors"
              />

              <EditableText
                as="p"
                path={`news.${featured.slug}.excerpt`}
                value={featuredExcerpt}
                multiline
                className="mt-5 text-body leading-[1.65] text-ink-muted line-clamp-3"
              />

              <div className="mt-6 flex items-center gap-3">
                <span className="inline-flex items-center gap-2 font-ui text-sm font-semibold text-primary-600 group-hover:text-navy transition-colors">
                  {nyheter.readMoreLabel}
                  <ArrowIcon size={15} />
                </span>
                <span className={META_CLASS} aria-hidden="true">·</span>
                <span className={META_CLASS}>
                  <EditableText as="span" path={`news.${featured.slug}.readTime`} value={featuredReadTime} className="inline" />
                  {' '}{nyheter.readTimeSuffix}
                </span>
              </div>
            </div>
          </a>
        </article>

        {/* ── Tres breves ──────────────────────────────────────────────────
            Separados por filetes verticales, como las columnas de un diario.
            Antes eran tres tarjetas idénticas apiladas al costado. */}
        {!!briefs.length && (
          <div className="mt-14 pt-10 border-t border-line grid sm:grid-cols-3 sm:divide-x sm:divide-line gap-y-9">
            {briefs.map((article) => {
              const title = resolveNewsField(article, 'title')
              const excerpt = resolveNewsField(article, 'excerpt')
              const tag = resolveNewsField(article, 'tag')

              return (
                <article key={article.slug} className="sm:px-7 sm:first:pl-0 sm:last:pr-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <EditableText
                      as="span"
                      path={`news.${article.slug}.tag`}
                      value={tag}
                      className={KICKER_CLASS}
                    />
                    <span className={META_CLASS}>
                      <time dateTime={article.date}>{article.dateLabel}</time>
                    </span>
                  </div>
                  <h3 className="mt-3">
                    <a
                      href={`/nyheter/${article.slug}`}
                      onClick={() => trackEvent('cta_click', { location: 'nyheter', cta: `les_mer_${article.slug}` })}
                      className="font-heading text-body font-semibold leading-snug text-navy hover:text-primary-700 transition-colors"
                    >
                      <EditableText
                        as="span"
                        path={`news.${article.slug}.title`}
                        value={title}
                        className="inline"
                      />
                    </a>
                  </h3>
                  <EditableText
                    as="p"
                    path={`news.${article.slug}.excerpt`}
                    value={excerpt}
                    multiline
                    className="mt-2.5 text-[0.9375rem] leading-[1.6] text-ink-muted line-clamp-2"
                  />
                </article>
              )
            })}
          </div>
        )}

        {/* ── Archivo ──────────────────────────────────────────────────────
            Índice completo. Una fila por noticia con la fecha y el rubro en la
            columna izquierda: se puede recorrer con la vista sin leer nada. */}
        <div id="nyheter-arkiv" className="scroll-mt-28 mt-20 lg:mt-24">
          <h2 className="font-ui text-[0.8125rem] font-semibold text-ink-soft">
            {nyheter.ctaLabel}
          </h2>

          <div className="mt-6 border-t border-line">
            {orderedNews.map((article) => {
              const title = resolveNewsField(article, 'title')
              const excerpt = resolveNewsField(article, 'excerpt')
              const tag = resolveNewsField(article, 'tag')
              const readTime = resolveNewsField(article, 'readTime')

              return (
                <article
                  id={`nyhet-${article.slug}`}
                  key={article.slug}
                  className="scroll-mt-28 group border-b border-line"
                >
                  <a
                    href={`/nyheter/${article.slug}`}
                    onClick={() => trackEvent('news_read_more_click', { slug: article.slug })}
                    className="grid gap-x-10 gap-y-3 py-7 transition-colors hover:bg-frost
                               sm:grid-cols-12 sm:px-5 sm:-mx-5"
                    aria-label={`${nyheter.readArticleLabel}: ${title}`}
                  >
                    <div className="sm:col-span-3 lg:col-span-2">
                      <span className={`block ${META_CLASS} tabular-nums`}>
                        <time dateTime={article.date}>{article.dateLabel}</time>
                      </span>
                      <EditableText
                        as="span"
                        path={`news.${article.slug}.tag`}
                        value={tag}
                        className={`mt-1.5 block ${KICKER_CLASS}`}
                      />
                    </div>

                    <div className="sm:col-span-9 lg:col-span-10 lg:flex lg:items-start lg:gap-10">
                      <div className="lg:flex-1">
                        <EditableText
                          as="h3"
                          path={`news.${article.slug}.title`}
                          value={title}
                          className="font-heading text-[1.1875rem] lg:text-[1.3125rem] font-semibold leading-snug text-navy
                                     group-hover:text-primary-700 transition-colors"
                        />
                        <EditableText
                          as="p"
                          path={`news.${article.slug}.excerpt`}
                          value={excerpt}
                          multiline
                          className="mt-2 max-w-measure text-[0.9375rem] leading-[1.6] text-ink-muted line-clamp-2"
                        />
                      </div>

                      <div className="flex items-center gap-3 lg:shrink-0 lg:pt-1">
                        <span className={META_CLASS}>
                          <EditableText as="span" path={`news.${article.slug}.readTime`} value={readTime} className="inline" />
                          {' '}{nyheter.readTimeSuffix}
                        </span>
                        <span className="text-line group-hover:text-primary-600 transition-colors" aria-hidden="true">
                          <ArrowIcon size={15} />
                        </span>
                      </div>
                    </div>
                  </a>
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
