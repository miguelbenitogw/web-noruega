import AnimateIn from '../components/AnimateIn'

export default function VilkarPage() {
  return (
    <>
      <section className="pt-32 pb-12 bg-gradient-to-br from-navy via-primary-900 to-primary-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(30,115,190,0.3),transparent_60%)]" aria-hidden="true" />
        <div className="container-xl relative z-10">
          <AnimateIn>
            <nav className="text-blue-200/70 text-sm mb-6" aria-label="Brødsmuler">
              <a href="/" className="hover:text-white transition-colors">Hjem</a>
              <span className="mx-2">/</span>
              <span className="text-white">Vilkår</span>
            </nav>
            <h1 className="font-heading text-3xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              Vilkår for bruk
            </h1>
            <p className="text-blue-100 text-lg max-w-3xl leading-relaxed">
              Disse vilkårene regulerer bruk av nettstedet og relaterte tjenester fra Global Working Norge.
            </p>
          </AnimateIn>
        </div>
      </section>

      <section className="py-16 bg-surface">
        <div className="container-xl">
          <div className="max-w-4xl bg-white rounded-2xl border border-gray-100 shadow-sm p-8 lg:p-10 space-y-8">
            <div>
              <h2 className="font-heading text-2xl font-bold text-ink mb-3">Generelt</h2>
              <p className="text-gray-700 leading-relaxed">
                Ved å bruke dette nettstedet aksepterer du disse vilkårene. Dersom du ikke aksepterer vilkårene, ber vi deg avstå fra bruk.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl font-bold text-ink mb-3">Innhold og immaterielle rettigheter</h2>
              <p className="text-gray-700 leading-relaxed">
                Alt innhold på nettstedet tilhører Global Working Norge eller våre lisensgivere, med mindre annet er oppgitt.
                Innhold kan ikke kopieres, distribueres eller brukes kommersielt uten skriftlig samtykke.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl font-bold text-ink mb-3">Ansvarsbegrensning</h2>
              <p className="text-gray-700 leading-relaxed">
                Vi tilstreber korrekt og oppdatert informasjon, men kan ikke garantere at alt innhold alltid er feilfritt.
                Bruk av nettstedet skjer på eget ansvar.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl font-bold text-ink mb-3">Lenker til tredjepart</h2>
              <p className="text-gray-700 leading-relaxed">
                Nettstedet kan inneholde lenker til eksterne nettsteder. Vi er ikke ansvarlige for innhold eller praksis på slike nettsteder.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl font-bold text-ink mb-3">Endringer i vilkår</h2>
              <p className="text-gray-700 leading-relaxed">
                Vi kan oppdatere vilkårene ved behov. Oppdatert versjon publiseres på denne siden med virkning fra publiseringsdato.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
