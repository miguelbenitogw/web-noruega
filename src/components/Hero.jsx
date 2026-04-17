import useInView from '../hooks/useInView'
import useCounter from '../hooks/useCounter'
import { trackEvent } from '../lib/analytics'
import useContent from '../hooks/useContent'
import { IMAGES, img } from '../assets/images'
import EditableText, { createArrayItemCommitter } from './editable/EditableText'

function StatCard({ stat, active, delay, index, allStats }) {
  const animatedValue = useCounter(stat.value, active && stat.animate, 2000)
  const display = stat.animate ? animatedValue : stat.value
  const commitValue = createArrayItemCommitter({
    basePath: 'hero.stats',
    fallbackItems: allStats,
    index,
    field: 'value',
  })
  const commitLabel = createArrayItemCommitter({
    basePath: 'hero.stats',
    fallbackItems: allStats,
    index,
    field: 'label',
  })

  return (
    <div
      className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-4 text-center transition-all duration-700 ease-out"
      style={{
        opacity: active ? 1 : 0,
        transform: active ? 'translateY(0)' : 'translateY(16px)',
        transitionDelay: `${delay}ms`,
      }}
    >
      <EditableText
        as="div"
        path={`hero.stats.${index}.value`}
        value={display}
        onCommit={commitValue}
        className="font-heading text-2xl font-bold text-white mb-0.5"
        inputClassName="font-heading text-2xl font-bold"
      />
      <EditableText
        as="div"
        path={`hero.stats.${index}.label`}
        value={stat.label}
        onCommit={commitLabel}
        className="text-blue-200 text-xs font-medium"
      />
    </div>
  )
}

export default function Hero() {
  const [statsRef, statsVisible] = useInView({ threshold: 0.3 })
  const c = useContent('hero')

  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      aria-label="Hovedseksjon – Global Working Norge"
    >
      <div className="absolute inset-0" aria-hidden="true">
        <img
          src={img(c.imageUrl || IMAGES.teamHero, 1600)}
          alt={c.imageAlt || ''}
          className="w-full h-full object-cover object-top scale-105"
          loading="eager"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-primary-900/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/80 via-primary-900/50 to-transparent" />
      </div>

      <div className="container-xl relative z-10 py-32 lg:py-40">
        <div className="grid lg:grid-cols-1 gap-12 items-center">
          <div className="mx-auto max-w-4xl text-center">

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 animate-[fadeInUp_0.8s_ease-out_0.4s_both]">
              <EditableText as="span" path="hero.h1First" value={c.h1First} className="inline" />{' '}
              <EditableText as="span" path="hero.h1Highlight" value={c.h1Highlight} className="inline text-cta" />
            </h1>

            <EditableText
              as="p"
              path="hero.description"
              value={c.description}
              multiline
              className="mx-auto max-w-2xl text-lg lg:text-xl text-blue-100 leading-relaxed mb-10 animate-[fadeInUp_0.8s_ease-out_0.6s_both]"
              inputClassName="min-h-[180px]"
            />

            <div className="flex flex-col sm:flex-row sm:justify-center gap-4 animate-[fadeInUp_0.8s_ease-out_0.8s_both]">
              <a
                href="/vr-rekrutteringsmodell"
                onClick={() => trackEvent('cta_click', { location: 'hero', cta: 'slik_jobber_vi' })}
                className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-cta text-white font-semibold rounded-xl hover:bg-cta-600 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
              >
                <EditableText as="span" path="hero.cta1" value={c.cta1} className="inline" />
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
              <a
                href="/kontakt"
                onClick={() => trackEvent('cta_click', { location: 'hero', cta: 'kontakt_oss' })}
                className="inline-flex items-center justify-center px-7 py-4 bg-white/10 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-200 backdrop-blur-sm cursor-pointer"
              >
                <EditableText as="span" path="hero.cta2" value={c.cta2} className="inline" />
              </a>
            </div>

            <div ref={statsRef} className="mx-auto mt-14 grid max-w-3xl grid-cols-2 sm:grid-cols-4 gap-4">
              {(c.stats || []).map((stat, i) => (
                <StatCard
                  key={`${stat.label}-${i}`}
                  stat={stat}
                  active={statsVisible}
                  delay={i * 150}
                  index={i}
                  allStats={c.stats || []}
                />
              ))}
            </div>
          </div>

        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50" aria-hidden="true">
        <div className="w-5 h-8 border-2 border-white/30 rounded-full flex justify-center pt-1.5">
          <div className="w-1 h-2 bg-white/60 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  )
}
