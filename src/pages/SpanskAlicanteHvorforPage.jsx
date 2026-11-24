import PageEndNav from '../components/PageEndNav'
import PageHero from '../components/ui/PageHero'
import RuleList from '../components/ui/RuleList'
import { IMAGES, img } from '../assets/images'
import { trackEvent } from '../lib/analytics'
import useContent from '../hooks/useContent'
import RichText from '../components/ui/RichText'
import MarkdownText from '../components/ui/MarkdownText'

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
      <PageHero
        trail={[{ label: 'Spansk i Alicante', href: '/spansk-i-alicante' }]}
        current={vision.breadcrumb}
        titleId="spansk-alicante-hvorfor-heading"
        title={vision.title}
        titleWidth="20ch"
        description={vision.intro}
        media={(
          <img
            src={img(vision.imageUrl || IMAGES.spanskAlicanteCastleArch, 1400)}
            alt={vision.imageAlt || 'Historisk arkitektur og stemning i Alicante'}
            className="w-full h-[300px] lg:h-[520px] object-cover object-center rounded-panel lg:rounded-r-none"
            loading="eager"
            width={1400}
            height={520}
            decoding="sync"
          />
        )}
      />

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
                  <h2 className="text-display-sm font-semibold text-navy break-words">{section.heading}</h2>
                  <MarkdownText
                    value={section.body}
                    className="mt-7 gw-measure text-body lg:text-[1.125rem] text-ink leading-[1.6]"
                  />
                </div>
              ))}
            </div>

            <aside className="lg:col-span-4 lg:col-start-9 lg:sticky lg:top-28">
              <div className="bg-frost rounded-panel p-7 lg:p-8">
                <h2 className="font-heading text-xl font-semibold text-navy">{hvorfor.sidebarHeading}</h2>

                {highlights.length > 0 && (
                  <RuleList
                    items={highlights}
                    tone="panel"
                    className="mt-6"
                  />
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
                    <span>{page.ctaSecondary}</span>
                  </a>
                </div>
              </div>

              {vision.sidebarImageUrl && (
                <img
                  src={img(vision.sidebarImageUrl, 932)}
                  alt={vision.sidebarImageAlt || 'Gruppe i Alicante'}
                  className="mt-4 w-full h-[260px] object-cover rounded-panel"
                  loading="lazy"
                  decoding="async"
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
