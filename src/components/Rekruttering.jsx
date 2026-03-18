import { IMAGES, img } from '../assets/images'
import AnimateIn from './AnimateIn'

const steps = [
  {
    step: '01',
    title: 'Behovsanalyse',
    description: 'Vi kartlegger behov, rollekrav og ønsket språkprofil før vi presenterer relevante kandidater.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
    ),
  },
  {
    step: '02',
    title: 'Språkopplæring',
    description: 'Kandidatene gjennomgår opplæring med opptil 600 timer norsk, bransjeterminologi og arbeidskultur.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <path d="M4 7V4h16v3M9 20h6M12 4v16"/>
      </svg>
    ),
  },
  {
    step: '03',
    title: 'Kulturintegrering',
    description: 'Vi forbereder kandidatene på norsk arbeidskultur og forventninger, slik at integrasjonen går smidig fra dag én.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    step: '04',
    title: 'Oppfølging',
    description: 'Vi følger opp kandidat og arbeidsgiver etter oppstart, med ekstra språkstøtte ved behov.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
  },
]

const sectors = ['Helsesektor', 'Industri', 'Bygg & anlegg', 'Utdanning']

export default function Rekruttering() {
  return (
    <section id="rekruttering" className="scroll-mt-28 py-24 lg:py-32 bg-white" aria-labelledby="rekruttering-heading">
      <div className="container-xl">

        {/* Top: header + image real */}
        <div className="grid lg:grid-cols-2 gap-14 items-center mb-20">
          <AnimateIn variant="fadeRight">
          <div>
            <span className="inline-block text-primary-600 font-semibold text-sm tracking-wide uppercase mb-3">
              Vår rekrutteringsmodell
            </span>
            <h2 id="rekruttering-heading" className="font-heading text-3xl lg:text-4xl font-bold text-ink mb-5 leading-tight">
              En helhetlig løsning — fra søk til integrering
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              Vi dekker hele rekrutteringsreisen: behovsanalyse, språkopplæring, kulturforberedelse og oppfølging etter oppstart. Målet er varig rekruttering, ikke kortsiktige løsninger.
            </p>
            <div className="flex flex-wrap gap-3">
              {sectors.map(s => (
                <span key={s} className="px-4 py-2 bg-primary-50 border border-primary-100 text-primary-700 rounded-full text-sm font-medium">
                  {s}
                </span>
              ))}
            </div>
          </div>
          </AnimateIn>

          {/* Imagen real de la plataforma */}
          <AnimateIn variant="fadeLeft" delay={200}>
          <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
              <img
                src={img(IMAGES.rekruttering, 900)}
                alt="Global Working rekrutteringsmodell"
                className="w-full object-cover"
                loading="lazy"
                width="640"
                height="420"
              />
            </div>
            {/* Floating badge */}
              <div className="absolute -bottom-4 -left-4 bg-primary-600 text-white rounded-2xl px-5 py-3 shadow-lg font-heading font-semibold text-sm flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <polyline points="22 4 12 14.01 9 11.01"/>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                </svg>
                Strukturert modell siden 2014
              </div>
          </div>
          </AnimateIn>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((s, i) => (
            <AnimateIn key={s.step} variant="fadeUp" delay={i * 120}>
            <div
              className="group bg-surface rounded-2xl p-7 border border-gray-100 hover:border-primary-200 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
                  {s.icon}
                </div>
                <span className="font-heading text-3xl font-bold text-gray-100 group-hover:text-primary-100 transition-colors select-none">
                  {s.step}
                </span>
              </div>
              <h3 className="font-heading text-base font-semibold text-ink mb-2">{s.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{s.description}</p>
            </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  )
}
