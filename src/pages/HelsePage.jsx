import AnimateIn from '../components/AnimateIn'
import { IMAGES, img } from '../assets/images'
import Helsesektor from '../components/Helsesektor'
import GodeGrunner from '../components/GodeGrunner'
import Nyheter from '../components/Nyheter'
import PageEndNav from '../components/PageEndNav'
import { trackEvent } from '../lib/analytics'
import useContent from '../hooks/useContent'
import EditableText, { createArrayItemCommitter, useVisualEditEnabled } from '../components/editable/EditableText'
import InlineRichText from '../components/editable/InlineRichText'

function InlineEditableParagraph({
  path,
  value,
  onCommit,
  className,
  linkClassName,
  as = 'p',
  ...rest
}) {
  const visualEditEnabled = useVisualEditEnabled()

  if (visualEditEnabled) {
    return (
      <EditableText
        as={as}
        path={path}
        value={value}
        onCommit={onCommit}
        multiline
        className={className}
        {...rest}
      />
    )
  }

  return (
    <InlineRichText
      as={as}
      value={value}
      className={className}
      linkClassName={linkClassName}
      {...rest}
    />
  )
}

function PhaseDescription({ index, description, onCommit, phases }) {
  const visualEditEnabled = useVisualEditEnabled()
  const commitPhaseDescription = onCommit || createArrayItemCommitter({
    basePath: 'helsePhases.phases',
    fallbackItems: phases || [],
    index,
    field: 'description',
  })
  const paragraphs = (description || '').split('\n\n').filter(Boolean)

  if (visualEditEnabled || paragraphs.length <= 1) {
    return (
      <InlineEditableParagraph
        as="p"
        path={`helsePhases.phases.${index}.description`}
        value={description}
        onCommit={commitPhaseDescription}
        className="!text-gray-600 leading-relaxed mb-4"
      />
    )
  }

  return (
    <>
      {paragraphs.map((para, pi) => (
        <p key={pi} className="text-gray-600 leading-relaxed mb-3 last:mb-4">{para}</p>
      ))}
    </>
  )
}

export default function HelsePage() {
  const hero = useContent('helseHero')
  const phases = useContent('helsePhases')
  const partnership = useContent('helsePartnership')

  return (
    <>
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-br from-navy via-primary-900 to-primary-800 pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(30,115,190,0.3),transparent_60%)]" aria-hidden="true" />
        <div className="container-xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <AnimateIn>
              <nav className="text-blue-200/70 text-sm mb-6" aria-label="Brødsmuler">
                <a href="/" className="hover:text-white transition-colors">Hjem</a>
                <span className="mx-2">/</span>
                <span className="text-white">{hero.breadcrumb}</span>
              </nav>
              <EditableText
                as="h1"
                path="helseHero.h1"
                value={hero.h1}
                className="font-heading text-3xl lg:text-5xl font-bold text-white mb-4 leading-tight"
              />
              <InlineEditableParagraph
                as="p"
                path="helseHero.description"
                value={hero.description}
                className="!text-blue-100 text-lg max-w-2xl leading-relaxed"
                linkClassName="!text-blue-50 underline decoration-blue-200 underline-offset-2 transition-colors hover:!text-white hover:!decoration-blue-100"
              />
            </AnimateIn>
            <AnimateIn variant="fadeLeft" delay={150} className="hidden lg:block">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                <img
                  src={img(hero.imageUrl || IMAGES.enfermeria, 800)}
                  alt={hero.imageAlt || 'Helsepersonell i opplæring gjennom Global Working'}
                  className="w-full h-80 object-cover object-top"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/40 via-transparent to-transparent" aria-hidden="true" />
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>

      <Helsesektor />

      {/* 3-Phase Recruitment Process */}
      <section className="py-24 lg:py-32 bg-white" aria-labelledby="faser-heading">
        <div className="container-xl">
          <AnimateIn>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <EditableText
                as="span"
                path="helsePhases.label"
                value={phases.label}
                className="inline-block text-primary-600 font-semibold text-sm tracking-wide uppercase mb-3"
              />
              <EditableText
                as="h2"
                path="helsePhases.heading"
                value={phases.heading}
                className="font-heading text-3xl lg:text-4xl font-bold text-ink mb-5 leading-tight"
              />
              <InlineEditableParagraph
                as="p"
                path="helsePhases.description"
                value={phases.description}
                className="!text-gray-600 text-lg leading-relaxed"
              />
            </div>
          </AnimateIn>

          <div className="space-y-8 max-w-4xl mx-auto">
            {(phases.phases || []).map((phase, i) => {
              const commitPhaseTitle = createArrayItemCommitter({
                basePath: 'helsePhases.phases',
                fallbackItems: phases.phases || [],
                index: i,
                field: 'title',
              })
              const commitPhaseDescription = createArrayItemCommitter({
                basePath: 'helsePhases.phases',
                fallbackItems: phases.phases || [],
                index: i,
                field: 'description',
              })

              return (
                <AnimateIn key={phase.number} variant="fadeUp" delay={i * 120}>
                  <div className="relative pl-16 lg:pl-20">
                    {i < (phases.phases || []).length - 1 && (
                      <div className="absolute left-[1.65rem] lg:left-[1.9rem] top-14 bottom-0 w-0.5 bg-primary-100" aria-hidden="true" />
                    )}
                    <div className="absolute left-0 top-0 w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-primary-600 text-white flex items-center justify-center font-heading text-xl font-bold shadow-lg shadow-primary-200">
                      {phase.number}
                    </div>

                    <div className="bg-surface rounded-2xl border border-gray-100 p-7 lg:p-8">
                      <h3 className="font-heading text-xl font-bold text-ink mb-3">
                        <EditableText
                          as="span"
                          path={`helsePhases.phases.${i}.title`}
                          value={phase.title}
                          onCommit={commitPhaseTitle}
                          className="inline"
                        />
                      </h3>
                      <PhaseDescription
                        index={i}
                        description={phase.description}
                        onCommit={commitPhaseDescription}
                        phases={phases.phases}
                      />

                      {phase.formats && (
                        <div className="grid sm:grid-cols-3 gap-3 mt-5">
                          {phase.formats.map((f) => (
                            <div key={f.label} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                              <div className="font-heading font-bold text-primary-700 text-sm mb-1">{f.duration}</div>
                              <div className="text-gray-500 text-xs">{f.label}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </AnimateIn>
              )
            })}
          </div>
        </div>
      </section>

      {/* Partnership Model */}
      <section className="py-24 lg:py-32 bg-surface">
        <div className="container-xl">
          <div className="max-w-3xl mx-auto text-center">
            <AnimateIn>
              <EditableText
                as="span"
                path="helsePartnership.label"
                value={partnership.label}
                className="inline-block text-primary-600 font-semibold text-sm tracking-wide uppercase mb-3"
              />
              <EditableText
                as="h2"
                path="helsePartnership.heading"
                value={partnership.heading}
                className="font-heading text-3xl lg:text-4xl font-bold text-ink mb-6 leading-tight"
              />
              <div className="space-y-4 text-gray-600 text-lg leading-relaxed mb-10">
                <InlineEditableParagraph
                  as="p"
                  path="helsePartnership.p1"
                  value={partnership.p1}
                  className="!text-gray-600"
                />
                <InlineEditableParagraph
                  as="p"
                  path="helsePartnership.p2"
                  value={partnership.p2}
                  className="!text-gray-600"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/kontakt"
                  onClick={() => trackEvent('cta_click', { location: 'helse_partnership', cta: 'kontakt_oss' })}
                  className="inline-flex items-center justify-center px-7 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors duration-200 shadow-md cursor-pointer"
                >
                  <EditableText as="span" path="helsePartnership.cta1" value={partnership.cta1} className="inline" />
                </a>
                <a
                  href="/talentportalen"
                  onClick={() => trackEvent('cta_click', { location: 'helse_partnership', cta: 'se_portalen' })}
                  className="inline-flex items-center justify-center px-7 py-4 border-2 border-primary-200 text-primary-600 font-semibold rounded-xl hover:bg-primary-50 transition-colors duration-200 cursor-pointer"
                >
                  <EditableText as="span" path="helsePartnership.cta2" value={partnership.cta2} className="inline" />
                </a>
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>

      <GodeGrunner />
      <Nyheter />
      <PageEndNav current="/helse" />
    </>
  )
}
