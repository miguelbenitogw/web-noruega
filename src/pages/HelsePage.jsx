import AnimateIn from '../components/AnimateIn'
import Helsesektor from '../components/Helsesektor'
import GodeGrunner from '../components/GodeGrunner'
import Nyheter from '../components/Nyheter'
import CTABanner from '../components/CTABanner'
import Kontakt from '../components/Kontakt'
import LegalSections from '../components/LegalSections'
import { trackEvent } from '../lib/analytics'

const phases = [
  {
    number: '01',
    title: 'Språk og faglig forberedelse',
    description:
      'Kandidatene gjennomfører opptil 600 undervisningstimer i norsk, helseterminologi og praktisk språkbruk i kliniske situasjoner.',
    formats: [
      { label: 'Fysisk i Alicante', duration: '5 måneder' },
      { label: 'Kombinasjon fysisk og nett', duration: '7 måneder' },
      { label: 'Full nettbasert opplæring', duration: '9 måneder' },
    ],
  },
  {
    number: '02',
    title: 'Strukturert overgang',
    description:
      '1–4 uker etter avsluttet opplæring gjennomføres intervju med arbeidsgivere. Vi koordinerer oppstart og avreisedato med begge parter.',
    formats: null,
  },
  {
    number: '03',
    title: 'Ekstra oppfølging',
    description:
      'Ved behov tilrettelegger vi individuell språktrening før og etter avreise. Vi kjører 17–20 opplæringsgrupper årlig for å sikre kontinuitet.',
    formats: null,
  },
]

export default function HelsePage() {
  return (
    <>
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-br from-navy via-primary-900 to-primary-800 pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(30,115,190,0.3),transparent_60%)]" aria-hidden="true" />
        <div className="container-xl relative z-10">
          <AnimateIn>
            <nav className="text-blue-200/70 text-sm mb-6" aria-label="Brødsmuler">
              <a href="/" className="hover:text-white transition-colors">Hjem</a>
              <span className="mx-2">/</span>
              <span className="text-white">Helsesektor</span>
            </nav>
            <h1 className="font-heading text-3xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              Tjenester for helseinstitusjoner
            </h1>
            <p className="text-blue-100 text-lg max-w-2xl leading-relaxed">
              Vi forbereder helsepersonell for den norske helsesektoren – fra språkopplæring til trygg oppstart i jobb.
            </p>
          </AnimateIn>
        </div>
      </section>

      <Helsesektor />

      {/* 3-Phase Recruitment Process - NEW */}
      <section className="py-24 lg:py-32 bg-white" aria-labelledby="faser-heading">
        <div className="container-xl">
          <AnimateIn>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="inline-block text-primary-600 font-semibold text-sm tracking-wide uppercase mb-3">
                Rekrutteringsprosessen
              </span>
              <h2 id="faser-heading" className="font-heading text-3xl lg:text-4xl font-bold text-ink mb-5 leading-tight">
                Slik rekrutterer vi sykepleiere til Norge
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                Vår prosess er delt inn i tre faser for å sikre at kandidatene er godt forberedt før de starter i jobb.
              </p>
            </div>
          </AnimateIn>

          <div className="space-y-8 max-w-4xl mx-auto">
            {phases.map((phase, i) => (
              <AnimateIn key={phase.number} variant="fadeUp" delay={i * 120}>
                <div className="relative pl-16 lg:pl-20">
                  {/* Timeline connector */}
                  {i < phases.length - 1 && (
                    <div className="absolute left-[1.65rem] lg:left-[1.9rem] top-14 bottom-0 w-0.5 bg-primary-100" aria-hidden="true" />
                  )}
                  {/* Phase number */}
                  <div className="absolute left-0 top-0 w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-primary-600 text-white flex items-center justify-center font-heading text-xl font-bold shadow-lg shadow-primary-200">
                    {phase.number}
                  </div>

                  <div className="bg-surface rounded-2xl border border-gray-100 p-7 lg:p-8">
                    <h3 className="font-heading text-xl font-bold text-ink mb-3">
                      Fase {phase.number}: {phase.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      {phase.description}
                    </p>

                    {phase.formats && (
                      <div className="grid sm:grid-cols-3 gap-3 mt-5">
                        {phase.formats.map((f) => (
                          <div key={f.label} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                            <div className="font-heading font-bold text-primary-700 text-sm mb-1">{f.duration}</div>
                            <div className="text-gray-500 text-xs">{f.label}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Model - NEW */}
      <section className="py-24 lg:py-32 bg-surface">
        <div className="container-xl">
          <div className="max-w-3xl mx-auto text-center">
            <AnimateIn>
              <span className="inline-block text-primary-600 font-semibold text-sm tracking-wide uppercase mb-3">
                Samarbeidsmodell
              </span>
              <h2 className="font-heading text-3xl lg:text-4xl font-bold text-ink mb-6 leading-tight">
                Slik samarbeider vi med dere
              </h2>
              <div className="space-y-4 text-gray-600 text-lg leading-relaxed mb-10">
                <p>
                  Global Working er ikke et bemanningsbyrå. Vi forbereder kandidatene gjennom strukturert opplæring. Deretter ansetter dere kandidaten direkte – uten mellomledd.
                </p>
                <p>
                  Gjennom vår nye kandidatportal kan arbeidsgivere selv se tilgjengelige kandidater og invitere til intervju.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/kontakt"
                  onClick={() => trackEvent('cta_click', { location: 'helse_partnership', cta: 'kontakt_oss' })}
                  className="inline-flex items-center justify-center px-7 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors duration-200 shadow-md cursor-pointer"
                >
                  Kontakt oss
                </a>
                <a
                  href="/talentportalen"
                  onClick={() => trackEvent('cta_click', { location: 'helse_partnership', cta: 'se_portalen' })}
                  className="inline-flex items-center justify-center px-7 py-4 border-2 border-primary-200 text-primary-600 font-semibold rounded-xl hover:bg-primary-50 transition-colors duration-200 cursor-pointer"
                >
                  Se kandidatportalen
                </a>
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>

      <GodeGrunner />
      <Nyheter />
      <CTABanner />
      <Kontakt />
      <LegalSections />
    </>
  )
}
