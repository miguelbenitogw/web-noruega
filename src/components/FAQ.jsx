import { useState } from 'react'
import AnimateIn from './AnimateIn'

const faqs = [
  {
    q: 'Hvor lang tid tar rekrutteringsprosessen?',
    a: 'Tidslinjen avhenger av valgt opplæringsløp: fysisk (5 måneder), hybrid (7 måneder) eller fullt nettbasert (9 måneder). Intervjuer med arbeidsgiver skjer normalt 1–4 uker etter opplæring.',
  },
  {
    q: 'Hvilket språknivå har kandidatene når de ankommer Norge?',
    a: 'Kandidatene følger et strukturert løp med opptil 600 undervisningstimer i norsk, bransjespesifikk terminologi og innføring i norsk arbeidskultur. Målet settes ut fra rollekrav, ofte opp mot B2.',
  },
  {
    q: 'Hvilke sektorer dekker dere?',
    a: 'Vi rekrutterer primært til helse og omsorg, industri og bygg, samt utdanning og barneomsorg. Helsesektoren er vårt spesialfelt, der vi har levert kvalifiserte sykepleiere siden 2015.',
  },
  {
    q: 'Hva koster det å bruke Global Working?',
    a: 'Pris avhenger av behov og omfang. Vi går gjennom modell og priser i et uforpliktende kartleggingsmøte, slik at løsningen tilpasses virksomheten deres.',
  },
  {
    q: 'Hvordan sikrer dere kvaliteten på kandidatene?',
    a: 'Vi kombinerer seleksjon, språkforberedelse og tett oppfølging før oppstart. Teamet vårt inkluderer både psykologer og språklærere, og prosessene er ISO-sertifiserte.',
  },
  {
    q: 'Tilbyr dere oppfølging etter ansettelse?',
    a: 'Ja. Vi følger opp kandidaten og arbeidsgiveren gjennom prøveperioden med ekstra språktimer, støtte med dokumentasjon og jevnlige samtalepunkter for å sikre en vellykket integrering.',
  },
]

function AccordionItem({ faq, isOpen, onToggle }) {
  return (
    <div className={`border rounded-2xl transition-all duration-200 ${isOpen ? 'border-primary-200 bg-primary-50/30 shadow-sm' : 'border-gray-100 bg-white'}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left cursor-pointer"
        aria-expanded={isOpen}
      >
        <span className={`font-heading font-semibold text-sm lg:text-base transition-colors ${isOpen ? 'text-primary-700' : 'text-ink'}`}>
          {faq.q}
        </span>
        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-primary-600 rotate-180' : 'bg-gray-100'}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isOpen ? 'white' : '#64748b'} strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <p className="px-6 pb-5 text-gray-500 text-sm leading-relaxed">
          {faq.a}
        </p>
      </div>
    </div>
  )
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section className="py-24 lg:py-32 bg-white" aria-labelledby="faq-heading">
      <div className="container-xl">
        <div className="grid lg:grid-cols-5 gap-14 items-start">

          {/* Left heading */}
          <div className="lg:col-span-2 lg:sticky lg:top-28">
            <AnimateIn>
              <span className="inline-block text-primary-600 font-semibold text-sm tracking-wide uppercase mb-3">
                Spørsmål & svar
              </span>
              <h2 id="faq-heading" className="font-heading text-3xl lg:text-4xl font-bold text-ink mb-5 leading-tight">
                Ofte stilte spørsmål
              </h2>
              <p className="text-gray-600 leading-relaxed mb-8">
                Finn svar på de vanligste spørsmålene om rekruttering og samarbeid med Global Working.
              </p>
              <a
                href="/kontakt"
                className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700 transition-colors"
              >
                Fant du ikke svaret? Kontakt oss
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
            </AnimateIn>
          </div>

          {/* Right accordion */}
          <div className="lg:col-span-3 space-y-3">
            {faqs.map((faq, i) => (
              <AnimateIn key={i} variant="fadeUp" delay={i * 80}>
                <AccordionItem
                  faq={faq}
                  isOpen={openIndex === i}
                  onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
                />
              </AnimateIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
