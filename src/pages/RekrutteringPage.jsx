import AnimateIn from '../components/AnimateIn'
import HvaGjor from '../components/HvaGjor'
import Rekruttering from '../components/Rekruttering'
import GodeGrunner from '../components/GodeGrunner'
import PageEndNav from '../components/PageEndNav'
import { IMAGES, img } from '../assets/images'
import { trackEvent } from '../lib/analytics'
import useContent from '../hooks/useContent'
import EditableText from '../components/editable/EditableText'
import { useNewsCollection } from '../hooks/useNews'

export default function RekrutteringPage() {
  const hero = useContent('rekrutteringHero')
  const collab = useContent('rekrutteringCollab')
  const nyheter = useContent('nyheterSection')
  const { articles: news } = useNewsCollection()
  const latestNews = news.slice(0, 2)

  const tagColors = {
    Plattform: 'bg-primary-50 text-primary-700',
    Lovgivning: 'bg-amber-50 text-amber-700',
    Suksesshistorie: 'bg-green-50 text-green-700',
    Veiledning: 'bg-purple-50 text-purple-700',
  }

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
                <li className="text-white font-medium">{hero.breadcrumb}</li>
              </ol>
            </nav>
            <EditableText
              as="h1"
              path="rekrutteringHero.h1"
              value={hero.h1}
              className="font-heading text-3xl lg:text-5xl font-bold text-white leading-tight mb-5 max-w-3xl"
            />
            <EditableText
              as="p"
              path="rekrutteringHero.description"
              value={hero.description}
              multiline
              className="text-lg text-blue-100 leading-relaxed max-w-2xl"
            />
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
              <EditableText
                as="span"
                path="rekrutteringCollab.label"
                value={collab.label}
                className="inline-block px-4 py-1.5 rounded-full bg-primary-50 text-primary-700 text-sm font-semibold mb-5"
              />
              <EditableText
                as="h2"
                path="rekrutteringCollab.heading"
                value={collab.heading}
                className="font-heading text-3xl lg:text-4xl font-bold text-ink leading-tight mb-6"
              />
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <EditableText
                  as="p"
                  path="rekrutteringCollab.p1"
                  value={collab.p1}
                  multiline
                />
                <EditableText
                  as="p"
                  path="rekrutteringCollab.p2"
                  value={collab.p2}
                  multiline
                />
                <EditableText
                  as="p"
                  path="rekrutteringCollab.p3"
                  value={collab.p3}
                  multiline
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <a
                  href="/kontakt"
                  onClick={() => trackEvent('cta_click', { location: 'collaboration_model', cta: 'kontakt_oss' })}
                  className="inline-flex items-center justify-center px-7 py-4 bg-cta text-white font-semibold rounded-xl hover:bg-cta-600 transition-all duration-200 shadow-lg hover:-translate-y-0.5 cursor-pointer"
                >
                  <EditableText as="span" path="rekrutteringCollab.cta1" value={collab.cta1} className="inline" />
                </a>
                <a
                  href="/talentportalen"
                  onClick={() => trackEvent('cta_click', { location: 'collaboration_model', cta: 'se_kandidatportalen' })}
                  className="inline-flex items-center justify-center px-7 py-4 bg-white border-2 border-primary-200 text-primary-600 font-semibold rounded-xl hover:bg-primary-50 transition-all duration-200 cursor-pointer"
                >
                  <EditableText as="span" path="rekrutteringCollab.cta2" value={collab.cta2} className="inline" />
                </a>
              </div>
            </AnimateIn>

            <AnimateIn variant="fadeLeft" delay={150}>
              <div className="relative">
                <div className="rounded-3xl overflow-hidden border border-gray-100 shadow-xl">
                  <img
                    src={img(collab.imageUrl || IMAGES.rekruttering, 800)}
                    alt={collab.imageAlt || 'Global Working rekrutteringsprosessen'}
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

      {latestNews.length > 0 && (
        <section className="py-24 lg:py-32 bg-white" aria-labelledby="rekruttering-nyheter-heading">
          <div className="container-xl">
            <AnimateIn>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
                <div className="max-w-2xl">
                  <span className="inline-block text-primary-600 font-semibold text-sm tracking-wide uppercase mb-3">
                    {nyheter.label}
                  </span>
                  <h2 id="rekruttering-nyheter-heading" className="font-heading text-3xl lg:text-4xl font-bold text-ink leading-tight">
                    {nyheter.headingPreview}
                  </h2>
                </div>
                <a
                  href="/nyheter"
                  onClick={() => trackEvent('cta_click', { location: 'rekruttering_news', cta: 'se_alle_nyheter' })}
                  className="shrink-0 inline-flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700 transition-colors"
                >
                  {nyheter.ctaLabel}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </AnimateIn>

            <div className="grid md:grid-cols-2 gap-6">
              {latestNews.map((article, index) => (
                <AnimateIn key={article.slug} variant="fadeUp" delay={index * 120}>
                  <article className="h-full rounded-3xl border border-gray-100 bg-surface p-7 shadow-sm transition-all duration-300 hover:border-primary-100 hover:shadow-lg">
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tagColors[article.tag] || 'bg-gray-100 text-gray-700'}`}>
                        <EditableText as="span" path={`news.${article.slug}.tag`} value={article.tag} className="inline" />
                      </span>
                      <time className="text-gray-400 text-xs">{article.dateLabel}</time>
                    </div>
                    <EditableText
                      as="h3"
                      path={`news.${article.slug}.title`}
                      value={article.title}
                      className="font-heading text-xl font-bold text-ink leading-snug"
                    />
                    <EditableText
                      as="p"
                      path={`news.${article.slug}.excerpt`}
                      value={article.excerpt}
                      multiline
                      inputClassName="min-h-[180px]"
                      className="mt-3 text-gray-600 leading-relaxed"
                    />
                    <a
                      href={`/nyheter/${article.slug}`}
                      onClick={() => trackEvent('news_open', { slug: article.slug, location: 'rekruttering' })}
                      className="mt-5 inline-flex items-center gap-1.5 text-primary-600 font-semibold text-sm hover:text-primary-700 transition-colors"
                    >
                      {nyheter.readMoreLabel}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </a>
                  </article>
                </AnimateIn>
              ))}
            </div>
          </div>
        </section>
      )}

      <PageEndNav current="/vr-rekrutteringsmodell" />
    </>
  )
}
