import { IMAGES, img } from '../assets/images'
import AnimateIn from './AnimateIn'
import useContent from '../hooks/useContent'

export default function GodeGrunner() {
  const c = useContent('godeGrunner')

  return (
    <section className="py-24 lg:py-32 bg-surface" aria-labelledby="gode-grunner-heading">
      <div className="container-xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-14">
          <AnimateIn variant="fadeRight">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src={img(IMAGES.rekruttering, 900)}
                alt="Global Working samarbeid med norske kommuner"
                className="w-full object-cover"
                loading="lazy"
                width="640"
                height="450"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-900/30 via-transparent to-transparent" aria-hidden="true"/>
            </div>
          </AnimateIn>

          <div>
            <AnimateIn>
              <span className="inline-block text-primary-600 font-semibold text-sm tracking-wide uppercase mb-3">
                {c.label}
              </span>
              <h2 id="gode-grunner-heading" className="font-heading text-3xl lg:text-4xl font-bold text-ink mb-5 leading-tight">
                {c.heading}
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                {c.description}
              </p>
              <a
                href={c.articleLink}
                className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700 transition-colors"
              >
                {c.articleLinkLabel}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
            </AnimateIn>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {(c.testimonials || []).map((t, i) => (
            <AnimateIn key={t.author} variant="fadeUp" delay={i * 100}>
              <article className="h-full rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-gray-600 text-sm leading-relaxed mb-5">"{t.quote}"</p>
                <p className="font-semibold text-ink text-sm">— {t.author}</p>
              </article>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  )
}
