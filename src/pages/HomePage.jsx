import Hero from '../components/Hero'
import CTABanner from '../components/CTABanner'
import AnimateIn from '../components/AnimateIn'
import { trackEvent } from '../lib/analytics'
import { getAllNews } from '../lib/news'

const sections = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: 'Vår rekrutteringsmodell',
    description: 'Vi finner, forbereder og følger opp fagfolk fra Sør-Europa til trygg oppstart i Norge. Opptil 600 timer norskopplæring.',
    href: '/vr-rekrutteringsmodell',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    ),
    title: 'Helsesektor',
    description: 'Norges største leverandør av sykepleiere utenfra Skandinavia. Spesialisert helsefaglig forberedelse siden 2014.',
    href: '/helse',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
      </svg>
    ),
    title: 'Talentportalen',
    description: 'Se tilgjengelige kandidater for fast ansettelse direkte i vår nye kandidatportal.',
    href: '/talentportalen',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
    ),
    title: 'Om Global Working',
    description: 'Grunnlagt i 2014. 50+ ansatte. ISO-sertifisert. Hovedkontor i Alicante med kontor i Oslo.',
    href: '/om-oss',
  },
]

const stats = [
  { value: '500+', label: 'Kandidater plassert i Norge' },
  { value: '95%', label: 'Retensjonsgrad' },
  { value: '25 000+', label: 'Undervisningstimer i norsk' },
]

const contacts = [
  {
    name: 'Miriam Svendsen',
    role: 'Rekrutteringsansvarlig',
    email: 'miriam.svendsen@globalworking.net',
    phone: '+47 919 00 649',
  },
  {
    name: 'Gro Anette',
    role: 'Kandidatoppfølging',
    email: 'gro.anette@globalworking.net',
    phone: '+47 408 98 448',
  },
]

function SummaryCard({ section, delay }) {
  return (
    <AnimateIn variant="fadeUp" delay={delay}>
      <a
        href={section.href}
        onClick={() => trackEvent('cta_click', { location: 'landing_summary', cta: section.href })}
        className="group block h-full bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-primary-100 transition-all duration-300 p-7"
      >
        <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center mb-5 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
          {section.icon}
        </div>
        <h3 className="font-heading text-lg font-bold text-ink mb-2 group-hover:text-primary-600 transition-colors">
          {section.title}
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed mb-4">
          {section.description}
        </p>
        <span className="inline-flex items-center gap-1.5 text-primary-600 font-semibold text-sm">
          Les mer
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
            className="group-hover:translate-x-1 transition-transform" aria-hidden="true"
          >
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </span>
      </a>
    </AnimateIn>
  )
}

export default function HomePage() {
  const news = getAllNews()
  const latestNews = news.slice(0, 2)

  const tagColors = {
    Plattform: 'bg-primary-50 text-primary-700',
    Lovgivning: 'bg-amber-50 text-amber-700',
    Suksesshistorie: 'bg-green-50 text-green-700',
    Veiledning: 'bg-purple-50 text-purple-700',
  }

  return (
    <>
      <Hero />

      {/* Section Summaries */}
      <section className="py-24 lg:py-32 bg-white" aria-labelledby="tilbud-heading">
        <div className="container-xl">
          <AnimateIn className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block text-primary-600 font-bold text-xs uppercase tracking-[0.2em] mb-4">
              Våre tjenester
            </span>
            <h2 id="tilbud-heading" className="font-heading text-3xl lg:text-4xl xl:text-5xl font-bold text-ink mb-5 leading-tight">
              Vårt tilbud til norske arbeidsgivere
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Vi kobler norske arbeidsgivere med kvalifiserte fagfolk fra Sør-Europa – forberedt med språk, kultur og fagkompetanse.
            </p>
          </AnimateIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sections.map((section, i) => (
              <SummaryCard key={section.href} section={section} delay={i * 100} />
            ))}
          </div>
        </div>
      </section>

      {/* Healthcare Highlight */}
      <section className="py-24 lg:py-32 bg-gradient-to-br from-navy via-primary-900 to-primary-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(30,115,190,0.3),transparent_60%)]" aria-hidden="true" />
        <div className="container-xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <AnimateIn variant="fadeRight">
              <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-sm font-semibold mb-5">
                Helsesektoren
              </span>
              <h2 className="font-heading text-3xl lg:text-4xl font-bold text-white mb-5 leading-tight">
                Vi støtter det norske helsevesenet
              </h2>
              <p className="text-blue-100 text-lg leading-relaxed mb-8">
                Global Working er den største leverandøren av sykepleiere utenfra Skandinavia til Norge. Siden 2014 har vi spesialisert oss på å utdanne og kvalifisere sykepleiere fra Spania, Italia og Frankrike for arbeid i norsk helsesektor.
              </p>
              <a
                href="/helse"
                onClick={() => trackEvent('cta_click', { location: 'landing_health', cta: 'les_mer_helse' })}
                className="inline-flex items-center gap-2 px-7 py-4 bg-cta text-white font-semibold rounded-xl hover:bg-cta-600 transition-all duration-200 shadow-lg hover:-translate-y-0.5 cursor-pointer"
              >
                Les mer om helse
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
            </AnimateIn>

            <AnimateIn variant="fadeLeft" delay={150}>
              <div className="grid grid-cols-3 gap-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-5 text-center">
                    <div className="font-heading text-2xl lg:text-3xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-blue-200 text-xs font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* Latest News Preview */}
      {latestNews.length > 0 && (
        <section className="py-24 lg:py-32 bg-surface" aria-labelledby="nyheter-preview-heading">
          <div className="container-xl">
            <AnimateIn>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
                <div>
                  <span className="inline-block text-primary-600 font-semibold text-sm tracking-wide uppercase mb-3">
                    Nyheter & artikler
                  </span>
                  <h2 id="nyheter-preview-heading" className="font-heading text-3xl lg:text-4xl font-bold text-ink leading-tight">
                    Siste nytt
                  </h2>
                </div>
                <a
                  href="/journal"
                  onClick={() => trackEvent('cta_click', { location: 'landing_news', cta: 'se_alle' })}
                  className="shrink-0 inline-flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700 transition-colors"
                >
                  Se alle nyheter
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </a>
              </div>
            </AnimateIn>

            <div className="grid md:grid-cols-2 gap-6">
              {latestNews.map((article, i) => (
                <AnimateIn key={article.slug} variant="fadeUp" delay={i * 120}>
                  <article className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:border-primary-100 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tagColors[article.tag] || 'bg-gray-100 text-gray-700'}`}>
                        {article.tag}
                      </span>
                      <time className="text-gray-400 text-xs">{article.dateLabel}</time>
                    </div>
                    <h3 className="font-heading text-lg font-bold text-ink mb-2 leading-snug">{article.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4">{article.excerpt}</p>
                    <a
                      href={`/nyheter/${article.slug}`}
                      onClick={() => trackEvent('news_open', { slug: article.slug, location: 'landing' })}
                      className="inline-flex items-center gap-1.5 text-primary-600 font-semibold text-sm hover:text-primary-700 transition-colors"
                    >
                      Les mer
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </a>
                  </article>
                </AnimateIn>
              ))}
            </div>
          </div>
        </section>
      )}

      <CTABanner />

      {/* Quick Contact */}
      <section className="py-24 lg:py-32 bg-white" aria-labelledby="quick-contact-heading">
        <div className="container-xl">
          <div className="max-w-3xl mx-auto text-center">
            <AnimateIn>
              <span className="inline-block text-primary-600 font-semibold text-sm tracking-wide uppercase mb-3">
                Kontakt
              </span>
              <h2 id="quick-contact-heading" className="font-heading text-3xl lg:text-4xl font-bold text-ink mb-5 leading-tight">
                Ønsker du å vite mer?
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-12">
                Du treffer oss på e-post eller telefon. Vi tar kontakt så snart vi har mulighet.
              </p>
            </AnimateIn>

            <div className="grid sm:grid-cols-2 gap-5 mb-10">
              {contacts.map((c, i) => (
                <AnimateIn key={c.name} variant="fadeUp" delay={i * 100}>
                  <div className="bg-surface rounded-2xl p-6 border border-gray-100 text-left">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-primary-200">
                        <span className="font-heading font-bold text-white text-lg">{c.name.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="font-heading font-bold text-ink text-sm">{c.name}</div>
                        <div className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">{c.role}</div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <a href={`mailto:${c.email}`} className="block text-primary-600 text-sm hover:underline">{c.email}</a>
                      <a href={`tel:${c.phone.replace(/\s/g, '')}`} className="block text-gray-500 text-sm hover:text-primary-600 transition-colors">{c.phone}</a>
                    </div>
                  </div>
                </AnimateIn>
              ))}
            </div>

            <AnimateIn variant="fadeUp" delay={250}>
              <a
                href="/kontakt"
                onClick={() => trackEvent('cta_click', { location: 'landing_quick_contact', cta: 'send_melding' })}
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors duration-200 shadow-md cursor-pointer"
              >
                Send oss en melding
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
            </AnimateIn>
          </div>
        </div>
      </section>
    </>
  )
}
