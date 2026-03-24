import AnimateIn from '../components/AnimateIn'

export default function PersonvernPage() {
  return (
    <>
      <section className="pt-32 pb-12 bg-gradient-to-br from-navy via-primary-900 to-primary-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(30,115,190,0.3),transparent_60%)]" aria-hidden="true" />
        <div className="container-xl relative z-10">
          <AnimateIn>
            <nav className="text-blue-200/70 text-sm mb-6" aria-label="Brødsmuler">
              <a href="/" className="hover:text-white transition-colors">Hjem</a>
              <span className="mx-2">/</span>
              <span className="text-white">Personvern</span>
            </nav>
            <h1 className="font-heading text-3xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              Personvernerklæring
            </h1>
            <p className="text-blue-100 text-lg max-w-3xl leading-relaxed">
              Denne siden forklarer hvilke personopplysninger vi behandler, hvorfor vi gjør det og hvilke rettigheter du har.
            </p>
          </AnimateIn>
        </div>
      </section>

      <section className="py-16 bg-surface">
        <div className="container-xl">
          <div className="max-w-4xl bg-white rounded-2xl border border-gray-100 shadow-sm p-8 lg:p-10 space-y-8">
            <div>
              <h2 className="font-heading text-2xl font-bold text-ink mb-3">Hvem er behandlingsansvarlig?</h2>
              <p className="text-gray-700 leading-relaxed">
                Global Working Norge AS er behandlingsansvarlig for personopplysninger som samles inn via dette nettstedet.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl font-bold text-ink mb-3">Hvilke opplysninger vi behandler</h2>
              <p className="text-gray-700 leading-relaxed">
                Vi kan behandle kontaktinformasjon, henvendelser sendt via skjema, og tekniske data som IP-adresse, nettleser og bruksmønster.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl font-bold text-ink mb-3">Formål og rettslig grunnlag</h2>
              <p className="text-gray-700 leading-relaxed">
                Opplysninger behandles for å besvare henvendelser, levere tjenester, forbedre nettstedet og oppfylle lovpålagte krav.
                Behandlingen skjer på grunnlag av samtykke, avtale eller berettiget interesse, avhengig av formålet.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl font-bold text-ink mb-3">Lagring og deling</h2>
              <p className="text-gray-700 leading-relaxed">
                Personopplysninger lagres ikke lenger enn nødvendig. Vi kan dele data med databehandlere som leverer drift,
                analyse eller kommunikasjonstjenester, alltid under databehandleravtale.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl font-bold text-ink mb-3">Dine rettigheter</h2>
              <p className="text-gray-700 leading-relaxed">
                Du kan be om innsyn, retting, sletting, begrensning eller dataportabilitet, og protestere på behandling der det er relevant.
                Kontakt oss på <a href="mailto:kontakt@globalworking.no" className="text-primary-600 hover:text-primary-700">kontakt@globalworking.no</a>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
