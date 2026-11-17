import spanskAlicanteLogo from '../assets/alicante/spansk-i-alicante-logo.webp'
import { IMAGES, img } from '../assets/images'
import { trackEvent } from '../lib/analytics'
import useContent from '../hooks/useContent'
import RichText from './ui/RichText'

/**
 * SpanskAlicanteTeaser — la otra orilla.
 *
 * Es la única sección de la web que habla de España, así que es la única que
 * puede permitirse la foto cálida a lo grande. Antes estaba metida en una
 * caja con `rounded-[2rem]` y `shadow-xl`: una puesta de sol dentro de una
 * tarjeta de SaaS. Ahora la imagen manda y sale por el borde izquierdo.
 */
export default function SpanskAlicanteTeaser() {
  const teaser = useContent('spanskAlicanteTeaser')
  const extra = useContent('spanskAlicanteTeaserExtra')

  return (
    <section
      className="bg-white overflow-hidden border-t border-line"
      aria-labelledby="spansk-alicante-teaser-heading"
    >
      <div className="container-xl">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">

          <div className="lg:col-span-6 order-2 lg:order-1 pb-16 lg:py-20 gw-bleed-l">
            <img
              src={img(teaser.imageUrl || IMAGES.spanskAlicanteHeroSunset, 1400)}
              alt={teaser.imageAlt || 'Solnedgang ved stranden i Alicante'}
              className="w-full h-[300px] lg:h-[540px] object-cover rounded-panel lg:rounded-l-none"
              loading="lazy"
              decoding="async"
            />
          </div>

          <div className="lg:col-span-5 lg:col-start-8 order-1 lg:order-2 pt-20 lg:py-20">
            <img
              src={spanskAlicanteLogo}
              alt="Spansk i Alicante"
              className="h-10 w-auto mb-6"
              loading="lazy"
            />
            <span className="gw-label text-primary-600">{teaser.label}</span>
            <h2 id="spansk-alicante-teaser-heading" className="mt-5 text-display-sm font-semibold text-navy">
              {teaser.heading}
            </h2>
            <RichText
              value={teaser.description}
              className="mt-6 text-body text-ink-muted leading-[1.65]"
            />

            <div className="mt-9 flex flex-col sm:flex-row gap-3.5">
              <a
                href="/spansk-i-alicante"
                onClick={() => trackEvent('cta_click', { location: 'landing_spansk_alicante', cta: 'utforsk_spansk_i_alicante' })}
                className="gw-btn gw-btn-ink"
              >
                <span>{teaser.cta}</span>
              </a>

              <a
                href="/spansk-i-alicante/hvorfor"
                onClick={() => trackEvent('cta_click', { location: 'landing_spansk_alicante', cta: 'les_hvorfor' })}
                className="gw-btn gw-btn-line"
              >
                {extra.secondaryCtaLabel}
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
