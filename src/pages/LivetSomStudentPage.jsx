import PageEndNav from '../components/PageEndNav'
import PageHero from '../components/ui/PageHero'
import RuleList from '../components/ui/RuleList'
import TextLink from '../components/ui/TextLink'
import { IMAGES, img } from '../assets/images'
import { trackEvent } from '../lib/analytics'
import useContent from '../hooks/useContent'
import BodyParagraph from '../components/ui/BodyParagraph'

/**
 * LivetSomStudentPage — cómo es estar en Alicante.
 *
 * Es la página más larga de la sección: cinco bloques de prosa, tres listas y
 * cuatro fotos. Antes todo iba centrado en una columna de `max-w-3xl` con las
 * fotos debajo, cada una en una caja `rounded-[2rem]` con `shadow-lg`, y un
 * `AnimateIn` por bloque.
 *
 * Ahora cada sección es un carril: el titular a la izquierda y la lectura a la
 * derecha, en serif y a medida. Las fotos no viven en tarjetas: salen por el
 * borde de la pantalla, o lo cruzan de lado a lado.
 */

/* Párrafo de lectura. Serif, medida corta, interlineado de libro. */

export default function LivetSomStudentPage() {
  const page = useContent('livetSomStudent')
  const contactsRaw = useContent('contacts')
  const contacts = Array.isArray(contactsRaw) ? contactsRaw : []

  return (
    <>
      <PageHero
        current={page.breadcrumb}
        titleId="livet-som-student-heading"
        title={page.heroTitle}
        titleWidth="18ch"
        description={page.heroSubtitle}
        media={(
          <img
            src={img(page.heroImageUrl || IMAGES.spanskAlicanteBeachPalms, 1400)}
            alt={page.heroImageAlt || 'Studentlivet i Alicante'}
            className="w-full h-[300px] lg:h-[520px] object-cover object-center rounded-panel lg:rounded-r-none"
            loading="eager"
            width={1400}
            height={520}
            decoding="sync"
          />
        )}
      />

      {/* ── Intro ─────────────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-white" aria-labelledby="livet-intro-heading">
        <div className="container-xl">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-4">
              <h2 id="livet-intro-heading" className="text-display-sm font-semibold text-navy break-words">
                {page.introTitle}
              </h2>
            </div>
            <div className="gw-stack lg:col-span-7 lg:col-start-6 gw-measure">
              <BodyParagraph value={page.introP1} />
              <BodyParagraph value={page.introP2} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Undervisningen: la foto sale por la izquierda ─────────────────── */}
      <section className="bg-surface overflow-hidden" aria-labelledby="livet-undervisning-heading">
        <div className="container-xl">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">

            <div className="lg:col-span-6 order-2 lg:order-1 pb-20 lg:py-28 gw-bleed-l">
              <img
                src={img(page.undervisningImageUrl || IMAGES.spanskAlicantePromenade, 1400)}
                alt={page.undervisningImageAlt || 'Undervisning i Alicante'}
                className="w-full h-[300px] lg:h-[520px] object-cover rounded-panel lg:rounded-l-none"
                loading="lazy"
                decoding="async"
              />
            </div>

            <div className="gw-stack lg:col-span-5 lg:col-start-8 order-1 lg:order-2 pt-24 lg:py-28">
              <h2
                id="livet-undervisning-heading"
                className="text-display-sm font-semibold text-navy break-words"
              >
                {page.undervisningTitle}
              </h2>
              <BodyParagraph value={page.undervisningP1} className="mt-7" />
              <BodyParagraph value={page.undervisningP2} />
              <TextLink
                href="/spansk-i-alicante/hvorfor"
                onClick={() => trackEvent('cta_click', { location: 'livet_undervisning', cta: 'hvorfor' })}
                className="mt-8"
              >
                Les mer om norskundervisningen
              </TextLink>
            </div>

          </div>
        </div>
      </section>

      {/* ── Norsk for helsesektoren ───────────────────────────────────────── */}
      <section className="pt-20 lg:pt-28 bg-white" aria-labelledby="livet-helse-heading">
        <div className="container-xl">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-4">
              <h2 id="livet-helse-heading" className="text-display-sm font-semibold text-navy break-words">
                {page.helseTitle}
              </h2>
            </div>
            <div className="gw-stack lg:col-span-7 lg:col-start-6 gw-measure">
              <BodyParagraph value={page.helseP1} />
              <BodyParagraph value={page.helseP2} />
              <BodyParagraph value={page.helseP3} />
              <RuleList items={page.helseItems || []} className="mt-8" />
              <BodyParagraph value={page.helseP4} className="mt-8" />
              <TextLink
                href="/spansk-i-alicante/helsenorsk"
                onClick={() => trackEvent('cta_click', { location: 'livet_helse', cta: 'helsenorsk' })}
                className="mt-8"
              >
                Les mer om helsenorskprogrammet
              </TextLink>
            </div>
          </div>
        </div>

        {/* La foto cruza la pantalla entera: no es una ilustración dentro de
            una tarjeta, es el cambio de aire entre dos bloques de lectura. */}
        <div className="mt-20 lg:mt-28">
          <img
            src={img(page.helseImageUrl || IMAGES.spanskAlicantePromenade, 1920)}
            alt={page.helseImageAlt || 'Helsenorsk undervisning'}
            className="w-full h-[280px] sm:h-[360px] lg:h-[460px] object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>
      </section>

      {/* ── Samtaleassistenter: la foto sale por la derecha ───────────────── */}
      <section className="bg-surface overflow-hidden" aria-labelledby="livet-samtale-heading">
        <div className="container-xl">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">

            <div className="gw-stack lg:col-span-5 pt-24 lg:py-28">
              <h2 id="livet-samtale-heading" className="text-display-sm font-semibold text-navy break-words">
                {page.samtaleTitle}
              </h2>
              <BodyParagraph value={page.samtaleP1} className="mt-7" />
              <BodyParagraph value={page.samtaleP2} />
              <RuleList items={page.samtaleItems || []} className="mt-8" />
              <BodyParagraph value={page.samtaleP3} className="mt-8" />
              <BodyParagraph value={page.samtaleP4} />
              <TextLink
                href="/spansk-i-alicante"
                onClick={() => trackEvent('cta_click', { location: 'livet_samtale', cta: 'spansk_alicante' })}
                className="mt-8"
              >
                Les mer om Spansk i Alicante-programmet
              </TextLink>
            </div>

            <div className="lg:col-span-6 lg:col-start-7 pb-20 lg:py-28 gw-bleed-r">
              <img
                src={img(page.samtaleImageUrl || IMAGES.spanskAlicantePromenade, 1400)}
                alt={page.samtaleImageAlt || 'Samtaleassistenter i Alicante'}
                className="w-full h-[300px] lg:h-[560px] object-cover object-[74%_50%] rounded-panel lg:rounded-r-none"
                loading="lazy"
                decoding="async"
              />
            </div>

          </div>
        </div>
      </section>

      {/* ── Fellesskap og aktiviteter ─────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-white" aria-labelledby="livet-fellesskap-heading">
        <div className="container-xl">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-4">
              <h2
                id="livet-fellesskap-heading"
                className="text-display-sm font-semibold text-navy break-words"
              >
                {page.fellesskapTitle}
              </h2>
            </div>
            <div className="gw-stack lg:col-span-7 lg:col-start-6 gw-measure">
              <BodyParagraph value={page.fellesskapP1} />
              <BodyParagraph value={page.fellesskapP2} />
              <p className="mt-8 font-ui text-body-sm font-semibold text-navy">{page.fellesskapLabel}</p>
              <RuleList items={page.fellesskapItems || []} className="mt-4" />
              <BodyParagraph value={page.fellesskapP3} className="mt-8" />
            </div>
          </div>

          <img
            src={img(page.fellesskapImageUrl || IMAGES.spanskAlicanteBeachPalms, 1600)}
            alt={page.fellesskapImageAlt || 'Fellesskap og aktiviteter i Alicante'}
            className="mt-16 lg:mt-24 w-full h-[280px] lg:h-[440px] object-cover object-[center_35%] rounded-panel"
            loading="lazy"
            decoding="async"
          />
        </div>
      </section>

      {/* ── Contacto ──────────────────────────────────────────────────────
          Antes: eyebrow en MAYÚSCULAS con tracking, todo centrado y dos
          tarjetas con sombra sobre un degradado. Ahora es un bloque alineado
          a la izquierda, con las personas en filas de filete. */}
      <section className="py-20 lg:py-28 bg-surface" aria-labelledby="livet-cta-heading">
        <div className="container-xl">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">

            <div className="gw-stack lg:col-span-6">
              <span className="gw-label text-primary-600">{page.ctaLabel}</span>
              <h2 id="livet-cta-heading" className="mt-5 text-display-sm font-semibold text-navy break-words">
                {page.ctaTitle}
              </h2>
              <BodyParagraph value={page.ctaP1} className="mt-7" />
              <BodyParagraph value={page.ctaP2} />

              <a
                href="/kontakt"
                onClick={() => trackEvent('cta_click', { location: 'livet_som_student_cta', cta: 'kontakt' })}
                className="mt-9 gw-btn gw-btn-ember"
              >
                {page.ctaButton}
              </a>
            </div>

            <div className="lg:col-span-5 lg:col-start-8">
              <div className="border-t border-line">
                {contacts.map((contact) => (
                  <div key={contact.name} className="border-b border-line py-6 flex items-start gap-4">
                    {contact.imageUrl && (
                      <img
                        src={img(contact.imageUrl, 192)}
                        alt={contact.imageAlt || contact.name}
                        className="w-12 h-12 rounded-pill object-cover shrink-0"
                        loading="lazy"
                        decoding="async"
                      />
                    )}
                    <div className="min-w-0">
                      <div className="font-ui text-body-sm font-semibold text-navy leading-tight">{contact.name}</div>
                      {contact.role && (
                        <div className="mt-1 gw-meta">{contact.role}</div>
                      )}
                      <a
                        href={`mailto:${contact.email}`}
                        className="gw-tap mt-2.5 flex font-ui text-sm text-primary-600 hover:text-primary-700 transition-colors break-words"
                      >
                        {contact.email}
                      </a>
                      <a
                        href={`tel:${contact.phone.replace(/\s/g, '')}`}
                        className="gw-tap flex font-ui text-sm text-ink-muted hover:text-primary-600 transition-colors"
                      >
                        {contact.phone}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      <PageEndNav current="/spansk-i-alicante/livet-som-student" />
    </>
  )
}
