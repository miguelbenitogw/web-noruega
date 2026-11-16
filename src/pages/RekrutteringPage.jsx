import HvaGjor from '../components/HvaGjor'
import Rekruttering from '../components/Rekruttering'
import GodeGrunner from '../components/GodeGrunner'
import PageEndNav from '../components/PageEndNav'
import { IMAGES, img } from '../assets/images'
import { trackEvent } from '../lib/analytics'
import useContent from '../hooks/useContent'
import EditableText from '../components/editable/EditableText'
import EditableImage from '../components/editable/EditableImage'
import { useNewsCollection } from '../hooks/useNews'

/**
 * Vår rekrutteringsmodell
 *
 * La página explica un proceso de 9–14 meses a un responsable de personal de
 * un ayuntamiento. Lo que había era el kit por defecto: hero animado, pastilla
 * de color por cada etiqueta, foto con `shadow-xl` y dos manchas decorativas
 * detrás, y dos noticias en tarjetas con `hover:shadow-lg` y etiquetas de
 * cuatro colores distintos.
 *
 * Ahora el hero es plano como el del resto de las internas, la jerarquía la
 * dan el tono y el filete, y el naranja aparece una sola vez: en «Kontakt
 * oss», que es la única acción que importa en esta página.
 */
export default function RekrutteringPage() {
  const hero = useContent('rekrutteringHero')
  const collab = useContent('rekrutteringCollab')
  const nyheter = useContent('nyheterSection')
  const { articles: news } = useNewsCollection()
  const latestNews = news.slice(0, 2)

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────
          Plano, navy sólido, sin degradado ni mancha radial: el mismo que
          /talentportalen y el resto de las internas. */}
      <section className="bg-navy pt-32 pb-16 lg:pt-40 lg:pb-20">
        <div className="container-xl">
          <nav aria-label="Brødsmuler" className="mb-7">
            <ol className="flex items-center gap-2 font-ui text-sm text-primary-300">
              <li>
                <a href="/" className="hover:text-white transition-colors">Hjem</a>
              </li>
              <li className="text-primary-400" aria-hidden="true">/</li>
              <li className="text-white">{hero.breadcrumb}</li>
            </ol>
          </nav>

          <EditableText
            as="h1"
            path="rekrutteringHero.h1"
            value={hero.h1}
            className="text-display font-semibold !text-white max-w-[20ch]"
          />
          <EditableText
            as="p"
            path="rekrutteringHero.description"
            value={hero.description}
            multiline
            className="mt-6 gw-measure text-body lg:text-[1.1875rem] text-primary-100 leading-[1.6]"
          />
        </div>
      </section>

      <HvaGjor />
      <Rekruttering />

      {/* ── Modelo de colaboración ────────────────────────────────────────
          Dos columnas: a la izquierda la explicación en serif a medida de
          lectura, a la derecha la foto. Sin sombra y sin los dos cuadrados
          de color que flotaban detrás de la imagen. */}
      <section className="py-20 lg:py-28 bg-surface" aria-labelledby="samarbeid-heading">
        <div className="container-xl">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            <div className="lg:col-span-6">
              <EditableText
                as="span"
                path="rekrutteringCollab.label"
                value={collab.label}
                className="gw-label text-primary-600"
              />
              <EditableText
                as="h2"
                id="samarbeid-heading"
                path="rekrutteringCollab.heading"
                value={collab.heading}
                className="mt-5 text-display-sm font-semibold text-navy"
              />

              <div className="mt-6 gw-measure space-y-4 text-body text-ink-muted leading-[1.7]">
                <EditableText as="p" path="rekrutteringCollab.p1" value={collab.p1} multiline />
                <EditableText as="p" path="rekrutteringCollab.p2" value={collab.p2} multiline />
                <EditableText as="p" path="rekrutteringCollab.p3" value={collab.p3} multiline />
              </div>

              <div className="mt-9 flex flex-col sm:flex-row gap-3.5">
                <a
                  href="/kontakt"
                  onClick={() => trackEvent('cta_click', { location: 'collaboration_model', cta: 'kontakt_oss' })}
                  className="gw-btn gw-btn-ember"
                >
                  <EditableText as="span" path="rekrutteringCollab.cta1" value={collab.cta1} className="inline" />
                </a>
                <a
                  href="/talentportalen"
                  onClick={() => trackEvent('cta_click', { location: 'collaboration_model', cta: 'se_kandidatportalen' })}
                  className="gw-btn gw-btn-line bg-white"
                >
                  <EditableText as="span" path="rekrutteringCollab.cta2" value={collab.cta2} className="inline" />
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 lg:col-start-8">
              <EditableImage
                path="rekrutteringCollab.imageUrl"
                src={img(collab.imageUrl || IMAGES.rekruttering, 900)}
                alt={collab.imageAlt || 'Global Working rekrutteringsprosessen'}
                className="w-full h-[280px] lg:h-[460px] object-cover rounded-panel"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      <GodeGrunner />

      {/* ── Dos noticias ─────────────────────────────────────────────────
          Antes: tarjetas con sombra que crecía al pasar el ratón y una
          etiqueta de color distinto por tema (azul, ámbar, verde, violeta).
          Cuatro colores para decir «tema» es ruido. Ahora dos columnas
          separadas por un filete y una sola voz para los metadatos. */}
      {latestNews.length > 0 && (
        <section className="py-20 lg:py-28 bg-white" aria-labelledby="rekruttering-nyheter-heading">
          <div className="container-xl">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 lg:mb-14">
              <div className="max-w-2xl">
                <span className="gw-label text-primary-600">{nyheter.label}</span>
                <h2
                  id="rekruttering-nyheter-heading"
                  className="mt-5 text-display-sm font-semibold text-navy"
                >
                  {nyheter.headingPreview}
                </h2>
              </div>
              <a
                href="/nyheter"
                onClick={() => trackEvent('cta_click', { location: 'rekruttering_news', cta: 'se_alle_nyheter' })}
                className="group shrink-0 inline-flex items-center gap-2 font-ui text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
              >
                {nyheter.ctaLabel}
                <svg
                  width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"
                  className="transition-transform duration-200 group-hover:translate-x-1"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>

            <div className="grid md:grid-cols-2 border-t border-line">
              {latestNews.map((article) => (
                <article
                  key={article.slug}
                  className="group flex flex-col py-8 md:px-8 md:first:pl-0 md:last:pr-0
                             border-line [&:nth-child(n+2)]:border-t md:[&:nth-child(n+2)]:border-t-0
                             md:[&:nth-child(n+2)]:border-l"
                >
                  <div className="flex items-center gap-3 font-ui text-[0.8125rem]">
                    <EditableText
                      as="span"
                      path={`news.${article.slug}.tag`}
                      value={article.tag}
                      className="font-semibold text-primary-600"
                    />
                    <span className="text-line" aria-hidden="true">·</span>
                    <time className="text-ink-soft">{article.dateLabel}</time>
                  </div>

                  <EditableText
                    as="h3"
                    path={`news.${article.slug}.title`}
                    value={article.title}
                    className="mt-4 font-heading text-[1.3125rem] font-semibold text-navy leading-snug"
                  />
                  <EditableText
                    as="p"
                    path={`news.${article.slug}.excerpt`}
                    value={article.excerpt}
                    multiline
                    inputClassName="min-h-[180px]"
                    className="mt-3 flex-1 text-body text-ink-muted leading-[1.65]"
                  />

                  <a
                    href={`/nyheter/${article.slug}`}
                    onClick={() => trackEvent('news_open', { slug: article.slug, location: 'rekruttering' })}
                    className="mt-6 inline-flex items-center gap-2 font-ui text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    {nyheter.readMoreLabel}
                    <svg
                      width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <PageEndNav current="/vr-rekrutteringsmodell" />
    </>
  )
}
