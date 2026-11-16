import EditableText from '../components/editable/EditableText'
import KandidatKontakt from '../components/KandidatKontakt'
import PageEndNav from '../components/PageEndNav'
import PageHero from '../components/ui/PageHero'
import RuleList from '../components/ui/RuleList'
import { IMAGES, img, srcSet } from '../assets/images'
import { trackEvent } from '../lib/analytics'
import useContent from '../hooks/useContent'

/**
 * SpanskAlicantePage — la otra orilla, a página completa.
 *
 * Antes esta página era un muestrario del patrón por defecto: nueve cajas con
 * `rounded-[2rem]` y `shadow-lg`, cada lista con su circulito azul y su check,
 * un degradado `from-primary-50 via-white to-surface` debajo del testimonio y
 * un `AnimateIn` con fadeUp en cada sección.
 *
 * Ahora la jerarquía la dan el tono de fondo y los filetes, no la altura. Las
 * fotos —lo único cálido de la marca— mandan y salen por el borde de la
 * pantalla, alternando izquierda y derecha como en el teaser de la home.
 */

export default function SpanskAlicantePage() {
  const page = useContent('spanskAlicantePage')
  const processSteps = page.processSteps || []

  return (
    <>
      {/* La foto sale por el borde derecho de la pantalla: sin tarjeta y sin
          sombra, el borde es el marco. Eso lo pone PageHero cuando hay foto. */}
      <PageHero
        current={page.breadcrumb}
        currentPath="spanskAlicantePage.breadcrumb"
        titleId="spansk-alicante-hero-heading"
        title={page.heroTitle}
        titlePath="spanskAlicantePage.heroTitle"
        titleWidth="18ch"
        description={page.heroSubtitle}
        descriptionPath="spanskAlicantePage.heroSubtitle"
        media={(
          <img
            src={img(page.heroImageUrl || IMAGES.spanskAlicanteBeachPalms, 1400)}
            srcSet={srcSet(page.heroImageUrl || IMAGES.spanskAlicanteBeachPalms, [640, 1024, 1400])}
            sizes="(max-width: 1024px) 100vw, 50vw"
            alt={page.heroImageAlt || 'Strand og palmer i Alicante'}
            className="w-full h-[300px] lg:h-[520px] object-cover object-center rounded-panel lg:rounded-r-none"
            loading="eager"
            decoding="sync"
            width={1400}
            height={520}
          />
        )}
      >
        <EditableText
          as="p"
          path="spanskAlicantePage.intro"
          value={page.intro}
          multiline
          className="mt-5 gw-measure text-body text-primary-200 leading-[1.65]"
        />

        <div className="mt-9 flex flex-col sm:flex-row gap-3.5">
          <a
            href="#kandidat-kontakt"
            onClick={() => trackEvent('cta_click', { location: 'spansk_alicante_hero', cta: 'kandidat_kontakt' })}
            className="gw-btn gw-btn-ember"
          >
            <EditableText as="span" path="spanskAlicantePage.ctaSecondary" value={page.ctaSecondary} className="inline" />
          </a>
          <a
            href="#spansk-alicante-process"
            onClick={() => trackEvent('cta_click', { location: 'spansk_alicante_hero', cta: 'process' })}
            className="gw-btn gw-btn-ghost"
          >
            <EditableText as="span" path="spanskAlicantePage.ctaPrimary" value={page.ctaPrimary} className="inline" />
          </a>
        </div>
      </PageHero>

      {/* ── El relato ─────────────────────────────────────────────────────
          Cinco párrafos corridos: esto se lee, así que va en serif, a medida
          de lectura y sin caja alrededor. */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="container-xl">
          <div className="gw-measure border-t border-line pt-10 lg:pt-12">
            <EditableText
              as="div"
              path="spanskAlicantePage.exchangeNote"
              value={page.exchangeNote}
              multiline
              richText
              className="text-body lg:text-body-lg text-ink leading-[1.75] [&>p]:mb-6 [&>p:last-child]:mb-0 [&>p]:leading-[1.75]"
            />
          </div>
        </div>
      </section>

      {/* ── El rol: foto saliendo por la izquierda ───────────────────────── */}
      <section className="bg-surface overflow-hidden" aria-labelledby="spansk-alicante-role-heading">
        <div className="container-xl">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">

            <div className="lg:col-span-6 order-2 lg:order-1 pb-20 lg:py-28 gw-bleed-l">
              <img
                src={img(page.roleImageUrl || IMAGES.spanskAlicantePromenade, 1400)}
                alt={page.roleImageAlt || 'Sosial hverdag og samtaler i Alicante'}
                className="w-full h-[300px] lg:h-[520px] object-cover rounded-panel lg:rounded-l-none"
                loading="lazy"
                decoding="async"
                width={1400}
                height={520}
              />
            </div>

            <div className="lg:col-span-5 lg:col-start-8 order-1 lg:order-2 pt-24 lg:py-28">
              <EditableText
                as="h2"
                id="spansk-alicante-role-heading"
                path="spanskAlicantePage.roleTitle"
                value={page.roleTitle}
                className="text-display-sm font-semibold text-navy break-words"
              />
              <RuleList items={page.roleItems || []} basePath="spanskAlicantePage.roleItems" className="mt-8" />
            </div>

          </div>
        </div>
      </section>

      {/* ── Qué recibís / cómo es la semana ─────────────────────────────── */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="container-xl">
          <div className="grid lg:grid-cols-2 gap-14 lg:gap-20">
            <div>
              <EditableText
                as="h2"
                path="spanskAlicantePage.benefitsTitle"
                value={page.benefitsTitle}
                className="text-display-sm font-semibold text-navy break-words"
              />
              <RuleList items={page.benefitsItems || []} basePath="spanskAlicantePage.benefitsItems" className="mt-8" />
            </div>

            <div>
              <EditableText
                as="h2"
                path="spanskAlicantePage.weekTitle"
                value={page.weekTitle}
                className="text-display-sm font-semibold text-navy break-words"
              />
              <RuleList items={page.weekItems || []} basePath="spanskAlicantePage.weekItems" className="mt-8" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonio ────────────────────────────────────────────────────
          Antes: tarjeta blanca con sombra sobre un degradado y un icono de
          comillas gigante. Ahora la cita es tipografía y la cara es una foto. */}
      <section className="py-24 lg:py-32 bg-surface">
        <div className="container-xl">
          <figure className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {page.testimonialImageUrl && (
              <div className="lg:col-span-4">
                <img
                  src={page.testimonialImageUrl}
                  alt={page.testimonialImageAlt || page.testimonialAuthor || ''}
                  className="w-[200px] lg:w-full h-[240px] lg:h-[420px] object-cover object-top rounded-panel"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            )}
            <div className="lg:col-span-7 lg:col-start-6">
              <EditableText
                as="blockquote"
                path="spanskAlicantePage.testimonialQuote"
                value={page.testimonialQuote}
                multiline
                className="text-[1.375rem] lg:text-[1.75rem] text-navy leading-[1.45]"
              />
              <EditableText
                as="figcaption"
                path="spanskAlicantePage.testimonialAuthor"
                value={page.testimonialAuthor}
                className="mt-7 font-ui text-sm text-ink-soft"
              />
            </div>
          </figure>
        </div>
      </section>

      {/* ── La foto de la hverdag, de borde a borde ───────────────────────
          Sin contenedor, sin radio y sin sombra: es la sección más cálida de
          toda la web y no necesita marco. */}
      {page.beachCollageUrl && (
        <section className="bg-white">
          <img
            src={page.beachCollageUrl}
            alt={page.beachCollageAlt || 'Hverdagen i Alicante'}
            className="w-full h-[280px] sm:h-[360px] lg:h-[480px] object-cover"
            loading="lazy"
            decoding="async"
          />
        </section>
      )}

      {/* ── Curso de español / para quién es ────────────────────────────── */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="container-xl">
          <div className="grid lg:grid-cols-2 gap-14 lg:gap-20">
            <div>
              <EditableText
                as="h2"
                path="spanskAlicantePage.spanishCourseTitle"
                value={page.spanishCourseTitle}
                className="text-display-sm font-semibold text-navy break-words"
              />
              <RuleList items={page.spanishCourseItems || []} basePath="spanskAlicantePage.spanishCourseItems" className="mt-8" />
            </div>

            <div>
              <EditableText
                as="h2"
                path="spanskAlicantePage.fitTitle"
                value={page.fitTitle}
                className="text-display-sm font-semibold text-navy break-words"
              />
              <RuleList items={page.fitItems || []} basePath="spanskAlicantePage.fitItems" className="mt-8" />
            </div>
          </div>
        </div>
      </section>

      {/* ── La ciudad: foto saliendo por la derecha ──────────────────────── */}
      <section className="bg-surface overflow-hidden" aria-labelledby="spansk-alicante-city-heading">
        <div className="container-xl">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">

            <div className="lg:col-span-5 pt-24 lg:py-28">
              <EditableText
                as="h2"
                id="spansk-alicante-city-heading"
                path="spanskAlicantePage.cityTitle"
                value={page.cityTitle}
                className="text-display-sm font-semibold text-navy break-words"
              />
              <RuleList items={page.cityItems || []} basePath="spanskAlicantePage.cityItems" className="mt-8" />

              <div className="mt-10">
                <EditableText
                  as="h3"
                  path="spanskAlicantePage.socialTitle"
                  value={page.socialTitle}
                  className="font-heading text-lg font-semibold text-navy"
                />
                <div className="mt-4 flex flex-col items-start gap-2.5">
                  <a
                    href={page.instagramUrl || 'https://www.instagram.com/globalworking'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 font-ui text-body-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    <EditableText
                      as="span"
                      path="spanskAlicantePage.socialInstagram"
                      value={page.socialInstagram}
                      className="inline"
                    />
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                      <path d="M7 17L17 7M9 7h8v8" />
                    </svg>
                  </a>
                  <a
                    href={page.tiktokUrl || 'https://www.tiktok.com/@globalworking'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 font-ui text-body-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    <EditableText
                      as="span"
                      path="spanskAlicantePage.socialTikTok"
                      value={page.socialTikTok}
                      className="inline"
                    />
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                      <path d="M7 17L17 7M9 7h8v8" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 lg:col-start-7 pb-20 lg:py-28 gw-bleed-r">
              <img
                src={img(page.cityImageUrl || IMAGES.spanskAlicanteCityView, 1400)}
                alt={page.cityImageAlt || 'Byliv og utsikt i Alicante'}
                className="w-full h-[300px] lg:h-[560px] object-cover rounded-panel lg:rounded-r-none"
                loading="lazy"
                decoding="async"
                width={1400}
                height={560}
              />
            </div>

          </div>
        </div>
      </section>

      {/* ── El proceso ────────────────────────────────────────────────────
          Acá sí hay secuencia real —interés, charla, encaje, Alicante—, así
          que la numeración dice algo. Cuatro tarjetas con cuadrado azul y
          número en blanco decían «plantilla». */}
      <section id="spansk-alicante-process" className="scroll-mt-28 py-24 lg:py-32 bg-white" aria-labelledby="spansk-alicante-process-heading">
        <div className="container-xl">
          <EditableText
            as="h2"
            id="spansk-alicante-process-heading"
            path="spanskAlicantePage.processTitle"
            value={page.processTitle}
            className="text-display-sm font-semibold text-navy break-words max-w-[24ch]"
          />

          {processSteps.length > 0 && (
            <ol className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 border-t border-line">
              {processSteps.map((step, index) => (
                <li
                  key={`process-${index}`}
                  className="border-b border-line py-7 lg:border-l lg:first:border-l-0 lg:pl-6 lg:first:pl-0"
                >
                  <span className="gw-step text-primary-300">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <EditableText
                    as="p"
                    path={`spanskAlicantePage.processSteps.${index}`}
                    value={step}
                    className="mt-3 font-heading text-body font-semibold text-navy leading-snug"
                  />
                </li>
              ))}
            </ol>
          )}

          <div className="mt-12 flex flex-col sm:flex-row gap-3.5">
            <a
              href="#kandidat-kontakt"
              onClick={() => trackEvent('cta_click', { location: 'spansk_alicante_process', cta: 'kandidat_kontakt' })}
              className="gw-btn gw-btn-ink"
            >
              <EditableText as="span" path="spanskAlicantePage.ctaSecondary" value={page.ctaSecondary} className="inline" />
            </a>
            <a
              href="/spansk-i-alicante/hvorfor"
              onClick={() => trackEvent('cta_click', { location: 'spansk_alicante_process', cta: 'hvorfor' })}
              className="gw-btn gw-btn-line"
            >
              <EditableText as="span" path="spanskAlicantePage.visionLinkLabel" value={page.visionLinkLabel} className="inline" />
            </a>
          </div>
        </div>
      </section>

      <KandidatKontakt />

      <PageEndNav current="/spansk-i-alicante" />
    </>
  )
}
