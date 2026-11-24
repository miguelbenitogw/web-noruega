import Hero from '../components/Hero'
import VideoCarousel from '../components/VideoCarousel'
import Nyheter from '../components/Nyheter'
import CTABanner from '../components/CTABanner'
import SpanskAlicanteTeaser from '../components/SpanskAlicanteTeaser'
import RuleGrid from '../components/ui/RuleGrid'
import TextLink from '../components/ui/TextLink'
import { trackEvent } from '../lib/analytics'
import useContent from '../hooks/useContent'
import { IMAGES, img, srcSet } from '../assets/images'
import { UsersThree, Heart, MagnifyingGlass, Buildings } from '@phosphor-icons/react'
import RichText from '../components/ui/RichText'
import EmailText from '../components/ui/EmailText'

const sectionIcons = [
  <UsersThree key="i0" size={24} weight="regular" aria-hidden="true" />,
  <Heart key="i1" size={24} weight="regular" aria-hidden="true" />,
  <MagnifyingGlass key="i2" size={24} weight="regular" aria-hidden="true" />,
  <Buildings key="i3" size={24} weight="regular" aria-hidden="true" />,
]

/**
 * Columna de servicio.
 *
 * Antes era una tarjeta blanca con borde, sombra y `hover:shadow-lg`, igual
 * que las otras tres. Cuatro cajas idénticas flotando es el kit por defecto.
 * Ahora son cuatro columnas separadas por filetes: son pares entre sí, y el
 * filete lo dice mejor que una sombra.
 */
function ServiceColumn({ section, index, readMoreLabel }) {

  return (
    <RuleGrid.Cell
      as="a"
      href={section.href}
      onClick={() => trackEvent('cta_click', { location: 'landing_summary', cta: section.href })}
      className="group flex flex-col h-full px-0 py-8 sm:px-7 sm:py-9
                 transition-colors duration-200 hover:bg-surface"
    >
      <span className="text-primary-600 mb-4" aria-hidden="true">
        {sectionIcons[index] ?? sectionIcons[0]}
      </span>

      <h3
        className="font-heading text-body-lg font-semibold text-navy leading-snug
                   group-hover:text-primary-600 transition-colors duration-200"
      >
        {section.title}
      </h3>

      <RichText
        value={section.description}
        className="mt-3 text-body-sm text-ink-muted leading-relaxed flex-1"
      />

      {/* Dentro de una tarjeta que ya es `group`, así que reacciona al pasar
          el ratón por la columna entera, no solo por el enlace. */}
      <TextLink as="span" className="mt-6">{readMoreLabel}</TextLink>
    </RuleGrid.Cell>
  )
}

export default function HomePage() {
  const hs = useContent('homeServices')
  const hHealth = useContent('homeHealth')
  const hContact = useContent('homeContact')
  const contacts = useContent('contacts')


  const resolveContactPhoto = (contact = {}) => {
    if (contact.imageUrl) return contact.imageUrl
    const lower = String(contact.name || '').toLowerCase()
    if (lower.includes('miriam')) return IMAGES.contactMiriam
    if (lower.includes('gro')) return IMAGES.contactGro
    return null
  }

  return (
    <>
      <Hero />

      {/* ── Qué hacemos ──────────────────────────────────────────────────
          Cabecera a dos columnas en lugar del bloque centrado. El texto
          largo centrado en serif es incómodo de leer: el ojo pierde el
          arranque de cada línea. */}
      <section className="py-20 lg:py-28 bg-white" aria-labelledby="tilbud-heading">
        <div className="container-xl">
          {/* `items-start` y no `items-end`: con `items-end` la columna de
              texto se alineaba con el PIE de la izquierda (foto + titular) y
              arrancaba ~300 px más abajo que la etiqueta, flotando sin ancla.
              Ahora las dos columnas arrancan en la misma línea: etiqueta y
              párrafo a la misma altura, y la foto va debajo del titular, que
              es donde estaba el hueco. */}
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-12 lg:mb-16">
            <div className="lg:col-span-6">
              <span className="gw-label text-primary-600">{hs.label}</span>
              <h2 id="tilbud-heading" className="mt-5 text-display-sm font-semibold text-navy">
                {hs.heading}
              </h2>
              {/* La foto es la clase de noruego: de las cuatro columnas de
                  abajo, la preparación lingüística es la que de verdad
                  distingue a la empresa, así que vale más que un retrato. */}
              <img
                src={img(IMAGES.siljePizarra, 1024)}
                srcSet={srcSet(IMAGES.siljePizarra)}
                sizes="(min-width: 1024px) 50vw, 100vw"
                alt="Norsklæreren Silje skriver norske ord på en tavle i klasserommet"
                className="mt-10 w-full h-[200px] lg:h-[300px] object-cover rounded-panel"
                style={{ objectPosition: 'center 35%' }}
                loading="lazy"
                decoding="async"
                width={2560}
                height={1704}
              />
            </div>
            {/* El editor viejo partía este texto en una frase por párrafo y
                dejaba la pregunta final suelta, como una línea más. Ahora el
                cuerpo es un solo párrafo continuo y la pregunta vive en su
                propio campo (`ctaQuestion`): se pinta como el enlace a
                /kontakt, no como texto muerto. Es un TextLink y no un
                `.gw-btn-ember` a propósito: el botón naranja de esta pantalla
                ya lo reserva «Vi støtter det norske helsevesenet» más abajo,
                y el naranja se usa una vez por pantalla.
                `lg:col-span-6` + `gw-measure`: en 5 columnas la línea quedaba en
                ~50 caracteres; con 6 y el tope de 38rem llega a ~65. */}
            <div className="lg:col-span-6 lg:col-start-7">
              <RichText
                value={hs.description}
                className="gw-measure text-body text-ink-muted leading-[1.6]"
              />
              {hs.ctaQuestion ? (
                <TextLink
                  href="/kontakt"
                  onClick={() => trackEvent('cta_click', { location: 'landing_summary', cta: '/kontakt' })}
                  className="mt-4"
                >
                  {hs.ctaQuestion}
                </TextLink>
              ) : null}
            </div>
          </div>

          <RuleGrid cols="sm2-lg4" className="border-t border-line">
            {(hs.sections || []).map((section, i) => (
              <ServiceColumn
                key={section.href}
                section={section}
                index={i}
                readMoreLabel={hs.readMoreLabel}
              />
            ))}
          </RuleGrid>
        </div>
      </section>

      <VideoCarousel />

      {/* ── Sector sanitario ─────────────────────────────────────────────
          Banda navy sin mancha radial decorativa. La imagen se va al borde
          derecho de la pantalla: corta la simetría de las dos columnas y
          hace que la sección no parezca otra fila más. */}
      <section className="bg-navy overflow-hidden" aria-labelledby="helse-heading">
        <div className="container-xl">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className="lg:col-span-5 py-20 lg:py-28">
              <span className="gw-label text-white">{hHealth.label}</span>
              <h2 id="helse-heading" className="mt-5 text-display-sm font-semibold text-white">
                {hHealth.heading}
              </h2>
              <RichText
                value={hHealth.description}
                className="mt-6 text-body text-primary-100 leading-[1.6]"
                tone="dark"
              />
              <a
                href="/helse"
                onClick={() => trackEvent('cta_click', { location: 'landing_health', cta: 'les_mer_helse' })}
                className="gw-btn gw-btn-ember mt-9"
              >
                {hHealth.cta}
              </a>
            </div>

            <div className="lg:col-span-6 lg:col-start-7 pb-16 lg:py-16 gw-bleed-r">
              <img
                src={img(hHealth.imageUrl || IMAGES.homeMetricsTeam, 1200)}
                alt={hHealth.imageAlt || 'Global Working team i samarbeid med norske arbeidsgivere'}
                className="w-full h-[300px] lg:h-[520px] object-cover object-[28%_50%] rounded-panel lg:rounded-r-none"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </section>

      <Nyheter />

      <SpanskAlicanteTeaser />

      <CTABanner />

      {/* ── Contacto directo ─────────────────────────────────────────────
          Las fotos del equipo pasan de 48 px a retrato real. Si la promesa
          es «hablás con una persona», la persona tiene que verse. */}
      <section className="py-20 lg:py-28 bg-surface" aria-labelledby="quick-contact-heading">
        <div className="container-xl">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-5">
              <span className="gw-label text-primary-600">{hContact.label}</span>
              <h2 id="quick-contact-heading" className="mt-5 text-display-sm font-semibold text-navy">
                {hContact.heading}
              </h2>
              <RichText
                value={hContact.description}
                className="mt-6 text-body text-ink-muted leading-[1.6]"
              />
              <a
                href="/kontakt"
                onClick={() => trackEvent('cta_click', { location: 'landing_quick_contact', cta: 'send_melding' })}
                className="gw-btn gw-btn-ink mt-8"
              >
                {hContact.cta}
              </a>
            </div>

            <div className="lg:col-span-6 lg:col-start-7 grid sm:grid-cols-2 gap-5">
              {(contacts || []).map((c, i) => (
                <div key={`${c.name}-${i}`} className="gw-panel bg-white border-line p-6">
                  {resolveContactPhoto(c) ? (
                    <img
                      src={img(resolveContactPhoto(c), 192)}
                      alt={c.name}
                      className="w-16 h-16 rounded-pill object-cover object-top mb-4"
                      loading="lazy"
                      width={64}
                      height={64}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-pill bg-navy flex items-center justify-center mb-4">
                      <span className="font-heading font-semibold text-white text-xl">
                        {c.name.charAt(0)}
                      </span>
                    </div>
                  )}

                  <div className="font-heading font-semibold text-navy">{c.name}</div>
                  <div className="text-ink-soft text-sm mt-0.5">{c.role}</div>

                  <div className="mt-4 pt-4 border-t border-line space-y-1">
                    <div className="block text-primary-600 text-body-sm"><EmailText email={c.email} /></div>
                    <div className="block text-ink-muted text-body-sm tabular-nums">{c.phone}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
