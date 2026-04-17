import AnimateIn from './AnimateIn'
import EditableText from './editable/EditableText'
import EditableImage from './editable/EditableImage'
import spanskAlicanteLogo from '../assets/alicante/spansk-i-alicante-logo.png'
import { IMAGES, img } from '../assets/images'
import { trackEvent } from '../lib/analytics'
import useContent from '../hooks/useContent'

export default function SpanskAlicanteTeaser() {
  const teaser = useContent('spanskAlicanteTeaser')
  const extra = useContent('spanskAlicanteTeaserExtra')

  return (
    <section className="py-24 lg:py-32 bg-white border-t border-gray-100" aria-labelledby="spansk-alicante-teaser-heading">
      <div className="container-xl">
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-10 lg:gap-14 items-center">
          <AnimateIn variant="fadeRight">
            <div className="mb-4">
              <img
                src={spanskAlicanteLogo}
                alt="Spansk i Alicante logo"
                className="h-11 w-auto"
                loading="lazy"
              />
            </div>
            <EditableText
              as="span"
              path="spanskAlicanteTeaser.label"
              value={teaser.label}
              className="inline-block text-primary-600 font-semibold text-sm tracking-wide uppercase mb-3"
            />
            <EditableText
              as="h2"
              path="spanskAlicanteTeaser.heading"
              value={teaser.heading}
              className="font-heading text-3xl lg:text-4xl font-bold text-ink mb-5 leading-tight max-w-3xl"
            />
            <EditableText
              as="p"
              path="spanskAlicanteTeaser.description"
              value={teaser.description}
              multiline
              className="text-gray-600 text-lg leading-relaxed max-w-2xl mb-8"
            />

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/spansk-i-alicante"
                onClick={() => trackEvent('cta_click', { location: 'landing_spansk_alicante', cta: 'utforsk_spansk_i_alicante' })}
                className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors duration-200 shadow-md cursor-pointer"
              >
                <EditableText
                  as="span"
                  path="spanskAlicanteTeaser.cta"
                  value={teaser.cta}
                  className="inline"
                />
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>

              <a
                href="/spansk-i-alicante/hvorfor"
                onClick={() => trackEvent('cta_click', { location: 'landing_spansk_alicante', cta: 'les_hvorfor' })}
                className="inline-flex items-center justify-center gap-2 px-7 py-4 border-2 border-primary-200 text-primary-600 font-semibold rounded-xl hover:bg-primary-50 transition-colors duration-200 cursor-pointer"
              >
                {extra.secondaryCtaLabel}
              </a>
            </div>
          </AnimateIn>

          <AnimateIn variant="fadeLeft" delay={150}>
            <div className="relative">
              <div className="rounded-[2rem] overflow-hidden border border-gray-100 shadow-xl bg-surface">
                <EditableImage
                  path="spanskAlicanteTeaser.imageUrl"
                  src={img(teaser.imageUrl || IMAGES.spanskAlicanteHeroSunset, 1200)}
                  alt={teaser.imageAlt || 'Solnedgang ved stranden i Alicante'}
                  className="w-full h-[320px] lg:h-[420px] object-cover"
                  loading="lazy"
                />
              </div>
              <div className="absolute -bottom-5 -left-5 bg-white rounded-2xl shadow-lg border border-gray-100 px-5 py-4 max-w-[220px]">
                <span className="block text-xs uppercase tracking-[0.18em] font-semibold text-primary-600 mb-1">
                  {extra.cardLabel}
                </span>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {extra.cardText}
                </p>
              </div>
            </div>
          </AnimateIn>
        </div>
      </div>
    </section>
  )
}
