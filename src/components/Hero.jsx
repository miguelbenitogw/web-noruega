import { IMAGES, img } from '../assets/images'
import teamHero from '../assets/team-hero.jpg'
import useInView from '../hooks/useInView'
import useCounter from '../hooks/useCounter'
import { trackEvent } from '../lib/analytics'
import useContent from '../hooks/useContent'

function StatCard({ stat, active, delay }) {
  const animatedValue = useCounter(stat.value, active && stat.animate, 2000)
  const display = stat.animate ? animatedValue : stat.value

  return (
    <div
      className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-4 text-center transition-all duration-700 ease-out"
      style={{
        opacity: active ? 1 : 0,
        transform: active ? 'translateY(0)' : 'translateY(16px)',
        transitionDelay: `${delay}ms`,
      }}
    >
      <div className="font-heading text-2xl font-bold text-white mb-0.5">{display}</div>
      <div className="text-blue-200 text-xs font-medium">{stat.label}</div>
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
          src={teamHero}
          alt=""
          className="w-full h-full object-cover object-top scale-105"
          loading="eager"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-primary-900/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/80 via-primary-900/50 to-transparent" />
      </div>

      <div className="container-xl relative z-10 py-32 lg:py-40">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <div className="animate-[fadeInUp_0.8s_ease-out_0.2s_both]">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm font-medium mb-8 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-cta animate-pulse" aria-hidden="true" />
                {c.badge}
              </div>
            </div>

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 animate-[fadeInUp_0.8s_ease-out_0.4s_both]">
              {c.h1First} <span className="text-cta">{c.h1Highlight}</span>
            </h1>

            <p className="text-lg lg:text-xl text-blue-100 leading-relaxed mb-10 max-w-xl animate-[fadeInUp_0.8s_ease-out_0.6s_both]">
              {c.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 animate-[fadeInUp_0.8s_ease-out_0.8s_both]">
              <a
                href="/vr-rekrutteringsmodell"
                onClick={() => trackEvent('cta_click', { location: 'hero', cta: 'slik_jobber_vi' })}
                className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-cta text-white font-semibold rounded-xl hover:bg-cta-600 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
              >
                {c.cta1}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
              <a
                href="/kontakt"
                onClick={() => trackEvent('cta_click', { location: 'hero', cta: 'kontakt_oss' })}
                className="inline-flex items-center justify-center px-7 py-4 bg-white/10 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-200 backdrop-blur-sm cursor-pointer"
              >
                {c.cta2}
              </a>
            </div>

            <div ref={statsRef} className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {(c.stats || []).map((stat, i) => (
                <StatCard key={stat.label} stat={stat} active={statsVisible} delay={i * 150} />
              ))}
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-center animate-[fadeInUp_1s_ease-out_1s_both]">
            <div className="relative">
              <div className="absolute -inset-6 bg-primary-500/20 rounded-3xl blur-2xl" aria-hidden="true" />
              <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden shadow-2xl">
                <div className="bg-white/15 px-4 py-3 flex items-center gap-2 border-b border-white/10">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400/80" aria-hidden="true"/>
                    <div className="w-3 h-3 rounded-full bg-yellow-400/80" aria-hidden="true"/>
                    <div className="w-3 h-3 rounded-full bg-green-400/80" aria-hidden="true"/>
                  </div>
                  <div className="flex-1 bg-white/10 rounded px-3 py-1 text-white/60 text-xs">globalworking.no</div>
                </div>
                <img
                  src={img(IMAGES.platformHero, 800)}
                  alt="Global Working Norge plattform"
                  className="w-full max-w-lg object-cover"
                  loading="eager"
                  width="512"
                  height="340"
                />
              </div>
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
