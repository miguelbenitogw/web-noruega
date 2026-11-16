import EditableText from '../components/editable/EditableText'
import EditableImage from '../components/editable/EditableImage'
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
        currentPath="livetSomStudent.breadcrumb"
        titleId="livet-som-student-heading"
        title={page.heroTitle}
        titlePath="livetSomStudent.heroTitle"
        titleWidth="18ch"
        description={page.heroSubtitle}
        descriptionPath="livetSomStudent.heroSubtitle"
        media={(
          <EditableImage
            path="livetSomStudent.heroImageUrl"
            src={img(page.heroImageUrl || IMAGES.spanskAlicanteBeachPalms, 1400)}
            alt={page.heroImageAlt || 'Studentlivet i Alicante'}
            className="w-full h-[300px] lg:h-[520px] object-cover object-center rounded-panel lg:rounded-r-none"
            loading="eager"
            width={1400}
            height={520}
          />
        )}
      />

      {/* ── Intro ─────────────────────────────────────────────────────────── */}
      <section className="py-24 lg:py-32 bg-white" aria-labelledby="livet-intro-heading">
        <div className="container-xl">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-4">
              <EditableText
                as="h2"
                id="livet-intro-heading"
                path="livetSomStudent.introTitle"
                value={page.introTitle}
                className="text-display-sm font-semibold text-navy break-words"
              />
            </div>
            <div className="lg:col-span-7 lg:col-start-6 gw-measure">
              <BodyParagraph path="livetSomStudent.introP1" value={page.introP1} />
              <BodyParagraph path="livetSomStudent.introP2" value={page.introP2} className="mt-6" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Undervisningen: la foto sale por la izquierda ─────────────────── */}
      <section className="bg-surface overflow-hidden" aria-labelledby="livet-undervisning-heading">
        <div className="container-xl">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">

            <div className="lg:col-span-6 order-2 lg:order-1 pb-20 lg:py-28 gw-bleed-l">
              <EditableImage
                path="livetSomStudent.undervisningImageUrl"
                src={img(page.undervisningImageUrl || IMAGES.spanskAlicantePromenade, 1400)}
                alt={page.undervisningImageAlt || 'Undervisning i Alicante'}
                className="w-full h-[300px] lg:h-[520px] object-cover rounded-panel lg:rounded-l-none"
                loading="lazy"
              />
            </div>

            <div className="lg:col-span-5 lg:col-start-8 order-1 lg:order-2 pt-24 lg:py-28">
              <EditableText
                as="h2"
                id="livet-undervisning-heading"
                path="livetSomStudent.undervisningTitle"
                value={page.undervisningTitle}
                className="text-display-sm font-semibold text-navy break-words"
              />
              <BodyParagraph path="livetSomStudent.undervisningP1" value={page.undervisningP1} className="mt-7" />
              <BodyParagraph path="livetSomStudent.undervisningP2" value={page.undervisningP2} className="mt-6" />
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
      <section className="pt-24 lg:pt-32 bg-white" aria-labelledby="livet-helse-heading">
        <div className="container-xl">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-4">
              <EditableText
                as="h2"
                id="livet-helse-heading"
                path="livetSomStudent.helseTitle"
                value={page.helseTitle}
                className="text-display-sm font-semibold text-navy break-words"
              />
            </div>
            <div className="lg:col-span-7 lg:col-start-6 gw-measure">
              <BodyParagraph path="livetSomStudent.helseP1" value={page.helseP1} />
              <BodyParagraph path="livetSomStudent.helseP2" value={page.helseP2} className="mt-6" />
              <BodyParagraph path="livetSomStudent.helseP3" value={page.helseP3} className="mt-6" />
              <RuleList items={page.helseItems || []} basePath="livetSomStudent.helseItems" className="mt-8" />
              <BodyParagraph path="livetSomStudent.helseP4" value={page.helseP4} className="mt-8" />
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
          <EditableImage
            path="livetSomStudent.helseImageUrl"
            src={img(page.helseImageUrl || IMAGES.spanskAlicantePromenade, 1920)}
            alt={page.helseImageAlt || 'Helsenorsk undervisning'}
            className="w-full h-[280px] sm:h-[360px] lg:h-[460px] object-cover"
            loading="lazy"
          />
        </div>
      </section>

      {/* ── Samtaleassistenter: la foto sale por la derecha ───────────────── */}
      <section className="bg-surface overflow-hidden" aria-labelledby="livet-samtale-heading">
        <div className="container-xl">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">

            <div className="lg:col-span-5 pt-24 lg:py-28">
              <EditableText
                as="h2"
                id="livet-samtale-heading"
                path="livetSomStudent.samtaleTitle"
                value={page.samtaleTitle}
                className="text-display-sm font-semibold text-navy break-words"
              />
              <BodyParagraph path="livetSomStudent.samtaleP1" value={page.samtaleP1} className="mt-7" />
              <BodyParagraph path="livetSomStudent.samtaleP2" value={page.samtaleP2} className="mt-6" />
              <RuleList items={page.samtaleItems || []} basePath="livetSomStudent.samtaleItems" className="mt-8" />
              <BodyParagraph path="livetSomStudent.samtaleP3" value={page.samtaleP3} className="mt-8" />
              <BodyParagraph path="livetSomStudent.samtaleP4" value={page.samtaleP4} className="mt-6" />
              <TextLink
                href="/spansk-i-alicante"
                onClick={() => trackEvent('cta_click', { location: 'livet_samtale', cta: 'spansk_alicante' })}
                className="mt-8"
              >
                Les mer om Spansk i Alicante-programmet
              </TextLink>
            </div>

            <div className="lg:col-span-6 lg:col-start-7 pb-20 lg:py-28 gw-bleed-r">
              <EditableImage
                path="livetSomStudent.samtaleImageUrl"
                src={img(page.samtaleImageUrl || IMAGES.spanskAlicantePromenade, 1400)}
                alt={page.samtaleImageAlt || 'Samtaleassistenter i Alicante'}
                className="w-full h-[300px] lg:h-[560px] object-cover rounded-panel lg:rounded-r-none"
                loading="lazy"
              />
            </div>

          </div>
        </div>
      </section>

      {/* ── Fellesskap og aktiviteter ─────────────────────────────────────── */}
      <section className="py-24 lg:py-32 bg-white" aria-labelledby="livet-fellesskap-heading">
        <div className="container-xl">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-4">
              <EditableText
                as="h2"
                id="livet-fellesskap-heading"
                path="livetSomStudent.fellesskapTitle"
                value={page.fellesskapTitle}
                className="text-display-sm font-semibold text-navy break-words"
              />
            </div>
            <div className="lg:col-span-7 lg:col-start-6 gw-measure">
              <BodyParagraph path="livetSomStudent.fellesskapP1" value={page.fellesskapP1} />
              <BodyParagraph path="livetSomStudent.fellesskapP2" value={page.fellesskapP2} className="mt-6" />
              <EditableText
                as="p"
                path="livetSomStudent.fellesskapLabel"
                value={page.fellesskapLabel}
                className="mt-8 font-ui text-body-sm font-semibold text-navy"
              />
              <RuleList items={page.fellesskapItems || []} basePath="livetSomStudent.fellesskapItems" className="mt-4" />
              <BodyParagraph path="livetSomStudent.fellesskapP3" value={page.fellesskapP3} className="mt-8" />
            </div>
          </div>

          <EditableImage
            path="livetSomStudent.fellesskapImageUrl"
            src={img(page.fellesskapImageUrl || IMAGES.spanskAlicanteBeachPalms, 1600)}
            alt={page.fellesskapImageAlt || 'Fellesskap og aktiviteter i Alicante'}
            className="mt-16 lg:mt-24 w-full h-[280px] lg:h-[440px] object-cover rounded-panel"
            loading="lazy"
          />
        </div>
      </section>

      {/* ── Contacto ──────────────────────────────────────────────────────
          Antes: eyebrow en MAYÚSCULAS con tracking, todo centrado y dos
          tarjetas con sombra sobre un degradado. Ahora es un bloque alineado
          a la izquierda, con las personas en filas de filete. */}
      <section className="py-24 lg:py-32 bg-surface" aria-labelledby="livet-cta-heading">
        <div className="container-xl">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">

            <div className="lg:col-span-6">
              <span className="gw-label text-primary-600">{page.ctaLabel}</span>
              <EditableText
                as="h2"
                id="livet-cta-heading"
                path="livetSomStudent.ctaTitle"
                value={page.ctaTitle}
                className="mt-5 text-display-sm font-semibold text-navy break-words"
              />
              <BodyParagraph path="livetSomStudent.ctaP1" value={page.ctaP1} className="mt-7" />
              <BodyParagraph path="livetSomStudent.ctaP2" value={page.ctaP2} className="mt-6" />

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
                        src={contact.imageUrl}
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
                        className="mt-2.5 block font-ui text-sm text-primary-600 hover:text-primary-700 transition-colors break-words"
                      >
                        {contact.email}
                      </a>
                      <a
                        href={`tel:${contact.phone.replace(/\s/g, '')}`}
                        className="block font-ui text-sm text-ink-muted hover:text-primary-600 transition-colors"
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
