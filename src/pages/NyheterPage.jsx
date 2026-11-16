import Nyheter from '../components/Nyheter'
import PageEndNav from '../components/PageEndNav'
import EditableText from '../components/editable/EditableText'
import useContent from '../hooks/useContent'

/**
 * NyheterPage — la cabecera de la sección de prensa.
 *
 * Cambios: fuera el `AnimateIn` (el titular de una página no tiene por qué
 * aparecer con retardo), las migas en `font-ui` como el resto de las internas,
 * y la bajada a la medida de lectura en lugar de `max-w-2xl`.
 */
export default function NyheterPage() {
  const hero = useContent('nyheterHero')

  return (
    <>
      <section className="bg-navy pt-32 pb-16 lg:pt-40 lg:pb-20">
        <div className="container-xl">
          <nav className="font-ui text-primary-300 text-sm mb-7" aria-label="Brødsmuler">
            <a href="/" className="hover:text-white transition-colors">Hjem</a>
            <span className="mx-2 text-primary-400" aria-hidden="true">/</span>
            <span className="text-white">{hero.breadcrumb}</span>
          </nav>
          <EditableText
            as="h1"
            path="nyheterHero.h1"
            value={hero.h1}
            className="text-display font-semibold !text-white max-w-[20ch]"
          />
          <EditableText
            as="p"
            path="nyheterHero.description"
            value={hero.description}
            multiline
            className="mt-6 gw-measure text-body lg:text-[1.1875rem] text-primary-100 leading-[1.6]"
          />
        </div>
      </section>

      <Nyheter />
      <PageEndNav current="/nyheter" />
    </>
  )
}
