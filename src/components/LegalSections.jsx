export default function LegalSections() {
  return (
    <section className="bg-white border-t border-gray-100" aria-label="Juridisk informasjon">
      <div className="container-xl py-16 space-y-14">
        <article id="personvern" className="scroll-mt-28">
          <h2 className="font-heading text-2xl font-bold text-ink mb-4">Personvern</h2>
          <p className="text-gray-600 leading-relaxed">
            Vi behandler personopplysninger i tråd med gjeldende personvernlovgivning. Opplysninger fra
            kontaktskjema brukes kun for å besvare henvendelser og følge opp forespørsler om rekrutteringstjenester.
            Du kan når som helst kontakte oss for innsyn, retting eller sletting av data.
          </p>
        </article>

        <article id="vilkar" className="scroll-mt-28">
          <h2 className="font-heading text-2xl font-bold text-ink mb-4">Vilkår</h2>
          <p className="text-gray-600 leading-relaxed">
            Innholdet på nettsiden er informativt og kan oppdateres uten varsel. Avtaler om tjenester inngås
            skriftlig mellom partene. Global Working forbeholder seg retten til å oppdatere tjenestebeskrivelser
            og arbeidsprosesser for å sikre kvalitet og etterlevelse.
          </p>
        </article>

        <article id="cookies-policy" className="scroll-mt-28">
          <h2 className="font-heading text-2xl font-bold text-ink mb-4">Cookies</h2>
          <p className="text-gray-600 leading-relaxed">
            Vi bruker nødvendige cookies for grunnleggende funksjonalitet og valgfrie analyse-cookies for å måle
            bruk av nettsiden. Analyse aktiveres kun etter samtykke. Du kan endre samtykke ved å slette
            lagrede cookie-valg i nettleseren og laste siden på nytt.
          </p>
        </article>
      </div>
    </section>
  )
}
