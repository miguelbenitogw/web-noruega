import KandidatKontakt from '../components/KandidatKontakt'
import PageEndNav from '../components/PageEndNav'
import PageHero from '../components/ui/PageHero'
import RuleList from '../components/ui/RuleList'
import { IMAGES, img, srcSet } from '../assets/images'
import { trackEvent } from '../lib/analytics'
import useContent from '../hooks/useContent'
import RichText from '../components/ui/RichText'
import MarkdownText from '../components/ui/MarkdownText'

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
        titleId="spansk-alicante-hero-heading"
        title={page.heroTitle}
        titleWidth="18ch"
        description={page.heroSubtitle}
        media={(
          <img
            /* La foto es vertical (1080x1350) en una caja horizontal: centrada
               solo se veía arena y la coronilla abajo. Se baja el encuadre para
               que se vea a la persona. */
            src={img(page.heroImageUrl || IMAGES.spanskAlicanteBeachPalms, 1400)}
            srcSet={srcSet(page.heroImageUrl || IMAGES.spanskAlicanteBeachPalms, [640, 1024, 1400])}
            sizes="(max-width: 1024px) 100vw, 50vw"
            alt={page.heroImageAlt || 'Strand og palmer i Alicante'}
            className="w-full h-[300px] lg:h-[520px] object-cover object-[50%_82%] rounded-panel"
            loading="eager"
            decoding="sync"
            width={1400}
            height={520}
          />
        )}
      >
        {/* Cuerpo sobre navy: `primary-100`, como en todas las bandas navy de
            la web. Era la única que lo llevaba en `primary-200`. */}
        <RichText
          value={page.intro}
          className="mt-5 gw-measure text-body text-primary-100 leading-[1.6]"
          tone="dark"
        />

        <div className="mt-9 flex flex-col sm:flex-row gap-3.5">
          <a
            href="#kandidat-kontakt"
            onClick={() => trackEvent('cta_click', { location: 'spansk_alicante_hero', cta: 'kandidat_kontakt' })}
            className="gw-btn gw-btn-ember"
          >
            <span>{page.ctaSecondary}</span>
          </a>
          <a
            href="#spansk-alicante-process"
            onClick={() => trackEvent('cta_click', { location: 'spansk_alicante_hero', cta: 'process' })}
            className="gw-btn gw-btn-ghost"
          >
            <span>{page.ctaPrimary}</span>
          </a>
        </div>
      </PageHero>

      {/* ── El relato ─────────────────────────────────────────────────────
          Cinco párrafos corridos: esto se lee, así que va en serif, a medida
          de lectura y sin caja alrededor. */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container-xl">
          {/* Centrado: es un relato sin título ni foto al lado, y pegado a la
              izquierda dejaba media pantalla vacía. Justificado con corte
              silábico, como los artículos. */}
          <div className="gw-measure mx-auto border-t border-line pt-10 lg:pt-12">
            <MarkdownText
              value={page.exchangeNote}
              className="text-body lg:text-body-lg text-ink leading-[1.6] [&_p]:text-justify [&_p]:hyphens-auto"
            />
          </div>
        </div>
      </section>

      {/* ── El rol: foto saliendo por la izquierda ───────────────────────── */}
      <section className="bg-surface overflow-hidden" aria-labelledby="spansk-alicante-role-heading">
        <div className="container-xl">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">

            <div className="lg:col-span-6 order-2 lg:order-1 pb-20 lg:py-28">
              <img
                src={img(page.roleImageUrl || IMAGES.spanskAlicantePromenade, 1400)}
                alt={page.roleImageAlt || 'Sosial hverdag og samtaler i Alicante'}
                className="w-full h-[300px] lg:h-[520px] object-cover rounded-panel"
                loading="lazy"
                decoding="async"
                width={1400}
                height={520}
              />
            </div>

            <div className="lg:col-span-5 lg:col-start-8 order-1 lg:order-2 pt-24 lg:py-28">
              <h2
                id="spansk-alicante-role-heading"
                className="text-display-sm font-semibold text-navy break-words"
              >
                {page.roleTitle}
              </h2>
              <RuleList items={page.roleItems || []} className="mt-8" />
            </div>

          </div>
        </div>
      </section>

      {/* ── Qué recibís / cómo es la semana ─────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container-xl">
          <div className="grid lg:grid-cols-2 gap-14 lg:gap-20">
            <div>
              <h2 className="text-display-sm font-semibold text-navy break-words">{page.benefitsTitle}</h2>
              <RuleList items={page.benefitsItems || []} className="mt-8" />
            </div>

            <div>
              <h2 className="text-display-sm font-semibold text-navy break-words">{page.weekTitle}</h2>
              <RuleList items={page.weekItems || []} className="mt-8" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonio ────────────────────────────────────────────────────
          Antes: tarjeta blanca con sombra sobre un degradado y un icono de
          comillas gigante. Ahora la cita es tipografía y la cara es una foto. */}
      <section className="py-20 lg:py-28 bg-surface">
        <div className="container-xl">
          <figure className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {page.testimonialImageUrl && (
              <div className="lg:col-span-4">
                <img
                  src={img(page.testimonialImageUrl, 993)}
                  alt={page.testimonialImageAlt || page.testimonialAuthor || ''}
                  className="w-[200px] lg:w-full h-[240px] lg:h-[420px] object-cover object-top rounded-panel"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            )}
            <div className="lg:col-span-7 lg:col-start-6">
              <RichText
                as="blockquote"
                value={page.testimonialQuote}
                className="text-[1.375rem] lg:text-[1.75rem] text-navy leading-[1.45]"
              />
              <figcaption className="mt-7 font-ui text-sm text-ink-soft">{page.testimonialAuthor}</figcaption>
            </div>
          </figure>
        </div>
      </section>

      {/* ── La foto de la hverdag, de borde a borde ───────────────────────
          Sin contenedor, sin radio y sin sombra: es la sección más cálida de
          toda la web y no necesita marco. */}
      {page.beachCollageUrl && (
        <section className="bg-white">
          {/* Dentro del ancho máximo, como todas las fotos desde el 25/11/2026: a
            pantalla completa quedaba descompensada frente al texto en monitores anchos. */}
          <div className="container-xl">
            <img
              src={img(page.beachCollageUrl, 2560)}
              alt={page.beachCollageAlt || 'Hverdagen i Alicante'}
              className="w-full h-[280px] sm:h-[360px] lg:h-[480px] object-cover object-[74%_50%] rounded-panel"
              loading="lazy"
              decoding="async"
            />
          </div>
        </section>
      )}

      {/* ── Curso de español / para quién es ────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container-xl">
          <div className="grid lg:grid-cols-2 gap-14 lg:gap-20">
            <div>
              <h2 className="text-display-sm font-semibold text-navy break-words">
                {page.spanishCourseTitle}
              </h2>
              <RuleList items={page.spanishCourseItems || []} className="mt-8" />
            </div>

            <div>
              <h2 className="text-display-sm font-semibold text-navy break-words">{page.fitTitle}</h2>
              <RuleList items={page.fitItems || []} className="mt-8" />
            </div>
          </div>
        </div>
      </section>

      {/* ── La ciudad: foto saliendo por la derecha ──────────────────────── */}
      <section className="bg-surface overflow-hidden" aria-labelledby="spansk-alicante-city-heading">
        <div className="container-xl">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">

            <div className="lg:col-span-5 pt-24 lg:py-28">
              <h2
                id="spansk-alicante-city-heading"
                className="text-display-sm font-semibold text-navy break-words"
              >
                {page.cityTitle}
              </h2>
              <RuleList items={page.cityItems || []} className="mt-8" />

              <div className="mt-10">
                <h3 className="font-heading text-lg font-semibold text-navy">{page.socialTitle}</h3>
                <div className="mt-4 flex flex-col items-start gap-2.5">
                  <a
                    href={page.instagramUrl || 'https://www.instagram.com/globalworking'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group gw-tap inline-flex items-center gap-2 font-ui text-body-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    <span>{page.socialInstagram}</span>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                      <path d="M7 17L17 7M9 7h8v8" />
                    </svg>
                  </a>
                  <a
                    href={page.tiktokUrl || 'https://www.tiktok.com/@globalworking'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group gw-tap inline-flex items-center gap-2 font-ui text-body-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    <span>{page.socialTikTok}</span>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                      <path d="M7 17L17 7M9 7h8v8" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 lg:col-start-7 pb-20 lg:py-28">
              <img
                src={img(page.cityImageUrl || IMAGES.spanskAlicanteCityView, 1400)}
                alt={page.cityImageAlt || 'Byliv og utsikt i Alicante'}
                className="w-full h-[300px] lg:h-[560px] object-cover rounded-panel"
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
      <section id="spansk-alicante-process" className="scroll-mt-28 py-20 lg:py-28 bg-white" aria-labelledby="spansk-alicante-process-heading">
        <div className="container-xl">
          <h2
            id="spansk-alicante-process-heading"
            className="text-display-sm font-semibold text-navy break-words max-w-[24ch]"
          >
            {page.processTitle}
          </h2>

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
                  <p className="mt-3 font-heading text-body font-semibold text-navy leading-snug">{step}</p>
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
              <span>{page.ctaSecondary}</span>
            </a>
            <a
              href="/spansk-i-alicante/hvorfor"
              onClick={() => trackEvent('cta_click', { location: 'spansk_alicante_process', cta: 'hvorfor' })}
              className="gw-btn gw-btn-line"
            >
              <span>{page.visionLinkLabel}</span>
            </a>
          </div>
        </div>
      </section>

      <KandidatKontakt />

      <PageEndNav current="/spansk-i-alicante" />
    </>
  )
}
