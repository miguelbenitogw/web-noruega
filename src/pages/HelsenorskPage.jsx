import PageEndNav from '../components/PageEndNav'
import PageHero from '../components/ui/PageHero'
import RuleList from '../components/ui/RuleList'
import { IMAGES, img, srcSet } from '../assets/images'
import { trackEvent } from '../lib/analytics'
import useContent from '../hooks/useContent'
import BodyParagraph from '../components/ui/BodyParagraph'

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


export default function HelsenorskPage() {
  const page = useContent('helsenorsk')
  const contactsRaw = useContent('contacts')
  const contacts = Array.isArray(contactsRaw) ? contactsRaw : []

  return (
    <>
      <PageHero
        trail={[{ label: 'Spansk i Alicante', href: '/spansk-i-alicante' }]}
        current={page.breadcrumb}
        titleId="helsenorsk-heading"
        title={page.heroTitle}
        titleWidth="18ch"
        description={page.heroSubtitle}
        media={(
          <img
            src={img(page.heroImageUrl || IMAGES.enfermeria, 1400)}
            alt={page.heroImageAlt || 'Helsenorsk undervisning'}
            className="w-full h-[300px] lg:h-[520px] object-cover object-center rounded-panel"
            loading="eager"
            width={1400}
            height={520}
            decoding="sync"
          />
        )}
      />

      {/* ── Intro ─────────────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-white" aria-labelledby="helsenorsk-intro-heading">
        <div className="container-xl">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-4">
              <h2
                id="helsenorsk-intro-heading"
                className="text-display-sm font-semibold text-navy break-words"
              >
                {page.introTitle}
              </h2>
            </div>
            <div className="gw-stack lg:col-span-7 lg:col-start-6 gw-measure">
              <BodyParagraph value={page.introP1} />
              <BodyParagraph value={page.introP2} />
              <BodyParagraph value={page.introP3} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Lengua aplicada ───────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-surface" aria-labelledby="helsenorsk-praksis-heading">
        <div className="container-xl">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-4">
              <h2
                id="helsenorsk-praksis-heading"
                className="text-display-sm font-semibold text-navy break-words"
              >
                {page.praksisTitle}
              </h2>
            </div>
            <div className="gw-stack lg:col-span-7 lg:col-start-6 gw-measure">
              <BodyParagraph value={page.praksisP1} />
              <BodyParagraph value={page.praksisP2} />
              <BodyParagraph value={page.praksisP3} />
              {page.praksisListIntro && (
                <p className="mt-8 font-ui text-body-sm font-semibold text-navy">{page.praksisListIntro}</p>
              )}
              <RuleList items={page.praksisItems || []} className="mt-4" />
              <BodyParagraph value={page.praksisP4} className="mt-8" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Situaciones reales: la foto sale por la izquierda ─────────────── */}
      <section className="bg-white overflow-hidden" aria-labelledby="helsenorsk-situasjoner-heading">
        <div className="container-xl">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">

            <div className="lg:col-span-6 order-2 lg:order-1 pb-20 lg:py-28">
              <img
                src={img(page.situasjonerImageUrl || IMAGES.helseHealthTeam, 1400)}
                alt={page.situasjonerImageAlt || 'Simulering av helsesituasjoner'}
                className="w-full h-[300px] lg:h-[520px] object-cover object-[28%_50%] rounded-panel"
                loading="lazy"
                decoding="async"
              />
            </div>

            <div className="gw-stack lg:col-span-5 lg:col-start-8 order-1 lg:order-2 pt-24 lg:py-28">
              <h2
                id="helsenorsk-situasjoner-heading"
                className="text-display-sm font-semibold text-navy break-words"
              >
                {page.situasjonerTitle}
              </h2>
              <BodyParagraph value={page.situasjonerP1} className="mt-7" />
              <BodyParagraph value={page.situasjonerP2} />
            </div>

          </div>
        </div>
      </section>

      {/* ── Quién enseña ──────────────────────────────────────────────────
          El argumento de confianza de la página: lo enseñan enfermeras
          españolas que ya trabajaron en Noruega. Se lleva la banda oscura. */}
      <section className="py-20 lg:py-28 bg-navy-deep" aria-labelledby="helsenorsk-undervisere-heading">
        <div className="container-xl">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-5">
              <h2
                id="helsenorsk-undervisere-heading"
                className="text-display-sm font-semibold !text-white break-words"
              >
                {page.undervisereTitle}
              </h2>
            </div>
            <div className="gw-stack lg:col-span-6 lg:col-start-7 gw-measure">
              <BodyParagraph value={page.undervisereP1} tone="dark" />
              <BodyParagraph value={page.undervisereP2} tone="dark" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Base lingüística ──────────────────────────────────────────────── */}
      <section className="pt-20 lg:pt-28 bg-white" aria-labelledby="helsenorsk-grunnlag-heading">
        <div className="container-xl">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-4">
              <h2
                id="helsenorsk-grunnlag-heading"
                className="text-display-sm font-semibold text-navy break-words"
              >
                {page.grunnlagTitle}
              </h2>
            </div>
            <div className="gw-stack lg:col-span-7 lg:col-start-6 gw-measure">
              <BodyParagraph value={page.grunnlagP1} />
              <BodyParagraph value={page.grunnlagP2} />
            </div>
          </div>
        </div>

        {/* El aula, de borde a borde. Sin caja: es el cierre del argumento. */}
        {/* Dentro del ancho máximo, como todas las fotos desde el 25/11/2026: a
            pantalla completa quedaba descompensada frente al texto en monitores anchos. */}
        <div className="container-xl mt-20 lg:mt-28">
          <img
            src={img(page.grunnlagImageUrl || IMAGES.helsenorskClase, 1920)}
            srcSet={srcSet(page.grunnlagImageUrl || IMAGES.helsenorskClase)}
            sizes="(min-width: 1280px) 1216px, 100vw"
            width={2560}
            height={1704}
            style={{ objectPosition: 'center 42%' }}
            alt={page.grunnlagImageAlt || 'Helsenorsk undervisning og opplæring'}
            className="w-full h-[280px] sm:h-[360px] lg:h-[460px] object-cover rounded-panel"
            loading="lazy"
            decoding="async"
          />
        </div>
      </section>

      {/* ── Contacto ──────────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-surface" aria-labelledby="helsenorsk-cta-heading">
        <div className="container-xl">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">

            <div className="gw-stack lg:col-span-6">
              <span className="gw-label text-primary-600">{page.ctaLabel}</span>
              <h2
                id="helsenorsk-cta-heading"
                className="mt-5 text-display-sm font-semibold text-navy break-words"
              >
                {page.ctaTitle}
              </h2>
              <BodyParagraph value={page.ctaP1} className="mt-7" />
              <BodyParagraph value={page.ctaP2} />

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

      <PageEndNav current="/spansk-i-alicante/helsenorsk" />
    </>
  )
}
