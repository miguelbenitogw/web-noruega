import HvaGjor from '../components/HvaGjor'
import Rekruttering from '../components/Rekruttering'
import GodeGrunner from '../components/GodeGrunner'
import PageEndNav from '../components/PageEndNav'
import PageHero from '../components/ui/PageHero'
import RuleGrid from '../components/ui/RuleGrid'
import TextLink from '../components/ui/TextLink'
import { IMAGES, img, srcSet } from '../assets/images'
import { trackEvent } from '../lib/analytics'
import useContent from '../hooks/useContent'
import { useNewsCollection } from '../hooks/useNews'
import RichText from '../components/ui/RichText'

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
      <PageHero
        current={hero.breadcrumb}
        title={hero.h1}
        titleId="rekruttering-hero-heading"
        trust
        titleWidth="20ch"
        description={hero.description}
      />

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
              <span className="gw-label text-primary-600">{collab.label}</span>
              <h2 id="samarbeid-heading" className="mt-5 text-display-sm font-semibold text-navy">
                {collab.heading}
              </h2>

              {/* Tres campos, un solo texto: `gw-stack` les da el mismo aire
                  que a los párrafos dentro de un campo (antes `space-y-4`,
                  que no coincidía con la línea en blanco de los datos). */}
              <div className="mt-6 gw-measure gw-stack text-body text-ink-muted leading-[1.6]">
                <RichText value={collab.p1} />
                <RichText value={collab.p2} />
                <RichText value={collab.p3} />
              </div>

              <div className="mt-9 flex flex-col sm:flex-row sm:flex-wrap gap-3.5">
                <a
                  href="/kontakt"
                  onClick={() => trackEvent('cta_click', { location: 'collaboration_model', cta: 'kontakt_oss' })}
                  className="gw-btn gw-btn-ember"
                >
                  <span>{collab.cta1}</span>
                </a>
                <a
                  href="/talentportalen"
                  onClick={() => trackEvent('cta_click', { location: 'collaboration_model', cta: 'se_kandidatportalen' })}
                  className="gw-btn gw-btn-line"
                >
                  <span>{collab.cta2}</span>
                </a>
              </div>
            </div>

            {/* Antes: estudiantes charlando en un banco. Al lado dice
                «uforpliktende kartlegging» y «vi presenterer kandidater»: la foto
                enseña dónde se hace ese trabajo, la oficina de Alicante. */}
            <figure className="lg:col-span-5 lg:col-start-8">
              <img
                src={img(collab.imageUrl || IMAGES.oficinaAbierta, 1024)}
                srcSet={srcSet(collab.imageUrl || IMAGES.oficinaAbierta)}
                sizes="(min-width: 1024px) 40vw, 100vw"
                alt={collab.imageAlt || 'Ansatte ved arbeidsplassene sine i kontorlandskapet til Global Working i Alicante'}
                className="gw-photo w-full h-[280px] lg:h-[460px] object-[60%_50%]"
                loading="lazy"
                decoding="async"
              />
              <figcaption className="gw-caption">Kontorlandskapet på hovedkontoret vårt i Alicante.</figcaption>
            </figure>
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
              <TextLink
                href="/nyheter"
                onClick={() => trackEvent('cta_click', { location: 'rekruttering_news', cta: 'se_alle_nyheter' })}
                className="shrink-0"
              >
                {nyheter.ctaLabel}
              </TextLink>
            </div>

            <RuleGrid cols="md2" className="border-t border-line">
              {latestNews.map((article) => (
                <RuleGrid.Cell
                  as="article"
                  key={article.slug}
                  className="group flex flex-col py-8 md:px-8 md:first:pl-0 md:last:pr-0"
                >
                  <div className="flex items-center gap-3 font-ui text-body-xs">
                    <span className="font-semibold text-primary-600">{article.tag}</span>
                    <span className="text-line" aria-hidden="true">·</span>
                    <time className="text-ink-soft">{article.dateLabel}</time>
                  </div>

                  <h3 className="mt-4 font-heading text-[1.3125rem] font-semibold text-navy leading-snug">
                    {article.title}
                  </h3>
                  <RichText
                    value={article.excerpt}
                    className="mt-3 flex-1 text-body text-ink-muted leading-[1.6]"
                  />

                  <TextLink
                    href={`/nyheter/${article.slug}`}
                    onClick={() => trackEvent('news_open', { slug: article.slug, location: 'rekruttering' })}
                    className="mt-6"
                  >
                    {nyheter.readMoreLabel}
                  </TextLink>
                </RuleGrid.Cell>
              ))}
            </RuleGrid>
          </div>
        </section>
      )}

      <PageEndNav current="/vr-rekrutteringsmodell" />
    </>
  )
}
