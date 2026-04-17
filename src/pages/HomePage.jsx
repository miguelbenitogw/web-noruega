import Hero from '../components/Hero'
import Nyheter from '../components/Nyheter'
import CTABanner from '../components/CTABanner'
import AnimateIn from '../components/AnimateIn'
import SpanskAlicanteTeaser from '../components/SpanskAlicanteTeaser'
import EditableText, { createArrayItemCommitter, useVisualEditEnabled } from '../components/editable/EditableText'
import InlineRichText from '../components/editable/InlineRichText'
import { trackEvent } from '../lib/analytics'
import useContent from '../hooks/useContent'
import { IMAGES, img } from '../assets/images'

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

function SummaryCard({ section, delay, index, sections, readMoreLabel }) {
  const titleCommitter = createArrayItemCommitter({
    basePath: 'homeServices.sections',
    fallbackItems: sections,
    index,
    field: 'title',
  })
  const descriptionCommitter = createArrayItemCommitter({
    basePath: 'homeServices.sections',
    fallbackItems: sections,
    index,
    field: 'description',
  })

  return (
    <AnimateIn variant="fadeUp" delay={delay}>
      <a
        href={section.href}
        onClick={() => trackEvent('cta_click', { location: 'landing_summary', cta: section.href })}
        className="group block h-full bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-primary-100 transition-all duration-300 p-7"
      >
        <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center mb-5 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <EditableText
          as="h3"
          path={`homeServices.sections.${index}.title`}
          value={section.title}
          onCommit={titleCommitter}
          className="font-heading text-lg font-bold text-ink mb-2 group-hover:text-primary-600 transition-colors"
        />
        <EditableText
          as="p"
          path={`homeServices.sections.${index}.description`}
          value={section.description}
          onCommit={descriptionCommitter}
          multiline
          className="text-gray-500 text-sm leading-relaxed mb-4"
        />
        <span className="inline-flex items-center gap-1.5 text-primary-600 font-semibold text-sm">
          {readMoreLabel}
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
  const hs = useContent('homeServices')
  const hHealth = useContent('homeHealth')
  const hContact = useContent('homeContact')
  const contacts = useContent('contacts')

  const createContactCommitter = (index, field) => createArrayItemCommitter({
    basePath: 'contacts',
    fallbackItems: contacts,
    index,
    field,
  })

  const resolveContactPhoto = (contact = {}) => {
    if (contact.imageUrl) return contact.imageUrl
    const lower = String(contact.name || '').toLowerCase()
    if (lower.includes('miriam')) return IMAGES.contactMiriam
    if (lower.includes('gro')) return IMAGES.contactGro
    return null
  }

  return (
    <>
      <Hero />

      {/* Section Summaries */}
      <section className="py-24 lg:py-32 bg-white" aria-labelledby="tilbud-heading">
        <div className="container-xl">
          <AnimateIn className="text-center max-w-3xl mx-auto mb-16">
            <EditableText
              as="span"
              path="homeServices.label"
              value={hs.label}
              className="inline-block text-primary-600 font-bold text-xs uppercase tracking-[0.2em] mb-4"
            />
            <EditableText
              as="h2"
              path="homeServices.heading"
              value={hs.heading}
              className="font-heading text-3xl lg:text-4xl xl:text-5xl font-bold text-ink mb-5 leading-tight"
            />
            <InlineEditableParagraph
              as="p"
              path="homeServices.description"
              value={hs.description}
              className="!text-gray-600 text-lg leading-relaxed"
            />
          </AnimateIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(hs.sections || []).map((section, i) => (
              <SummaryCard key={section.href} section={section} delay={i * 100} index={i} sections={hs.sections || []} readMoreLabel={hs.readMoreLabel} />
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
              <EditableText
                as="span"
                path="homeHealth.label"
                value={hHealth.label}
                className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-sm font-semibold mb-5"
              />
              <EditableText
                as="h2"
                path="homeHealth.heading"
                value={hHealth.heading}
                className="font-heading text-3xl lg:text-4xl font-bold text-white mb-5 leading-tight"
              />
              <InlineEditableParagraph
                as="p"
                path="homeHealth.description"
                value={hHealth.description}
                className="!text-blue-100 text-lg leading-relaxed mb-8"
                linkClassName="!text-blue-50 underline decoration-blue-200 underline-offset-2 transition-colors hover:!text-white hover:!decoration-blue-100"
              />
              <a
                href="/helse"
                onClick={() => trackEvent('cta_click', { location: 'landing_health', cta: 'les_mer_helse' })}
                className="inline-flex items-center gap-2 px-7 py-4 bg-cta text-white font-semibold rounded-xl hover:bg-cta-600 transition-all duration-200 shadow-lg hover:-translate-y-0.5 cursor-pointer"
              >
                <EditableText as="span" path="homeHealth.cta" value={hHealth.cta} className="inline" />
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
            </AnimateIn>

            <AnimateIn variant="fadeLeft" delay={150}>
              <div className="rounded-2xl overflow-hidden border border-white/15 bg-white/5">
                  <img
                    src={img(hHealth.imageUrl || IMAGES.homeMetricsTeam, 1200)}
                    alt={hHealth.imageAlt || 'Global Working team i samarbeid med norske arbeidsgivere'}
                    className="w-full h-[360px] lg:h-[420px] object-cover"
                    loading="lazy"
                  />
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>

      <Nyheter />

      <SpanskAlicanteTeaser />

      <CTABanner />

      {/* Quick Contact */}
      <section className="py-24 lg:py-32 bg-white" aria-labelledby="quick-contact-heading">
        <div className="container-xl">
          <div className="max-w-3xl mx-auto text-center">
            <AnimateIn>
              <EditableText
                as="span"
                path="homeContact.label"
                value={hContact.label}
                className="inline-block text-primary-600 font-semibold text-sm tracking-wide uppercase mb-3"
              />
              <EditableText
                as="h2"
                path="homeContact.heading"
                value={hContact.heading}
                className="font-heading text-3xl lg:text-4xl font-bold text-ink mb-5 leading-tight"
              />
              <InlineEditableParagraph
                as="p"
                path="homeContact.description"
                value={hContact.description}
                className="!text-gray-600 text-lg leading-relaxed mb-12"
              />
            </AnimateIn>

            <div className="grid sm:grid-cols-2 gap-5 mb-10">
              {(contacts || []).map((c, i) => (
                <AnimateIn key={`${c.name}-${i}`} variant="fadeUp" delay={i * 100}>
                  <div className="bg-surface rounded-2xl p-6 border border-gray-100 text-left">
                    <div className="flex items-center gap-4 mb-4">
                      {resolveContactPhoto(c) ? (
                        <img
                          src={resolveContactPhoto(c)}
                          alt={c.name}
                          className="w-12 h-12 rounded-xl object-cover shrink-0 shadow-lg shadow-primary-200"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-primary-200">
                          <span className="font-heading font-bold text-white text-lg">{c.name.charAt(0)}</span>
                        </div>
                      )}
                      <div>
                        <EditableText
                          as="div"
                          path={`contacts.${i}.name`}
                          value={c.name}
                          onCommit={createContactCommitter(i, 'name')}
                          className="font-heading font-bold text-ink text-sm"
                        />
                        <EditableText
                          as="div"
                          path={`contacts.${i}.role`}
                          value={c.role}
                          onCommit={createContactCommitter(i, 'role')}
                          className="text-gray-400 text-[10px] uppercase font-bold tracking-wider"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <EditableText
                        as="div"
                        path={`contacts.${i}.email`}
                        value={c.email}
                        onCommit={createContactCommitter(i, 'email')}
                        className="block text-primary-600 text-sm"
                      />
                      <EditableText
                        as="div"
                        path={`contacts.${i}.phone`}
                        value={c.phone}
                        onCommit={createContactCommitter(i, 'phone')}
                        className="block text-gray-500 text-sm"
                      />
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
                <EditableText as="span" path="homeContact.cta" value={hContact.cta} className="inline" />
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
