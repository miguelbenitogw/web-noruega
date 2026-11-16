import Kontakt from '../components/Kontakt'
import PageEndNav from '../components/PageEndNav'
import useContent from '../hooks/useContent'
import EditableText from '../components/editable/EditableText'

export default function KontaktPage() {
  const hero = useContent('kontaktHero')

  return (
    <>
      {/* ── Cabecera de página ───────────────────────────────────────────
          Misma banda navy que el resto de las cabeceras internas. La migaja
          va en Poppins: es navegación, no lectura. */}
      <section className="bg-navy pt-32 pb-16 lg:pt-40 lg:pb-20">
        <div className="container-xl">
          <nav className="font-ui text-[0.8125rem] text-primary-200 mb-7" aria-label="Brødsmuler">
            <a href="/" className="transition-colors hover:text-white">Hjem</a>
            <span className="mx-2 text-primary-300/70" aria-hidden="true">/</span>
            <span className="text-white">{hero.breadcrumb}</span>
          </nav>

          <EditableText
            as="h1"
            path="kontaktHero.h1"
            value={hero.h1}
            className="text-display font-semibold !text-white"
          />
          <EditableText
            as="p"
            path="kontaktHero.description"
            value={hero.description}
            multiline
            className="mt-6 gw-measure text-primary-100 text-body lg:text-[1.1875rem] leading-[1.6]"
          />
        </div>
      </section>

      <Kontakt />
      <PageEndNav current="/kontakt" />
    </>
  )
}
