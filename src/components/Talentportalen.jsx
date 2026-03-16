import { trackEvent } from '../lib/analytics'

const benefits = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
      </svg>
    ),
    title: 'Digitalt søknadssystem',
    desc: 'Søk på stillinger, last opp dokumenter og følg statusen på søknaden din – alt på ett sted.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
    ),
    title: 'Norskopplæring inkludert',
    desc: 'Tilgang til kursmoduler fra A1 til B2, med bransjespesifikt innhold og liveøkter.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    title: 'Sanntid fremgang',
    desc: 'Spor fremdriften din i språkopplæringen og rekrutteringsprosessen med live dashboard.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    title: 'Direkte kontakt',
    desc: 'Kontakt med veiledere og potensielle arbeidsgivere gjennom en trygg digital kanal.',
  },
]

export default function Talentportalen() {
  return (
    <section id="talentportalen" className="py-24 lg:py-32 bg-surface" aria-labelledby="talentportalen-heading">
      <div className="container-xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative order-2 lg:order-1">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-100 px-5 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" aria-hidden="true"/>
                  <div className="w-3 h-3 rounded-full bg-yellow-400" aria-hidden="true"/>
                  <div className="w-3 h-3 rounded-full bg-green-400" aria-hidden="true"/>
                </div>
                <div className="flex-1 bg-white rounded-md px-3 py-1.5 text-gray-400 text-xs border border-gray-200">
                  talentportalen.globalworking.no
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="font-heading font-semibold text-ink text-sm">Talentportalen</div>
                    <div className="text-gray-400 text-xs">Hei, Maria! 👋</div>
                  </div>
                  <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="font-heading text-primary-700 font-bold text-sm">M</span>
                  </div>
                </div>

                <div className="bg-primary-50 rounded-2xl p-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-ink text-xs font-semibold">Norsk fremgang – B1</span>
                    <span className="text-primary-600 text-xs font-bold">68%</span>
                  </div>
                  <div className="w-full bg-primary-100 rounded-full h-2">
                    <div className="bg-primary-600 h-2 rounded-full" style={{ width: '68%' }} aria-label="68% fullført" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Aktive søknader', value: '3', color: 'text-primary-600' },
                    { label: 'Neste økt', value: 'I morgen', color: 'text-cta' },
                    { label: 'Dokumenter', value: '7/9', color: 'text-green-600' },
                    { label: 'Meldinger', value: '2 nye', color: 'text-purple-600' },
                  ].map(c => (
                    <div key={c.label} className="bg-surface rounded-xl p-3.5 border border-gray-100">
                      <div className={`font-heading font-bold text-base ${c.color}`}>{c.value}</div>
                      <div className="text-gray-400 text-xs mt-0.5">{c.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <span className="inline-block text-primary-600 font-semibold text-sm tracking-wide uppercase mb-3">
              Talentportalen
            </span>
            <h2 id="talentportalen-heading" className="font-heading text-3xl lg:text-4xl font-bold text-ink mb-5 leading-tight">
              Din personlige portal for karriere i Norge
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-10">
              Talentportalen følger kandidater fra første norsktime til oppstart i jobb. Arbeidsgivere kan søke og matche kandidater i sanntid.
            </p>

            <ul className="space-y-5" role="list">
              {benefits.map(b => (
                <li key={b.title} className="flex gap-4">
                  <div className="shrink-0 w-11 h-11 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center">
                    {b.icon}
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-ink text-base mb-0.5">{b.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{b.desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <a
                href="https://talentportalen.globalworking.no"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('cta_click', { location: 'talentportalen', cta: 'logg_inn' })}
                className="inline-flex items-center justify-center px-7 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors duration-200 shadow-md cursor-pointer"
              >
                Logg inn på portalen
              </a>
              <a
                href="#kontakt"
                onClick={() => trackEvent('cta_click', { location: 'talentportalen', cta: 'registrer_bedrift' })}
                className="inline-flex items-center justify-center px-7 py-4 border-2 border-primary-200 text-primary-600 font-semibold rounded-xl hover:bg-primary-50 transition-colors duration-200 cursor-pointer"
              >
                Registrer din bedrift
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
