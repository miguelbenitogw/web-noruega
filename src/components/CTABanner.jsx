import { IMAGES, img } from '../assets/images'
import { trackEvent } from '../lib/analytics'

export default function CTABanner() {
  return (
    <section
      className="relative py-28 overflow-hidden"
      aria-label="Kom i gang med Global Working Norge"
    >
      <div className="absolute inset-0" aria-hidden="true">
        <img
          src={img(IMAGES.peopleTeam2, 1600)}
          alt=""
          className="w-full h-full object-cover object-center"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-primary-900/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/90 to-primary-800/60" />
      </div>

      <div className="container-xl relative z-10 text-center">
        <span className="inline-block px-4 py-1.5 rounded-full bg-cta/20 border border-cta/30 text-cta text-sm font-semibold mb-6">
          Klar til å starte?
        </span>
        <h2 className="font-heading text-3xl lg:text-5xl font-bold text-white mb-6 leading-tight max-w-3xl mx-auto">
          Finn riktig kompetanse for din virksomhet i dag
        </h2>
        <p className="text-blue-200 text-lg leading-relaxed max-w-2xl mx-auto mb-10">
          Over 500 kandidater er allerede plassert i norske virksomheter gjennom vår prosess.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#kontakt"
            onClick={() => trackEvent('cta_click', { location: 'cta_banner', cta: 'kontakt_oss_na' })}
            className="px-8 py-4 bg-cta text-white font-semibold rounded-xl hover:bg-cta-600 transition-all duration-200 shadow-lg hover:-translate-y-0.5 cursor-pointer"
          >
            Kontakt oss nå
          </a>
          <a
            href="#talentportalen"
            onClick={() => trackEvent('cta_click', { location: 'cta_banner', cta: 'se_kandidater' })}
            className="px-8 py-4 bg-white/10 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-200 cursor-pointer"
          >
            Se kandidater
          </a>
        </div>
      </div>
    </section>
  )
}
