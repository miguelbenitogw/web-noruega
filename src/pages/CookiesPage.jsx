import AnimateIn from '../components/AnimateIn'

export default function CookiesPage() {
  return (
    <>
      <section className="pt-32 pb-12 bg-gradient-to-br from-navy via-primary-900 to-primary-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(30,115,190,0.3),transparent_60%)]" aria-hidden="true" />
        <div className="container-xl relative z-10">
          <AnimateIn>
            <nav className="text-blue-200/70 text-sm mb-6" aria-label="Brødsmuler">
              <a href="/" className="hover:text-white transition-colors">Hjem</a>
              <span className="mx-2">/</span>
              <span className="text-white">Informasjonskapsler</span>
            </nav>
            <h1 className="font-heading text-3xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              Informasjonskapsler (cookies)
            </h1>
            <p className="text-blue-100 text-lg max-w-3xl leading-relaxed">
              Denne siden forklarer hvilke informasjonskapsler vi bruker, og hvordan du kan kontrollere eller trekke tilbake samtykke.
            </p>
          </AnimateIn>
        </div>
      </section>

      <section className="py-16 bg-surface">
        <div className="container-xl">
          <div className="max-w-4xl bg-white rounded-2xl border border-gray-100 shadow-sm p-8 lg:p-10 space-y-8">
            <div>
              <h2 className="font-heading text-2xl font-bold text-ink mb-3">Hva er cookies?</h2>
              <p className="text-gray-700 leading-relaxed">
                Cookies er små tekstfiler som lagres i nettleseren din for å få nettstedet til å fungere, forbedre brukeropplevelsen og måle bruk.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl font-bold text-ink mb-3">Typer cookies vi bruker</h2>
              <p className="text-gray-700 leading-relaxed">
                Vi bruker nødvendige cookies for grunnleggende funksjonalitet, samt valgfri statistikk/analytiske cookies når du samtykker.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl font-bold text-ink mb-3">Samtykke og administrasjon</h2>
              <p className="text-gray-700 leading-relaxed">
                Du kan når som helst endre cookie-valg i nettleseren din eller ved å oppdatere samtykket på nettstedet.
                Blokkering av cookies kan påvirke hvordan enkelte funksjoner virker.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl font-bold text-ink mb-3">Tredjepartscookies</h2>
              <p className="text-gray-700 leading-relaxed">
                Dersom analyseverktøy er aktivert, kan tredjepartsleverandører sette cookies i henhold til sine egne retningslinjer.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl font-bold text-ink mb-3">Kontakt</h2>
              <p className="text-gray-700 leading-relaxed">
                Har du spørsmål om vår bruk av cookies, kontakt oss på <a href="mailto:kontakt@globalworking.no" className="text-primary-600 hover:text-primary-700">kontakt@globalworking.no</a>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
