import AnimateIn from '../components/AnimateIn'
import EditableText from '../components/editable/EditableText'
import EditableImage from '../components/editable/EditableImage'
import PageEndNav from '../components/PageEndNav'
import { IMAGES, img } from '../assets/images'
import { trackEvent } from '../lib/analytics'
import useContent from '../hooks/useContent'

function BulletList({ items, basePath }) {
  return (
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li key={`${basePath}-${index}`} className="flex gap-3 items-start">
          <span className="mt-1 w-6 h-6 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <path d="M5 13l4 4L19 7" />
            </svg>
          </span>
          <EditableText
            as="span"
            path={`${basePath}.${index}`}
            value={item}
            className="text-gray-600 leading-relaxed"
          />
        </li>
      ))}
    </ul>
  )
}

export default function HelsenorskPage() {
  const page = useContent('helsenorsk')
  const contacts = useContent('contacts')

  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-navy via-primary-900 to-primary-800 pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(30,115,190,0.25),transparent_60%)]" aria-hidden="true" />
        <div className="container-xl relative z-10">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
            <AnimateIn>
              <nav aria-label="Brodsmuler" className="mb-6">
                <ol className="flex items-center gap-2 text-sm text-blue-200">
                  <li><a href="/" className="hover:text-white transition-colors">Hjem</a></li>
                  <li aria-hidden="true">/</li>
                  <li><a href="/spansk-i-alicante" className="hover:text-white transition-colors">Spansk i Alicante</a></li>
                  <li aria-hidden="true">/</li>
                  <li className="text-white font-medium">
                    <EditableText as="span" path="helsenorsk.breadcrumb" value={page.breadcrumb} className="inline" />
                  </li>
                </ol>
              </nav>

              <EditableText
                as="h1"
                path="helsenorsk.heroTitle"
                value={page.heroTitle}
                className="font-heading text-3xl lg:text-5xl font-bold text-white leading-tight mb-4"
              />
              <EditableText
                as="p"
                path="helsenorsk.heroSubtitle"
                value={page.heroSubtitle}
                multiline
                className="text-xl text-blue-100 leading-relaxed max-w-2xl"
              />
            </AnimateIn>

            <AnimateIn variant="fadeLeft" delay={150}>
              <div className="rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl">
                <EditableImage
                  path="helsenorsk.heroImageUrl"
                  src={img(page.heroImageUrl || IMAGES.enfermeria)}
                  alt={page.heroImageAlt || 'Helsenorsk undervisning'}
                  className="w-full h-[360px] lg:h-[460px] object-cover"
                />
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="py-24 lg:py-28 bg-white">
        <div className="container-xl">
          <div className="max-w-3xl mx-auto">
            <AnimateIn>
              <EditableText
                as="h2"
                path="helsenorsk.introTitle"
                value={page.introTitle}
                className="font-heading text-3xl lg:text-4xl font-bold text-ink mb-6 leading-tight"
              />
              <EditableText
                as="p"
                path="helsenorsk.introP1"
                value={page.introP1}
                multiline
                className="text-gray-600 text-lg leading-relaxed mb-4"
              />
              <EditableText
                as="p"
                path="helsenorsk.introP2"
                value={page.introP2}
                multiline
                className="text-gray-600 text-lg leading-relaxed mb-4"
              />
              <EditableText
                as="p"
                path="helsenorsk.introP3"
                value={page.introP3}
                multiline
                className="text-gray-600 text-lg leading-relaxed"
              />
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* Sprak som kan brukes i praksis */}
      <section className="py-24 lg:py-28 bg-surface">
        <div className="container-xl">
          <div className="max-w-3xl mx-auto">
            <AnimateIn>
              <EditableText
                as="h2"
                path="helsenorsk.praksisTitle"
                value={page.praksisTitle}
                className="font-heading text-3xl lg:text-4xl font-bold text-ink mb-6 leading-tight"
              />
              <EditableText
                as="p"
                path="helsenorsk.praksisP1"
                value={page.praksisP1}
                multiline
                className="text-gray-600 leading-relaxed mb-4"
              />
              <EditableText
                as="p"
                path="helsenorsk.praksisP2"
                value={page.praksisP2}
                multiline
                className="text-gray-600 leading-relaxed mb-4"
              />
              <EditableText
                as="p"
                path="helsenorsk.praksisP3"
                value={page.praksisP3}
                multiline
                className="text-gray-600 leading-relaxed mb-4"
              />
              {page.praksisListIntro && (
                <EditableText
                  as="p"
                  path="helsenorsk.praksisListIntro"
                  value={page.praksisListIntro}
                  className="text-gray-600 leading-relaxed mb-3"
                />
              )}
              <BulletList items={page.praksisItems || []} basePath="helsenorsk.praksisItems" />
              <EditableText
                as="p"
                path="helsenorsk.praksisP4"
                value={page.praksisP4}
                multiline
                className="text-gray-600 leading-relaxed mt-6"
              />
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* Realistiske situasjoner */}
      <section className="py-24 lg:py-28 bg-white">
        <div className="container-xl">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-16 items-center">
            <AnimateIn variant="fadeRight">
              <EditableText
                as="h2"
                path="helsenorsk.situasjonerTitle"
                value={page.situasjonerTitle}
                className="font-heading text-3xl lg:text-4xl font-bold text-ink mb-6 leading-tight"
              />
              <EditableText
                as="p"
                path="helsenorsk.situasjonerP1"
                value={page.situasjonerP1}
                multiline
                className="text-gray-600 leading-relaxed mb-4"
              />
              <EditableText
                as="p"
                path="helsenorsk.situasjonerP2"
                value={page.situasjonerP2}
                multiline
                className="text-gray-600 leading-relaxed"
              />
            </AnimateIn>

            <AnimateIn variant="fadeLeft" delay={120}>
              <div className="rounded-[2rem] overflow-hidden border border-gray-100 shadow-lg bg-white">
                <EditableImage
                  path="helsenorsk.situasjonerImageUrl"
                  src={img(page.situasjonerImageUrl || IMAGES.helseHealthTeam)}
                  alt={page.situasjonerImageAlt || 'Simulering av helsesituasjoner'}
                  className="w-full h-[360px] object-cover"
                  loading="lazy"
                />
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* Undervist av helsepersonell */}
      <section className="py-24 lg:py-28 bg-surface">
        <div className="container-xl">
          <div className="max-w-3xl mx-auto">
            <AnimateIn>
              <EditableText
                as="h2"
                path="helsenorsk.undervisereTitle"
                value={page.undervisereTitle}
                className="font-heading text-3xl lg:text-4xl font-bold text-ink mb-6 leading-tight"
              />
              <EditableText
                as="p"
                path="helsenorsk.undervisereP1"
                value={page.undervisereP1}
                multiline
                className="text-gray-600 leading-relaxed mb-4"
              />
              <EditableText
                as="p"
                path="helsenorsk.undervisereP2"
                value={page.undervisereP2}
                multiline
                className="text-gray-600 leading-relaxed"
              />
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* Et solid spraklig grunnlag */}
      <section className="py-24 lg:py-28 bg-white">
        <div className="container-xl">
          <div className="max-w-3xl mx-auto">
            <AnimateIn>
              <EditableText
                as="h2"
                path="helsenorsk.grunnlagTitle"
                value={page.grunnlagTitle}
                className="font-heading text-3xl lg:text-4xl font-bold text-ink mb-6 leading-tight"
              />
              <EditableText
                as="p"
                path="helsenorsk.grunnlagP1"
                value={page.grunnlagP1}
                multiline
                className="text-gray-600 leading-relaxed mb-4"
              />
              <EditableText
                as="p"
                path="helsenorsk.grunnlagP2"
                value={page.grunnlagP2}
                multiline
                className="text-gray-600 leading-relaxed"
              />
            </AnimateIn>
          </div>

          <AnimateIn variant="fadeUp" delay={120}>
            <div className="mt-12 max-w-4xl mx-auto rounded-[2rem] overflow-hidden border border-gray-100 shadow-lg">
              <EditableImage
                path="helsenorsk.grunnlagImageUrl"
                src={img(page.grunnlagImageUrl || IMAGES.claseNoruego)}
                alt={page.grunnlagImageAlt || 'Helsenorsk undervisning og opplæring'}
                className="w-full h-[360px] object-cover"
                loading="lazy"
              />
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 lg:py-28 bg-gradient-to-br from-primary-50 via-white to-surface">
        <div className="container-xl">
          <AnimateIn>
            <div className="max-w-3xl mx-auto text-center">
              <span className="inline-block text-primary-600 font-semibold text-sm tracking-wide uppercase mb-3">
                {page.ctaLabel}
              </span>
              <EditableText
                as="h2"
                path="helsenorsk.ctaTitle"
                value={page.ctaTitle}
                className="font-heading text-3xl lg:text-4xl font-bold text-ink mb-6 leading-tight"
              />
              <EditableText
                as="p"
                path="helsenorsk.ctaP1"
                value={page.ctaP1}
                multiline
                className="text-gray-600 leading-relaxed mb-4"
              />
              <EditableText
                as="p"
                path="helsenorsk.ctaP2"
                value={page.ctaP2}
                multiline
                className="text-gray-600 leading-relaxed mb-8"
              />

              <div className="grid sm:grid-cols-2 gap-4 max-w-lg mx-auto mb-8">
                {(contacts || []).map((contact) => (
                  <div key={contact.name} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-left">
                    <div className="flex items-center gap-3 mb-3">
                      {contact.imageUrl && (
                        <img
                          src={contact.imageUrl}
                          alt={contact.imageAlt || contact.name}
                          className="w-12 h-12 rounded-full object-cover shrink-0"
                        />
                      )}
                      <div>
                        <div className="font-heading font-bold text-ink text-sm leading-tight">{contact.name}</div>
                        {contact.role && (
                          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mt-0.5">{contact.role}</div>
                        )}
                      </div>
                    </div>
                    <a href={`mailto:${contact.email}`} className="text-primary-600 text-xs hover:underline block">{contact.email}</a>
                    <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="text-gray-500 text-xs hover:text-primary-600 transition-colors block">{contact.phone}</a>
                  </div>
                ))}
              </div>

              <a
                href="/kontakt"
                onClick={() => trackEvent('cta_click', { location: 'helsenorsk_cta', cta: 'kontakt' })}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors duration-200 shadow-md cursor-pointer"
              >
                {page.ctaButton}
              </a>
            </div>
          </AnimateIn>
        </div>
      </section>

      <PageEndNav current="/spansk-i-alicante/helsenorsk" />
    </>
  )
}
