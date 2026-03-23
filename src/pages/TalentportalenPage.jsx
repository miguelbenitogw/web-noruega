import AnimateIn from '../components/AnimateIn'
import Talentportalen from '../components/Talentportalen'
import PageEndNav from '../components/PageEndNav'
import useContent from '../hooks/useContent'

const stepIcons = [
  <svg key="p1" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>,
  <svg key="p2" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" />
  </svg>,
  <svg key="p3" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>,
  <svg key="p4" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" />
    <line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
  </svg>,
]

export default function TalentportalenPage() {
  const hero = useContent('talentportalenHero')
  const stepsSection = useContent('talentportalenSteps')
  const benefitsSection = useContent('talentportalenBenefits')

  return (
    <>
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-br from-navy via-primary-900 to-primary-800 pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(30,115,190,0.3),transparent_60%)]" aria-hidden="true" />
        <div className="container-xl relative z-10">
          <AnimateIn>
            <nav className="text-blue-200/70 text-sm mb-6" aria-label="Brødsmuler">
              <a href="/" className="hover:text-white transition-colors">Hjem</a>
              <span className="mx-2">/</span>
              <span className="text-white">Talentportalen</span>
            </nav>
            <h1 className="font-heading text-3xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              {hero.h1}
            </h1>
            <p className="text-blue-100 text-lg max-w-2xl leading-relaxed">{hero.description}</p>
          </AnimateIn>
        </div>
      </section>

      <Talentportalen />

      {/* How It Works */}
      <section className="py-24 lg:py-32 bg-white" aria-labelledby="how-it-works-heading">
        <div className="container-xl">
          <AnimateIn>
            <div className="text-center mb-16">
              <span className="inline-block text-primary-600 font-semibold text-sm tracking-wide uppercase mb-3">
                {stepsSection.label}
              </span>
              <h2 id="how-it-works-heading" className="font-heading text-3xl lg:text-4xl font-bold text-ink leading-tight">
                {stepsSection.heading}
              </h2>
            </div>
          </AnimateIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {(stepsSection.steps || []).map((step, i) => (
              <AnimateIn key={step.number} variant="fadeUp" delay={i * 120}>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-300 p-7 text-center h-full">
                  <div className="text-primary-600/20 font-heading font-bold text-5xl mb-3">{step.number}</div>
                  <div className="w-14 h-14 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
                    {stepIcons[i] || stepIcons[0]}
                  </div>
                  <h3 className="font-heading font-semibold text-ink text-lg mb-2">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 lg:py-32 bg-surface" aria-labelledby="benefits-heading">
        <div className="container-xl">
          <div className="max-w-3xl mx-auto">
            <AnimateIn>
              <div className="text-center mb-14">
                <span className="inline-block text-primary-600 font-semibold text-sm tracking-wide uppercase mb-3">
                  {benefitsSection.label}
                </span>
                <h2 id="benefits-heading" className="font-heading text-3xl lg:text-4xl font-bold text-ink leading-tight">
                  {benefitsSection.heading}
                </h2>
              </div>
            </AnimateIn>

            <ul className="space-y-5" role="list">
              {(benefitsSection.items || []).map((benefit, i) => (
                <AnimateIn key={benefit} variant="fadeUp" delay={i * 100}>
                  <li className="flex items-start gap-4 bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                    <div className="shrink-0 w-7 h-7 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mt-0.5">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span className="text-ink font-medium leading-relaxed">{benefit}</span>
                  </li>
                </AnimateIn>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <PageEndNav current="/talentportalen" />
    </>
  )
}
