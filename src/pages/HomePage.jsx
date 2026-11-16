import Hero from '../components/Hero'
import VideoCarousel from '../components/VideoCarousel'
import Nyheter from '../components/Nyheter'
import CTABanner from '../components/CTABanner'
import SpanskAlicanteTeaser from '../components/SpanskAlicanteTeaser'
import EditableText from '../components/editable/EditableText'
import EditableImage from '../components/editable/EditableImage'
import InlineRichText from '../components/editable/InlineRichText'
import { trackEvent } from '../lib/analytics'
import useContent from '../hooks/useContent'
import { IMAGES, img } from '../assets/images'
import { UsersThree, Heart, MagnifyingGlass, Buildings } from '@phosphor-icons/react'

const sectionIcons = [
  <UsersThree key="i0" size={24} weight="regular" aria-hidden="true" />,
  <Heart key="i1" size={24} weight="regular" aria-hidden="true" />,
  <MagnifyingGlass key="i2" size={24} weight="regular" aria-hidden="true" />,
  <Buildings key="i3" size={24} weight="regular" aria-hidden="true" />,
]

function InlineEditableParagraph({
  path,
  value,
  className,
  linkClassName,
  as = 'p',
  ...rest
}) {
  return (
    <InlineRichText
      as={as}
      value={value}
      className={className}
      linkClassName={linkClassName}
      data-content-path={path}
      {...rest}
    />
  )
}

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
    <a
      href={section.href}
      onClick={() => trackEvent('cta_click', { location: 'landing_summary', cta: section.href })}
      className="group flex flex-col h-full px-0 py-8 sm:px-7 sm:py-9 border-line
                 [&:nth-child(even)]:sm:border-l [&:nth-child(n+3)]:sm:border-t
                 lg:[&:nth-child(n+2)]:border-l lg:[&:nth-child(n+3)]:border-t-0
                 [&:nth-child(n+2)]:border-t sm:[&:nth-child(2)]:border-t-0
                 transition-colors duration-200 hover:bg-surface"
    >
      <span className="text-primary-600 mb-4" aria-hidden="true">
        {sectionIcons[index] ?? sectionIcons[0]}
      </span>

      <EditableText
        as="h3"
        path={`homeServices.sections.${index}.title`}
        value={section.title}
        className="font-heading text-[1.1875rem] font-semibold text-navy leading-snug
                   group-hover:text-primary-600 transition-colors duration-200"
      />

      <EditableText
        as="p"
        path={`homeServices.sections.${index}.description`}
        value={section.description}
        multiline
        className="mt-3 text-[0.9375rem] text-ink-muted leading-relaxed flex-1"
      />

      <span className="mt-6 inline-flex items-center gap-2 font-ui text-sm font-semibold text-primary-600">
        {readMoreLabel}
        <svg
          width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"
          className="transition-transform duration-200 group-hover:translate-x-1"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </span>
    </a>
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
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-end mb-12 lg:mb-16">
            <div className="lg:col-span-6">
              <EditableText
                as="span"
                path="homeServices.label"
                value={hs.label}
                className="gw-label text-primary-600"
              />
              <EditableText
                as="h2"
                id="tilbud-heading"
                path="homeServices.heading"
                value={hs.heading}
                className="mt-5 text-display-sm font-semibold text-navy"
              />
            </div>
            <div className="lg:col-span-5 lg:col-start-8">
              <InlineEditableParagraph
                as="p"
                path="homeServices.description"
                value={hs.description}
                className="!text-ink-muted text-body leading-[1.65]"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 border-t border-line">
            {(hs.sections || []).map((section, i) => (
              <ServiceColumn
                key={section.href}
                section={section}
                index={i}
                readMoreLabel={hs.readMoreLabel}
              />
            ))}
          </div>
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
              <EditableText
                as="span"
                path="homeHealth.label"
                value={hHealth.label}
                className="gw-label text-white"
              />
              <EditableText
                as="h2"
                id="helse-heading"
                path="homeHealth.heading"
                value={hHealth.heading}
                className="mt-5 text-display-sm font-semibold !text-white"
              />
              <InlineEditableParagraph
                as="p"
                path="homeHealth.description"
                value={hHealth.description}
                className="mt-6 !text-primary-100 text-body leading-[1.65]"
                linkClassName="!text-white underline decoration-primary-400 underline-offset-4 transition-colors hover:!decoration-white"
              />
              <a
                href="/helse"
                onClick={() => trackEvent('cta_click', { location: 'landing_health', cta: 'les_mer_helse' })}
                className="gw-btn gw-btn-ember mt-9"
              >
                <EditableText as="span" path="homeHealth.cta" value={hHealth.cta} className="inline" />
              </a>
            </div>

            <div className="lg:col-span-6 lg:col-start-7 pb-16 lg:py-16 gw-bleed-r">
              <EditableImage
                path="homeHealth.imageUrl"
                src={img(hHealth.imageUrl || IMAGES.homeMetricsTeam, 1200)}
                alt={hHealth.imageAlt || 'Global Working team i samarbeid med norske arbeidsgivere'}
                className="w-full h-[300px] lg:h-[520px] object-cover rounded-panel lg:rounded-r-none"
                loading="lazy"
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
              <EditableText
                as="span"
                path="homeContact.label"
                value={hContact.label}
                className="gw-label text-primary-600"
              />
              <EditableText
                as="h2"
                id="quick-contact-heading"
                path="homeContact.heading"
                value={hContact.heading}
                className="mt-5 text-display-sm font-semibold text-navy"
              />
              <InlineEditableParagraph
                as="p"
                path="homeContact.description"
                value={hContact.description}
                className="mt-6 !text-ink-muted text-body leading-[1.65]"
              />
              <a
                href="/kontakt"
                onClick={() => trackEvent('cta_click', { location: 'landing_quick_contact', cta: 'send_melding' })}
                className="gw-btn gw-btn-ink mt-8"
              >
                <EditableText as="span" path="homeContact.cta" value={hContact.cta} className="inline" />
              </a>
            </div>

            <div className="lg:col-span-6 lg:col-start-7 grid sm:grid-cols-2 gap-5">
              {(contacts || []).map((c, i) => (
                <div key={`${c.name}-${i}`} className="gw-panel bg-white border-line p-6">
                  {resolveContactPhoto(c) ? (
                    <img
                      src={resolveContactPhoto(c)}
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

                  <EditableText
                    as="div"
                    path={`contacts.${i}.name`}
                    value={c.name}
                    className="font-heading font-semibold text-navy"
                  />
                  <EditableText
                    as="div"
                    path={`contacts.${i}.role`}
                    value={c.role}
                    className="text-ink-soft text-sm mt-0.5"
                  />

                  <div className="mt-4 pt-4 border-t border-line space-y-1">
                    <EditableText
                      as="div"
                      path={`contacts.${i}.email`}
                      value={c.email}
                      className="block text-primary-600 text-[0.9375rem]"
                    />
                    <EditableText
                      as="div"
                      path={`contacts.${i}.phone`}
                      value={c.phone}
                      className="block text-ink-muted text-[0.9375rem] tabular-nums"
                    />
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
