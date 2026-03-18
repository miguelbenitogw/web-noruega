import { IMAGES, img } from '../assets/images'
import AnimateIn from './AnimateIn'

const reasons = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    title: 'Over 10 års erfaring',
    desc: 'Siden 2014 har vi utviklet en strukturert modell for internasjonal rekruttering til Norge.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: '50+ dedikerte ansatte',
    desc: 'Teamet inkluderer spesialister i seleksjon, oppfølging og yrkesrettet språkopplæring.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <path d="M4 7V4h16v3M9 20h6M12 4v16"/>
      </svg>
    ),
    title: 'Verdens største norskskole',
    desc: 'Vi underviser norsk utenfor Skandinavia i stor skala, med opptil 600 timer per kandidat.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
    title: '95% retensjonsgrad',
    desc: 'Høy retensjon kommer av tydelig forventningsavklaring og tett oppfølging i oppstarten.',
  },
]

export default function GodeGrunner() {
  return (
    <section className="py-24 lg:py-32 bg-surface" aria-labelledby="gode-grunner-heading">
      <div className="container-xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Image */}
          <AnimateIn variant="fadeRight">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src={img(IMAGES.rekruttering, 900)}
                alt="Global Working samarbeid"
                className="w-full object-cover"
                loading="lazy"
                width="640"
                height="450"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-900/30 via-transparent to-transparent" aria-hidden="true"/>
            </div>
          </AnimateIn>

          {/* Content */}
          <div>
            <AnimateIn>
              <span className="inline-block text-primary-600 font-semibold text-sm tracking-wide uppercase mb-3">
                Hvorfor oss
              </span>
              <h2 id="gode-grunner-heading" className="font-heading text-3xl lg:text-4xl font-bold text-ink mb-5 leading-tight">
                Gode grunner til å samarbeide med Global Working
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-10">
                Global Working kombinerer rekruttering, språk og oppfølging i ett løp. Det gir mer forutsigbar onboarding og tryggere ansettelser for norske arbeidsgivere.
              </p>
            </AnimateIn>

            <div className="space-y-5">
              {reasons.map((r, i) => (
                <AnimateIn key={r.title} variant="fadeUp" delay={i * 100}>
                  <div className="flex gap-4 group">
                    <div className="shrink-0 w-12 h-12 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
                      {r.icon}
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-ink text-base mb-1">{r.title}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">{r.desc}</p>
                    </div>
                  </div>
                </AnimateIn>
              ))}
            </div>

            <AnimateIn delay={500}>
              <a
                href="/om-oss"
                className="inline-flex items-center gap-2 mt-10 text-primary-600 font-semibold hover:text-primary-700 transition-colors"
              >
                Les mer om oss
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
            </AnimateIn>
          </div>
        </div>
      </div>
    </section>
  )
}
