import Kontakt from '../components/Kontakt'
import PageEndNav from '../components/PageEndNav'
import PageHero from '../components/ui/PageHero'
import useContent from '../hooks/useContent'

export default function KontaktPage() {
  const hero = useContent('kontaktHero')

  return (
    <>
      <PageHero
        current={hero.breadcrumb}
        title={hero.h1}
        titlePath="kontaktHero.h1"
        titleId="kontakt-hero-heading"
        description={hero.description}
        descriptionPath="kontaktHero.description"
      />

      <Kontakt />
      <PageEndNav current="/kontakt" />
    </>
  )
}
