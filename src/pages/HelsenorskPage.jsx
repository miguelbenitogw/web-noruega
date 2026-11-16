import EditableText from '../components/editable/EditableText'
import EditableImage from '../components/editable/EditableImage'
import PageEndNav from '../components/PageEndNav'
import { IMAGES, img } from '../assets/images'
import { trackEvent } from '../lib/analytics'
import useContent from '../hooks/useContent'

/**
 * HelsenorskPage — las 650 horas de noruego sanitario.
 *
 * Es la página más técnica de la sección y la que menos se puede permitir el
 * adorno: lo que vende es la seriedad del programa. Antes eran seis secciones
 * idénticas de `max-w-3xl` centrado, dos fotos en cajas con sombra, un
 * eyebrow en MAYÚSCULAS y un degradado `from-primary-50 via-white to-surface`
 * debajo del contacto.
 *
 * Ahora cada bloque es un carril —titular a la izquierda, lectura a la
 * derecha— y el argumento de confianza (quién enseña) se lleva la única
 * banda oscura de la página.
 */

function BodyParagraph({ path, value, className = '', tone = 'light' }) {
  const color = tone === 'dark' ? 'text-primary-100' : 'text-ink-muted'
  return (
    <EditableText
      as="p"
      path={path}
      value={value}
      multiline
      className={`text-body lg:text-[1.125rem] ${color} leading-[1.75] ${className}`}
    />
  )
}

/* Lista de filetes, sin el circulito azul con check de siempre. */
function RuleList({ items, basePath, className = '' }) {
  return (
    <ul className={`border-t border-line ${className}`}>
      {items.map((item, index) => (
        <li key={`${basePath}-${index}`} className="border-b border-line py-3.5">
          <EditableText
            as="span"
            path={`${basePath}.${index}`}
            value={item}
            className="font-ui text-[0.9375rem] leading-snug text-ink"
          />
        </li>
      ))}
    </ul>
  )
}

export default function HelsenorskPage() {
  const page = useContent('helsenorsk')
  const contactsRaw = useContent('contacts')
  const contacts = Array.isArray(contactsRaw) ? contactsRaw : []

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-navy overflow-hidden" aria-labelledby="helsenorsk-heading">
        <div className="container-xl">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center pt-32 pb-16 lg:pt-40 lg:pb-20">

            <div className="lg:col-span-6 animate-riseIn">
              <nav className="font-ui text-primary-300 text-sm mb-7" aria-label="Brødsmuler">
                <a href="/" className="hover:text-white transition-colors">Hjem</a>
                <span className="mx-2 text-primary-400" aria-hidden="true">/</span>
                <a href="/spansk-i-alicante" className="hover:text-white transition-colors">Spansk i Alicante</a>
                <span className="mx-2 text-primary-400" aria-hidden="true">/</span>
                <EditableText
                  as="span"
                  path="helsenorsk.breadcrumb"
                  value={page.breadcrumb}
                  className="text-white"
                />
              </nav>

              <EditableText
                as="h1"
                id="helsenorsk-heading"
                path="helsenorsk.heroTitle"
                value={page.heroTitle}
                className="text-display-sm sm:text-display font-semibold !text-white break-words max-w-[18ch]"
              />
              <EditableText
                as="p"
                path="helsenorsk.heroSubtitle"
                value={page.heroSubtitle}
                multiline
                className="mt-6 gw-measure text-body lg:text-[1.1875rem] text-primary-100 leading-[1.6]"
              />
            </div>

            <div className="lg:col-span-6 animate-settle gw-bleed-r">
              <EditableImage
                path="helsenorsk.heroImageUrl"
                src={img(page.heroImageUrl || IMAGES.enfermeria, 1400)}
                alt={page.heroImageAlt || 'Helsenorsk undervisning'}
                className="w-full h-[300px] lg:h-[520px] object-cover object-center rounded-panel lg:rounded-r-none"
                loading="eager"
                width={1400}
                height={520}
              />
            </div>

          </div>
        </div>
      </section>

      {/* ── Intro ─────────────────────────────────────────────────────────── */}
      <section className="py-24 lg:py-32 bg-white" aria-labelledby="helsenorsk-intro-heading">
        <div className="container-xl">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-4">
              <EditableText
                as="h2"
                id="helsenorsk-intro-heading"
                path="helsenorsk.introTitle"
                value={page.introTitle}
                className="text-display-sm font-semibold text-navy break-words"
              />
            </div>
            <div className="lg:col-span-7 lg:col-start-6 gw-measure">
              <BodyParagraph path="helsenorsk.introP1" value={page.introP1} />
              <BodyParagraph path="helsenorsk.introP2" value={page.introP2} className="mt-6" />
              <BodyParagraph path="helsenorsk.introP3" value={page.introP3} className="mt-6" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Lengua aplicada ───────────────────────────────────────────────── */}
      <section className="py-24 lg:py-32 bg-surface" aria-labelledby="helsenorsk-praksis-heading">
        <div className="container-xl">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-4">
              <EditableText
                as="h2"
                id="helsenorsk-praksis-heading"
                path="helsenorsk.praksisTitle"
                value={page.praksisTitle}
                className="text-display-sm font-semibold text-navy break-words"
              />
            </div>
            <div className="lg:col-span-7 lg:col-start-6 gw-measure">
              <BodyParagraph path="helsenorsk.praksisP1" value={page.praksisP1} />
              <BodyParagraph path="helsenorsk.praksisP2" value={page.praksisP2} className="mt-6" />
              <BodyParagraph path="helsenorsk.praksisP3" value={page.praksisP3} className="mt-6" />
              {page.praksisListIntro && (
                <EditableText
                  as="p"
                  path="helsenorsk.praksisListIntro"
                  value={page.praksisListIntro}
                  className="mt-8 font-ui text-[0.9375rem] font-semibold text-navy"
                />
              )}
              <RuleList items={page.praksisItems || []} basePath="helsenorsk.praksisItems" className="mt-4" />
              <BodyParagraph path="helsenorsk.praksisP4" value={page.praksisP4} className="mt-8" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Situaciones reales: la foto sale por la izquierda ─────────────── */}
      <section className="bg-white overflow-hidden" aria-labelledby="helsenorsk-situasjoner-heading">
        <div className="container-xl">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">

            <div className="lg:col-span-6 order-2 lg:order-1 pb-20 lg:py-28 gw-bleed-l">
              <EditableImage
                path="helsenorsk.situasjonerImageUrl"
                src={img(page.situasjonerImageUrl || IMAGES.helseHealthTeam, 1400)}
                alt={page.situasjonerImageAlt || 'Simulering av helsesituasjoner'}
                className="w-full h-[300px] lg:h-[520px] object-cover rounded-panel lg:rounded-l-none"
                loading="lazy"
              />
            </div>

            <div className="lg:col-span-5 lg:col-start-8 order-1 lg:order-2 pt-24 lg:py-28">
              <EditableText
                as="h2"
                id="helsenorsk-situasjoner-heading"
                path="helsenorsk.situasjonerTitle"
                value={page.situasjonerTitle}
                className="text-display-sm font-semibold text-navy break-words"
              />
              <BodyParagraph path="helsenorsk.situasjonerP1" value={page.situasjonerP1} className="mt-7" />
              <BodyParagraph path="helsenorsk.situasjonerP2" value={page.situasjonerP2} className="mt-6" />
            </div>

          </div>
        </div>
      </section>

      {/* ── Quién enseña ──────────────────────────────────────────────────
          El argumento de confianza de la página: lo enseñan enfermeras
          españolas que ya trabajaron en Noruega. Se lleva la banda oscura. */}
      <section className="py-24 lg:py-32 bg-navy-deep" aria-labelledby="helsenorsk-undervisere-heading">
        <div className="container-xl">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-5">
              <EditableText
                as="h2"
                id="helsenorsk-undervisere-heading"
                path="helsenorsk.undervisereTitle"
                value={page.undervisereTitle}
                className="text-display-sm font-semibold !text-white break-words"
              />
            </div>
            <div className="lg:col-span-6 lg:col-start-7 gw-measure">
              <BodyParagraph path="helsenorsk.undervisereP1" value={page.undervisereP1} tone="dark" />
              <BodyParagraph path="helsenorsk.undervisereP2" value={page.undervisereP2} tone="dark" className="mt-6" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Base lingüística ──────────────────────────────────────────────── */}
      <section className="pt-24 lg:pt-32 bg-white" aria-labelledby="helsenorsk-grunnlag-heading">
        <div className="container-xl">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-4">
              <EditableText
                as="h2"
                id="helsenorsk-grunnlag-heading"
                path="helsenorsk.grunnlagTitle"
                value={page.grunnlagTitle}
                className="text-display-sm font-semibold text-navy break-words"
              />
            </div>
            <div className="lg:col-span-7 lg:col-start-6 gw-measure">
              <BodyParagraph path="helsenorsk.grunnlagP1" value={page.grunnlagP1} />
              <BodyParagraph path="helsenorsk.grunnlagP2" value={page.grunnlagP2} className="mt-6" />
            </div>
          </div>
        </div>

        {/* El aula, de borde a borde. Sin caja: es el cierre del argumento. */}
        <div className="mt-20 lg:mt-28">
          <EditableImage
            path="helsenorsk.grunnlagImageUrl"
            src={img(page.grunnlagImageUrl || IMAGES.claseNoruego, 1920)}
            alt={page.grunnlagImageAlt || 'Helsenorsk undervisning og opplæring'}
            className="w-full h-[280px] sm:h-[360px] lg:h-[460px] object-cover"
            loading="lazy"
          />
        </div>
      </section>

      {/* ── Contacto ──────────────────────────────────────────────────────── */}
      <section className="py-24 lg:py-32 bg-surface" aria-labelledby="helsenorsk-cta-heading">
        <div className="container-xl">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">

            <div className="lg:col-span-6">
              <span className="gw-label text-primary-600">{page.ctaLabel}</span>
              <EditableText
                as="h2"
                id="helsenorsk-cta-heading"
                path="helsenorsk.ctaTitle"
                value={page.ctaTitle}
                className="mt-5 text-display-sm font-semibold text-navy break-words"
              />
              <BodyParagraph path="helsenorsk.ctaP1" value={page.ctaP1} className="mt-7" />
              <BodyParagraph path="helsenorsk.ctaP2" value={page.ctaP2} className="mt-6" />

              <a
                href="/kontakt"
                onClick={() => trackEvent('cta_click', { location: 'helsenorsk_cta', cta: 'kontakt' })}
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
                      <div className="font-ui text-[0.9375rem] font-semibold text-navy leading-tight">{contact.name}</div>
                      {contact.role && (
                        <div className="mt-1 font-ui text-[0.8125rem] text-ink-soft">{contact.role}</div>
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

      <PageEndNav current="/spansk-i-alicante/helsenorsk" />
    </>
  )
}
