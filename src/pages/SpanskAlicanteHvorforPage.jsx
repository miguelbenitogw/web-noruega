import AnimateIn from '../components/AnimateIn'
import EditableText, { createArrayItemCommitter } from '../components/editable/EditableText'
import EditableImage from '../components/editable/EditableImage'
import PageEndNav from '../components/PageEndNav'
import { IMAGES, img } from '../assets/images'
import { trackEvent } from '../lib/analytics'
import useContent from '../hooks/useContent'

function HighlightItem({ item, index }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-1 w-6 h-6 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
          <path d="M5 13l4 4L19 7" />
        </svg>
      </span>
      <EditableText
        as="span"
        path={`spanskAlicanteVision.highlights.${index}`}
        value={item}
        className="text-gray-600 leading-relaxed"
      />
    </li>
  )
}

export default function SpanskAlicanteHvorforPage() {
  const vision = useContent('spanskAlicanteVision')
  const page = useContent('spanskAlicantePage')
  const hvorfor = useContent('spanskAlicanteHvorfor')

  return (
    <>
      <section className="relative bg-gradient-to-br from-navy via-primary-900 to-primary-800 pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(30,115,190,0.22),transparent_60%)]" aria-hidden="true" />
        <div className="container-xl relative z-10">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
            <AnimateIn>
              <nav aria-label="Brødsmuler" className="mb-6">
                <ol className="flex items-center gap-2 text-sm text-blue-200">
                  <li><a href="/" className="hover:text-white transition-colors">Hjem</a></li>
                  <li aria-hidden="true">/</li>
                  <li><a href="/spansk-i-alicante" className="hover:text-white transition-colors">Spansk i Alicante</a></li>
                  <li aria-hidden="true">/</li>
                  <li className="text-white font-medium">
                    <EditableText as="span" path="spanskAlicanteVision.breadcrumb" value={vision.breadcrumb} className="inline" />
                  </li>
                </ol>
              </nav>

              <EditableText
                as="h1"
                path="spanskAlicanteVision.title"
                value={vision.title}
                className="font-heading text-3xl lg:text-5xl font-bold text-white leading-tight mb-5"
              />
              <EditableText
                as="p"
                path="spanskAlicanteVision.intro"
                value={vision.intro}
                multiline
                className="text-lg text-blue-100 leading-relaxed max-w-2xl"
              />
            </AnimateIn>

            <AnimateIn variant="fadeLeft" delay={120}>
              <div className="rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl">
                <EditableImage
                  path="spanskAlicanteVision.imageUrl"
                  src={img(vision.imageUrl || IMAGES.spanskAlicanteCastleArch, 1200)}
                  alt={vision.imageAlt || 'Historisk arkitektur og stemning i Alicante'}
                  className="w-full h-[360px] lg:h-[440px] object-cover"
                />
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>

      <section className="py-24 lg:py-28 bg-white">
        <div className="container-xl">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-start">
            <div className="space-y-6">
              {(vision.sections || []).map((section, index) => {
                const headingCommit = createArrayItemCommitter({
                  basePath: 'spanskAlicanteVision.sections',
                  fallbackItems: vision.sections || [],
                  index,
                  field: 'heading',
                })
                const bodyCommit = createArrayItemCommitter({
                  basePath: 'spanskAlicanteVision.sections',
                  fallbackItems: vision.sections || [],
                  index,
                  field: 'body',
                })

                return (
                  <AnimateIn key={`vision-section-${index}`} variant="fadeUp" delay={index * 100}>
                    <div className="bg-surface border border-gray-100 rounded-[2rem] p-8">
                      <EditableText
                        as="h2"
                        path={`spanskAlicanteVision.sections.${index}.heading`}
                        value={section.heading}
                        onCommit={headingCommit}
                        className="font-heading text-2xl lg:text-3xl font-bold text-ink mb-4"
                      />
                      <EditableText
                        as="p"
                        path={`spanskAlicanteVision.sections.${index}.body`}
                        value={section.body}
                        onCommit={bodyCommit}
                        multiline
                        className="text-gray-600 text-lg leading-relaxed"
                      />
                    </div>
                  </AnimateIn>
                )
              })}
            </div>

            <AnimateIn variant="fadeLeft" delay={160}>
              <aside className="bg-surface border border-gray-100 rounded-[2rem] p-8 sticky top-28">
                <h2 className="font-heading text-2xl font-bold text-ink mb-6">{hvorfor.sidebarHeading}</h2>
                <ul className="space-y-4 mb-8">
                  {(vision.highlights || []).map((item, index) => (
                    <HighlightItem key={`highlight-${index}`} item={item} index={index} />
                  ))}
                </ul>
                <div className="flex flex-col gap-3">
                  <a
                    href="/spansk-i-alicante"
                    onClick={() => trackEvent('cta_click', { location: 'spansk_alicante_hvorfor', cta: 'tilbake_til_programmet' })}
                    className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors duration-200 cursor-pointer"
                  >
                    {hvorfor.backLabel}
                  </a>
                  <a
                    href="/kontakt"
                    onClick={() => trackEvent('cta_click', { location: 'spansk_alicante_hvorfor', cta: 'kontakt' })}
                    className="inline-flex items-center justify-center gap-2 px-6 py-4 border-2 border-primary-200 text-primary-600 font-semibold rounded-xl hover:bg-primary-50 transition-colors duration-200 cursor-pointer"
                  >
                    <EditableText as="span" path="spanskAlicantePage.ctaSecondary" value={page.ctaSecondary} className="inline" />
                  </a>
                </div>
              </aside>
            </AnimateIn>
          </div>
        </div>
      </section>

      <PageEndNav current="/spansk-i-alicante/hvorfor" />
    </>
  )
}
