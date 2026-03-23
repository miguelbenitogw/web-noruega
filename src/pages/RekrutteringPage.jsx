import AnimateIn from '../components/AnimateIn'
import HvaGjor from '../components/HvaGjor'
import Rekruttering from '../components/Rekruttering'
import GodeGrunner from '../components/GodeGrunner'
import PageEndNav from '../components/PageEndNav'
import { IMAGES, img } from '../assets/images'
import { trackEvent } from '../lib/analytics'
import useContent from '../hooks/useContent'

export default function RekrutteringPage() {
  const hero = useContent('rekrutteringHero')
  const collab = useContent('rekrutteringCollab')

  return (
    <>
      {/* Page Hero Banner */}
      <section className="relative bg-gradient-to-br from-navy via-primary-900 to-primary-800 pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(30,115,190,0.25),transparent_70%)]" aria-hidden="true" />
        <div className="container-xl relative z-10">
          <AnimateIn>
            <nav aria-label="Brødsmuler" className="mb-6">
              <ol className="flex items-center gap-2 text-sm text-blue-200">
                <li><a href="/" className="hover:text-white transition-colors">Hjem</a></li>
                <li aria-hidden="true">/</li>
                <li className="text-white font-medium">Vår rekrutteringsmodell</li>
              </ol>
            </nav>
            <h1 className="font-heading text-3xl lg:text-5xl font-bold text-white leading-tight mb-5 max-w-3xl">
              {hero.h1}
            </h1>
            <p className="text-lg text-blue-100 leading-relaxed max-w-2xl">{hero.description}</p>
          </AnimateIn>
        </div>
      </section>

      <HvaGjor />
      <Rekruttering />

      {/* Collaboration Model */}
      <section className="py-24 lg:py-32 bg-surface">
        <div className="container-xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <AnimateIn variant="fadeRight">
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary-50 text-primary-700 text-sm font-semibold mb-5">
                {collab.label}
              </span>
              <h2 className="font-heading text-3xl lg:text-4xl font-bold text-ink leading-tight mb-6">
                {collab.heading}
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>{collab.p1}</p>
                <p>{collab.p2}</p>
                <p>{collab.p3}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <a
                  href="/kontakt"
                  onClick={() => trackEvent('cta_click', { location: 'collaboration_model', cta: 'kontakt_oss' })}
                  className="inline-flex items-center justify-center px-7 py-4 bg-cta text-white font-semibold rounded-xl hover:bg-cta-600 transition-all duration-200 shadow-lg hover:-translate-y-0.5 cursor-pointer"
                >
                  {collab.cta1}
                </a>
                <a
                  href="/talentportalen"
                  onClick={() => trackEvent('cta_click', { location: 'collaboration_model', cta: 'se_kandidatportalen' })}
                  className="inline-flex items-center justify-center px-7 py-4 bg-white border-2 border-primary-200 text-primary-600 font-semibold rounded-xl hover:bg-primary-50 transition-all duration-200 cursor-pointer"
                >
                  {collab.cta2}
                </a>
              </div>
            </AnimateIn>

            <AnimateIn variant="fadeLeft" delay={150}>
              <div className="relative">
                <div className="rounded-3xl overflow-hidden border border-gray-100 shadow-xl">
                  <img
                    src={img(IMAGES.rekruttering, 800)}
                    alt="Global Working rekrutteringsprosessen"
                    className="w-full h-auto object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-2xl bg-primary-100/60 -z-10" aria-hidden="true" />
                <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-cta/10 -z-10" aria-hidden="true" />
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>

      <GodeGrunner />
      <PageEndNav current="/vr-rekrutteringsmodell" />
    </>
  )
}
