import EditableText from '../components/editable/EditableText'
import EditableImage from '../components/editable/EditableImage'
import PageEndNav from '../components/PageEndNav'
import { IMAGES, img } from '../assets/images'
import { trackEvent } from '../lib/analytics'
import useContent from '../hooks/useContent'

/**
 * SpanskAlicanteHvorforPage — el porqué del centro de Alicante.
 *
 * Es la página más argumentativa de la sección: dos bloques de prosa y una
 * columna de apoyo. Antes la prosa iba en `text-lg` con `AnimateIn` por
 * sección y el apoyo era un panel con `rounded-[2rem]`, botones azules
 * cuadrados y la foto dentro de otra caja con sombra.
 *
 * Ahora el texto se lee: serif, a medida y separado por filetes. El apoyo es
 * una superficie plana (`frost`), y la única nota naranja de la pantalla está
 * en la acción que de verdad convierte.
 */
export default function SpanskAlicanteHvorforPage() {
  const vision = useContent('spanskAlicanteVision')
  const page = useContent('spanskAlicantePage')
  const hvorfor = useContent('spanskAlicanteHvorfor')
  const highlights = vision.highlights || []

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-navy overflow-hidden" aria-labelledby="spansk-alicante-hvorfor-heading">
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
                  path="spanskAlicanteVision.breadcrumb"
                  value={vision.breadcrumb}
                  className="text-white"
                />
              </nav>

              <EditableText
                as="h1"
                id="spansk-alicante-hvorfor-heading"
                path="spanskAlicanteVision.title"
                value={vision.title}
                className="text-display-sm sm:text-display font-semibold !text-white break-words max-w-[20ch]"
              />
              <EditableText
                as="p"
                path="spanskAlicanteVision.intro"
                value={vision.intro}
                multiline
                className="mt-6 gw-measure text-body lg:text-[1.1875rem] text-primary-100 leading-[1.6]"
              />
            </div>

            <div className="lg:col-span-6 animate-settle gw-bleed-r">
              <EditableImage
                path="spanskAlicanteVision.imageUrl"
                src={img(vision.imageUrl || IMAGES.spanskAlicanteCastleArch, 1400)}
                alt={vision.imageAlt || 'Historisk arkitektur og stemning i Alicante'}
                className="w-full h-[300px] lg:h-[520px] object-cover object-center rounded-panel lg:rounded-r-none"
                loading="eager"
                width={1400}
                height={520}
              />
            </div>

          </div>
        </div>
      </section>

      {/* ── El argumento ──────────────────────────────────────────────────
          Prosa a la izquierda, apoyo pegajoso a la derecha. Los filetes
          marcan dónde empieza cada idea; no hace falta una tarjeta. */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="container-xl">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">

            <div className="lg:col-span-7">
              {(vision.sections || []).map((section, index) => (
                <div
                  key={`vision-section-${index}`}
                  className="border-t border-line pt-10 lg:pt-12 mt-10 lg:mt-12 first:mt-0"
                >
                  <EditableText
                    as="h2"
                    path={`spanskAlicanteVision.sections.${index}.heading`}
                    value={section.heading}
                    className="text-display-sm font-semibold text-navy break-words"
                  />
                  <EditableText
                    as="div"
                    path={`spanskAlicanteVision.sections.${index}.body`}
                    value={section.body}
                    multiline
                    richText
                    className="mt-7 gw-measure text-body lg:text-[1.125rem] text-ink leading-[1.75] [&>p]:mb-6 [&>p:last-child]:mb-0 [&>p]:leading-[1.75]"
                  />
                </div>
              ))}
            </div>

            <aside className="lg:col-span-4 lg:col-start-9 lg:sticky lg:top-28">
              <div className="bg-frost rounded-panel p-7 lg:p-8">
                <h2 className="font-heading text-xl font-semibold text-navy">{hvorfor.sidebarHeading}</h2>

                {highlights.length > 0 && (
                  <ul className="mt-6 border-t border-primary-200/70">
                    {highlights.map((item, index) => (
                      <li key={`highlight-${index}`} className="border-b border-primary-200/70 py-3.5">
                        <EditableText
                          as="span"
                          path={`spanskAlicanteVision.highlights.${index}`}
                          value={item}
                          className="font-ui text-[0.9375rem] leading-snug text-ink"
                        />
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-8 flex flex-col gap-3">
                  <a
                    href="/spansk-i-alicante"
                    onClick={() => trackEvent('cta_click', { location: 'spansk_alicante_hvorfor', cta: 'tilbake_til_programmet' })}
                    className="gw-btn gw-btn-ink"
                  >
                    {hvorfor.backLabel}
                  </a>
                  <a
                    href="/kontakt"
                    onClick={() => trackEvent('cta_click', { location: 'spansk_alicante_hvorfor', cta: 'kontakt' })}
                    className="gw-btn gw-btn-ember"
                  >
                    <EditableText as="span" path="spanskAlicantePage.ctaSecondary" value={page.ctaSecondary} className="inline" />
                  </a>
                </div>
              </div>

              {vision.sidebarImageUrl && (
                <EditableImage
                  path="spanskAlicanteVision.sidebarImageUrl"
                  src={vision.sidebarImageUrl}
                  alt={vision.sidebarImageAlt || 'Gruppe i Alicante'}
                  className="mt-4 w-full h-[260px] object-cover rounded-panel"
                  loading="lazy"
                />
              )}
            </aside>

          </div>
        </div>
      </section>

      <PageEndNav current="/spansk-i-alicante/hvorfor" />
    </>
  )
}
