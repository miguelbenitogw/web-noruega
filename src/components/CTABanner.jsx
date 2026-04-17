import { IMAGES, img } from '../assets/images'
import { trackEvent } from '../lib/analytics'
import useContent from '../hooks/useContent'
import EditableText from './editable/EditableText'
import EditableImage from './editable/EditableImage'

export default function CTABanner() {
  const c = useContent('ctaBanner')

  return (
    <section
      className="relative py-28 overflow-hidden"
      aria-label="Kom i gang med Global Working Norge"
    >
      <div className="absolute inset-0" aria-hidden="true">
        <EditableImage
          path="ctaBanner.imageUrl"
          src={img(c.imageUrl || IMAGES.peopleTeam2, 1600)}
          alt={c.imageAlt || ''}
          className="w-full h-full object-cover object-center"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-primary-900/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/90 to-primary-800/60" />
      </div>

      <div className="container-xl relative z-10 text-center">
        <EditableText
          as="span"
          path="ctaBanner.badge"
          value={c.badge}
          className="inline-block px-4 py-1.5 rounded-full bg-cta/20 border border-cta/30 text-cta text-sm font-semibold mb-6"
        />
        <EditableText
          as="h2"
          path="ctaBanner.heading"
          value={c.heading}
          className="font-heading text-3xl lg:text-5xl font-bold text-white mb-6 leading-tight max-w-3xl mx-auto"
        />
        <EditableText
          as="p"
          path="ctaBanner.description"
          value={c.description}
          multiline
          className="text-blue-200 text-lg leading-relaxed max-w-2xl mx-auto mb-10"
        />
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/kontakt"
            onClick={() => trackEvent('cta_click', { location: 'cta_banner', cta: 'kontakt_oss_na' })}
            className="px-8 py-4 bg-cta text-white font-semibold rounded-xl hover:bg-cta-600 transition-all duration-200 shadow-lg hover:-translate-y-0.5 cursor-pointer"
          >
            <EditableText as="span" path="ctaBanner.cta1" value={c.cta1} className="inline" />
          </a>
          <a
            href="/talentportalen"
            onClick={() => trackEvent('cta_click', { location: 'cta_banner', cta: 'se_kandidater' })}
            className="px-8 py-4 bg-white/10 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-200 cursor-pointer"
          >
            <EditableText as="span" path="ctaBanner.cta2" value={c.cta2} className="inline" />
          </a>
        </div>
      </div>
    </section>
  )
}
