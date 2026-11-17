import Nyheter from '../components/Nyheter'
import PageEndNav from '../components/PageEndNav'
import PageHero from '../components/ui/PageHero'
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
      <PageHero
        current={hero.breadcrumb}
        title={hero.h1}
        titleId="nyheter-hero-heading"
        titleWidth="20ch"
        description={hero.description}
      />

      <Nyheter />
      <PageEndNav current="/nyheter" />
    </>
  )
}
