import { IMAGES, img } from '../assets/images'
import { trackEvent } from '../lib/analytics'
import useContent from '../hooks/useContent'
import EditableText from './editable/EditableText'
import EditableImage from './editable/EditableImage'

/**
 * CTABanner
 *
 * Antes: foto a sangre con dos velos encima, insignia en pastilla, titular
 * centrado y dos botones centrados. Es la tarjeta de visita de una landing
 * generada, y además la foto no se veía: dos overlays la dejaban en textura.
 *
 * Ahora la foto ocupa su mitad y se ve, y el texto vive sobre navy sólido.
 * La imagen sale por el borde izquierdo de la pantalla para que el bloque no
 * parezca otra fila dentro de la retícula.
 */
export default function CTABanner() {
  const c = useContent('ctaBanner')

  return (
    <section
      className="bg-navy-deep overflow-hidden"
      aria-label="Kom i gang med Global Working Norge"
    >
      <div className="container-xl">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">

          <div className="lg:col-span-6 order-2 lg:order-1 pb-14 lg:py-16 gw-bleed-l">
            <EditableImage
              path="ctaBanner.imageUrl"
              src={img(c.imageUrl || IMAGES.peopleTeam2, 1600)}
              alt={c.imageAlt || ''}
              className="w-full h-[280px] lg:h-[460px] object-cover object-center rounded-panel lg:rounded-l-none"
              loading="lazy"
            />
          </div>

          <div className="lg:col-span-5 lg:col-start-8 order-1 lg:order-2 pt-20 lg:py-16">
            <EditableText
              as="span"
              path="ctaBanner.badge"
              value={c.badge}
              className="gw-label text-white"
            />
            <EditableText
              as="h2"
              path="ctaBanner.heading"
              value={c.heading}
              className="mt-5 text-display-sm font-semibold !text-white"
            />
            <EditableText
              as="p"
              path="ctaBanner.description"
              value={c.description}
              multiline
              className="mt-6 text-body text-primary-100 leading-[1.65]"
            />

            <div className="mt-9 flex flex-col sm:flex-row gap-3.5">
              <a
                href="/kontakt"
                onClick={() => trackEvent('cta_click', { location: 'cta_banner', cta: 'kontakt_oss_na' })}
                className="gw-btn gw-btn-ember"
              >
                <EditableText as="span" path="ctaBanner.cta1" value={c.cta1} className="inline" />
              </a>
              <a
                href="/talentportalen"
                onClick={() => trackEvent('cta_click', { location: 'cta_banner', cta: 'se_kandidater' })}
                className="gw-btn gw-btn-ghost"
              >
                <EditableText as="span" path="ctaBanner.cta2" value={c.cta2} className="inline" />
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
