import AnimateIn from './AnimateIn'
import useContent from '../hooks/useContent'

const serviceIcons = [
  <svg key="i1" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>,
  <svg key="i2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M4 7V4h16v3M9 20h6M12 4v16"/>
  </svg>,
  <svg key="i3" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>,
]

export default function HvaGjor() {
  const c = useContent('hvaGjor')

  return (
    <section id="hvagjor" className="scroll-mt-28 py-24 lg:py-32 bg-white relative overflow-hidden" aria-labelledby="hvagjor-heading">
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-primary-50/30 rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[600px] h-[600px] bg-blue-50/30 rounded-full blur-3xl opacity-50 pointer-events-none" />

      <div className="container-xl relative z-10">
        <AnimateIn className="text-center max-w-3xl mx-auto mb-20">
          <span className="inline-block text-primary-600 font-bold text-xs uppercase tracking-[0.2em] mb-4">
            {c.label}
          </span>
          <h2 id="hvagjor-heading" className="font-heading text-3xl lg:text-4xl xl:text-5xl font-bold text-ink mb-6 leading-tight">
            {c.heading}
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">{c.description}</p>
        </AnimateIn>

        <div className="grid lg:grid-cols-3 gap-8 mb-16 px-4">
          {(c.services || []).map((s, i) => (
            <AnimateIn key={s.title} variant="fadeUp" delay={i * 150} className="h-full">
              <div className="group h-full bg-white rounded-[2rem] p-1 border border-gray-100 shadow-sm hover:shadow-2xl hover:border-primary-100 transition-all duration-500 overflow-hidden">
                <div className="p-8 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-8">
                    <div className="w-14 h-14 bg-primary-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary-200 group-hover:scale-110 transition-transform duration-300">
                      {serviceIcons[i] || serviceIcons[0]}
                    </div>
                    <span className="font-heading text-4xl font-bold text-primary-50 group-hover:text-primary-100 transition-colors">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="font-heading text-xl font-bold text-ink mb-4 group-hover:text-primary-600 transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed mb-8 flex-1">{s.description}</p>
                  <div className="w-12 h-1 bg-primary-100 group-hover:w-full transition-all duration-500 rounded-full" />
                </div>
              </div>
            </AnimateIn>
          ))}
        </div>

        <AnimateIn className="text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-6">
            <a
              href="/kontakt"
              className="group inline-flex items-center gap-3 px-10 py-5 bg-primary-600 text-white font-bold rounded-2xl hover:bg-navy transition-all duration-300 shadow-xl shadow-primary-100 hover:shadow-navy/20 cursor-pointer active:scale-95"
            >
              {c.ctaLabel}
              <svg
                width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"
                className="group-hover:translate-x-1 transition-transform"
              >
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
            <p className="text-gray-400 text-sm font-medium">{c.ctaNote}</p>
          </div>
        </AnimateIn>
      </div>
    </section>
  )
}
