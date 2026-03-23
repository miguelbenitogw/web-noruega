import { IMAGES, img } from '../assets/images'
import AnimateIn from './AnimateIn'
import { trackEvent } from '../lib/analytics'
import useContent from '../hooks/useContent'

export default function Helsesektor() {
  const c = useContent('helsesektorComp')

  return (
    <section id="helsesektor" className="scroll-mt-28 py-24 lg:py-32 bg-surface" aria-labelledby="helsesektor-heading">
      <div className="container-xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <AnimateIn variant="fadeRight">
            <div>
              <span className="inline-block text-primary-600 font-semibold text-sm tracking-wide uppercase mb-3">
                {c.label}
              </span>
              <h2 id="helsesektor-heading" className="font-heading text-3xl lg:text-4xl font-bold text-ink mb-6 leading-tight">
                {c.heading}
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                {c.description}
              </p>

              <div className="grid sm:grid-cols-3 gap-4 mb-8">
                {(c.stats || []).map(s => (
                  <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-4">
                    <p className="font-heading text-2xl font-bold text-primary-700">{s.value}</p>
                    <p className="text-xs text-gray-500">{s.label}</p>
                  </div>
                ))}
              </div>

              <ul className="space-y-5 mb-10" role="list">
                {(c.features || []).map((f) => (
                  <li key={f.title} className="flex gap-4">
                    <div className="mt-0.5 shrink-0 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                        <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-ink text-base mb-0.5">{f.title}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">{f.description}</p>
                    </div>
                  </li>
                ))}
              </ul>

              {c.blockquote && (
                <blockquote className="mb-10 rounded-2xl border border-primary-100 bg-white p-5 text-sm leading-relaxed text-gray-600">
                  "{c.blockquote.text}"
                  <footer className="mt-3 font-semibold text-ink">— {c.blockquote.author}</footer>
                </blockquote>
              )}

              <a
                href="/kontakt"
                onClick={() => trackEvent('cta_click', { location: 'helsesektor', cta: 'be_om_kandidater' })}
                className="inline-flex items-center gap-2 px-7 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors duration-200 shadow-md cursor-pointer"
              >
                {c.ctaLabel}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
            </div>
          </AnimateIn>

          <AnimateIn variant="fadeLeft" delay={200}>
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={img(IMAGES.helsesektor, 900)}
                  alt="Helsepersonell i Norge rekruttert av Global Working"
                  className="w-full object-cover"
                  loading="lazy"
                  width="640"
                  height="480"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-900/40 via-transparent to-transparent" aria-hidden="true"/>
              </div>

              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-5 border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                    </svg>
                  </div>
                  <div>
                    <div className="font-heading font-bold text-2xl text-ink">{c.groupsValue}</div>
                    <div className="text-gray-400 text-xs">{c.groupsLabel}</div>
                  </div>
                </div>
              </div>
            </div>
          </AnimateIn>
        </div>
      </div>
    </section>
  )
}
