import Nyheter from '../components/Nyheter'
import CTABanner from '../components/CTABanner'
import Kontakt from '../components/Kontakt'
import LegalSections from '../components/LegalSections'
import AnimateIn from '../components/AnimateIn'

export default function NyheterPage() {
  return (
    <>
      <section className="pt-32 pb-12 bg-gradient-to-br from-navy via-primary-900 to-primary-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(30,115,190,0.3),transparent_60%)]" aria-hidden="true" />
        <div className="container-xl relative z-10">
          <AnimateIn>
            <nav className="text-blue-200/70 text-sm mb-6" aria-label="Brødsmuler">
              <a href="/" className="hover:text-white transition-colors">Hjem</a>
              <span className="mx-2">/</span>
              <span className="text-white">Nyheter</span>
            </nav>
            <h1 className="font-heading text-3xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              Nyheter & Artikler
            </h1>
            <p className="text-blue-100 text-lg max-w-2xl leading-relaxed">
              Følg med på siste nytt fra Global Working – artikler, oppdateringer og historier fra vårt arbeid med rekruttering og språkopplæring.
            </p>
          </AnimateIn>
        </div>
      </section>

      <Nyheter />
      <CTABanner />
      <Kontakt />
      <LegalSections />
    </>
  )
}
