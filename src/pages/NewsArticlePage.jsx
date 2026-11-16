import { useEffect, useMemo } from 'react'
import MarkdownArticle, { getMarkdownSections } from '../components/MarkdownArticle'
import { IMAGES, img, srcSet } from '../assets/images'
import { trackEvent } from '../lib/analytics'
import { setArticleSEO } from '../lib/seo'
import { useNewsArticle } from '../hooks/useNews'
import EditableText from '../components/editable/EditableText'
import useContent from '../hooks/useContent'

/**
 * NewsArticlePage — la página de prensa.
 *
 * Antes: una columna de 48rem con la cabecera, la foto en `rounded-3xl`, un
 * índice de pastillas y el cuerpo ocupando el mismo ancho que el titular. En
 * serif eso daba ochenta y cinco caracteres por línea.
 *
 * Ahora la retícula hace el trabajo de un diario: el texto va en una columna
 * de ~38rem (la medida de lectura del sistema), el índice vive al costado y se
 * queda pegado mientras bajás, y la foto rompe a lo ancho de las dos columnas.
 * La jerarquía la da el tamaño del titular y los filetes, no las sombras.
 */

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

const getCoverImage = (article) => {
  if (article.coverImageAssetUrl) return article.coverImageAssetUrl
  if (article.coverImageAsset?.publicUrl) return article.coverImageAsset.publicUrl
  if (article.coverImage && article.coverImage.startsWith('http')) return article.coverImage
  if (article.coverImage && article.coverImage.startsWith('/')) return article.coverImage
  return IMAGES.platformHero
}

export default function NewsArticlePage({ slug }) {
  const { article, articles: allNews, loading } = useNewsArticle(slug)
  const nyheter = useContent('nyheterSection')

  // El artículo ya viene completo del .md; antes esto aplicaba encima los
  // overrides del editor visual, que ya no existen.
  const effectiveArticle = article

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

  if (loading && !article) {
    return (
      <section className="bg-white pt-32 pb-24">
        <div className="container-xl">
          <h1 className="font-heading text-display-sm font-semibold text-navy">{nyheter.loadingTitle}</h1>
          <p className="mt-4 gw-measure text-ink-muted">{nyheter.loadingDescription}</p>
        </div>
      </section>
    )
  }

  if (!article) {
    return (
      <section className="bg-white pt-32 pb-24">
        <div className="container-xl">
          <h1 className="font-heading text-display-sm font-semibold text-navy">{nyheter.notFoundTitle}</h1>
          <p className="mt-4 gw-measure text-ink-muted">{nyheter.notFoundDescription}</p>
          <a
            href="/"
            className="mt-7 inline-flex items-center gap-2 font-ui text-sm font-semibold text-primary-600 hover:text-navy transition-colors"
          >
            {nyheter.backToNewsLabel || 'Tilbake til forsiden'}
          </a>
        </div>
      </section>
    )
  }

  const coverImage = getCoverImage(effectiveArticle)

  return (
    <article className="bg-white">
      {/* ── Cabecera ────────────────────────────────────────────────────────
          Rubro, titular, bajada y firma. Nada más: es la portada del texto. */}
      <div className="container-xl pt-28 lg:pt-32">
        <div className="mx-auto max-w-[56rem]">
          <a
            href="/nyheter#nyheter-arkiv"
            className="group inline-flex items-center gap-2 font-ui text-body-xs font-semibold text-ink-soft hover:text-navy transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            {nyheter.backToNewsLabel}
          </a>

          <div className="mt-10 max-w-measure">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <EditableText
                as="span"
                path={`news.${effectiveArticle.slug}.tag`}
                value={effectiveArticle.tag}
                className="gw-kicker"
              />
              {/* El único naranja de esta pantalla: el mismo filete corto de
                  `.gw-label`, que acá no se usa porque el rubro ya hace de
                  etiqueta. En la portada de noticias este filete va en gris,
                  porque allá el naranja se lo gasta el `.gw-label` del título
                  de sección. */}
              <span className="h-px w-5 bg-cta" aria-hidden="true" />
              <span className="gw-meta">
                <time dateTime={effectiveArticle.date}>{effectiveArticle.dateLabel}</time>
              </span>
            </div>

            <EditableText
              as="h1"
              path={`news.${effectiveArticle.slug}.title`}
              value={effectiveArticle.title}
              className="mt-5 text-display-sm font-semibold text-navy"
            />

            <EditableText
              as="p"
              path={`news.${effectiveArticle.slug}.excerpt`}
              value={effectiveArticle.excerpt}
              multiline
              className="mt-6 text-[1.125rem] lg:text-[1.25rem] leading-[1.6] text-ink-muted"
            />

            <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line pt-4">
              <span className="font-ui text-body-xs font-semibold text-ink">{effectiveArticle.author}</span>
              <span className="gw-meta" aria-hidden="true">·</span>
              <span className="gw-meta">
                <EditableText as="span" path={`news.${effectiveArticle.slug}.readTime`} value={effectiveArticle.readTime} className="inline" />
                {' '}{nyheter.readTimeSuffix}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Foto ────────────────────────────────────────────────────────────
          Sale más ancha que el texto: es la única ruptura de la columna. */}
      <div className="container-xl mt-12 lg:mt-14">
        <div className="mx-auto max-w-[56rem] overflow-hidden rounded-panel bg-frost">
          <img
            src={img(coverImage, 1200)}
            srcSet={srcSet(coverImage, [640, 1024, 1200])}
            sizes="(max-width: 1024px) 100vw, 960px"
            alt={effectiveArticle.title}
            className="w-full h-[220px] sm:h-[340px] lg:h-[440px] object-cover"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            width={1200}
            height={440}
          />
        </div>
      </div>

      {/* ── Cuerpo + índice ────────────────────────────────────────────────
          Dos columnas: el texto a la medida de lectura y el índice al costado,
          pegado mientras se baja. En móvil el índice va antes del texto, que
          es donde sirve. */}
      <div className="container-xl pb-20 lg:pb-28">
        <div className="mx-auto max-w-[56rem] mt-12 lg:mt-16 lg:grid lg:grid-cols-12 lg:gap-x-12">

          {!!sections.length && (
            <nav
              aria-label="Innholdsoversikt"
              className="mb-12 border-t border-line pt-5 lg:mb-0 lg:col-span-4 lg:col-start-9 lg:row-start-1
                         lg:sticky lg:top-28 lg:self-start"
            >
              <p className="font-ui text-body-xs font-semibold text-ink-soft">
                {nyheter.jumpToSectionLabel}
              </p>
              <ol className="mt-4 space-y-2.5">
                {sections.map((section, index) => (
                  <li key={section.id} className="flex gap-3">
                    <span className="font-ui text-[0.75rem] tabular-nums text-ink-soft pt-[0.2rem]">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <a
                      href={`#${section.id}`}
                      className="font-ui text-[0.875rem] leading-snug text-ink-muted hover:text-navy transition-colors"
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          <div className="lg:col-span-8 lg:col-start-1 lg:row-start-1">
            <MarkdownArticle markdown={effectiveArticle.body} />
          </div>
        </div>
      </div>

      {/* ── Relacionadas ───────────────────────────────────────────────────
          Tres entradas separadas por filetes, no tres tarjetas con sombra. */}
      {!!related.length && (
        <div className="border-t border-line bg-surface py-16 lg:py-20">
          <div className="container-xl">
            <h2 className="font-heading text-[1.375rem] font-semibold text-navy">{nyheter.relatedLabel}</h2>

            <div className="mt-8 grid gap-px bg-line sm:grid-cols-3">
              {related.map((item) => (
                <a
                  key={item.slug}
                  href={`/nyheter/${item.slug}`}
                  onClick={() => trackEvent('news_related_click', { from_slug: article.slug, to_slug: item.slug })}
                  className="group flex flex-col bg-surface p-6 transition-colors hover:bg-white"
                >
                  <span className="gw-kicker">{item.tag}</span>
                  <h3 className="mt-3 font-heading text-body font-semibold leading-snug text-navy">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 flex-1 text-body-sm leading-[1.6] text-ink-muted line-clamp-3">
                    {item.excerpt}
                  </p>
                  <span className="mt-5 gw-meta">
                    <time dateTime={item.date}>{item.dateLabel}</time>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </article>
  )
}
