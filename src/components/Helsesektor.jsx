import AnimateIn from './AnimateIn'
import { trackEvent } from '../lib/analytics'
import useContent from '../hooks/useContent'
import EditableText, { createArrayItemCommitter } from './editable/EditableText'
import healthTeamPhoto from '../assets/helse/health-team.jpg'

export default function Helsesektor() {
  const c = useContent('helsesektorComp')

  return (
    <section id="helsesektor" className="scroll-mt-28 py-24 lg:py-32 bg-surface" aria-labelledby="helsesektor-heading">
      <div className="container-xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <AnimateIn variant="fadeRight">
            <div>
              <EditableText
                as="span"
                path="helsesektorComp.label"
                value={c.label}
                className="inline-block text-primary-600 font-semibold text-sm tracking-wide uppercase mb-3"
              />
              <EditableText
                id="helsesektor-heading"
                as="h2"
                path="helsesektorComp.heading"
                value={c.heading}
                className="font-heading text-3xl lg:text-4xl font-bold text-ink mb-6 leading-tight"
              />
              <EditableText
                as="p"
                path="helsesektorComp.description"
                value={c.description}
                multiline
                className="text-gray-600 text-lg leading-relaxed mb-8"
              />

              <div className="grid sm:grid-cols-3 gap-4 mb-8">
                {(c.stats || []).map((s, index) => {
                  const commitValue = createArrayItemCommitter({
                    basePath: 'helsesektorComp.stats',
                    fallbackItems: c.stats || [],
                    index,
                    field: 'value',
                  })
                  const commitLabel = createArrayItemCommitter({
                    basePath: 'helsesektorComp.stats',
                    fallbackItems: c.stats || [],
                    index,
                    field: 'label',
                  })

                  return (
                    <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-4">
                      <EditableText
                        as="p"
                        path={`helsesektorComp.stats.${index}.value`}
                        value={s.value}
                        onCommit={commitValue}
                        className="font-heading text-2xl font-bold text-primary-700"
                      />
                      <EditableText
                        as="p"
                        path={`helsesektorComp.stats.${index}.label`}
                        value={s.label}
                        onCommit={commitLabel}
                        className="text-xs text-gray-500"
                      />
                    </div>
                  )
                })}
              </div>

              <ul className="space-y-5 mb-10" role="list">
                {(c.features || []).map((f, index) => {
                  const commitTitle = createArrayItemCommitter({
                    basePath: 'helsesektorComp.features',
                    fallbackItems: c.features || [],
                    index,
                    field: 'title',
                  })
                  const commitDescription = createArrayItemCommitter({
                    basePath: 'helsesektorComp.features',
                    fallbackItems: c.features || [],
                    index,
                    field: 'description',
                  })

                  return (
                    <li key={f.title} className="flex gap-4">
                      <div className="mt-0.5 shrink-0 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                          <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div>
                        <EditableText
                          as="h3"
                          path={`helsesektorComp.features.${index}.title`}
                          value={f.title}
                          onCommit={commitTitle}
                          className="font-heading font-semibold text-ink text-base mb-0.5"
                        />
                        <EditableText
                          as="p"
                          path={`helsesektorComp.features.${index}.description`}
                          value={f.description}
                          onCommit={commitDescription}
                          multiline
                          className="text-gray-500 text-sm leading-relaxed"
                        />
                      </div>
                    </li>
                  )
                })}
              </ul>

              {c.blockquote && (
                <blockquote className="mb-10 rounded-2xl border border-primary-100 bg-white p-5 text-sm leading-relaxed text-gray-600">
                  “
                  <EditableText
                    as="span"
                    path="helsesektorComp.blockquote.text"
                    value={c.blockquote.text}
                    className="inline"
                  />
                  ”
                  <footer className="mt-3 font-semibold text-ink">
                    — <EditableText as="span" path="helsesektorComp.blockquote.author" value={c.blockquote.author} className="inline" />
                  </footer>
                  {c.blockquote.ctaHref && c.blockquote.ctaLabel && (
                    <a
                      href={c.blockquote.ctaHref}
                      onClick={() => trackEvent('cta_click', { location: 'helsesektor_testimonial', cta: 'les_hele_intervjuet' })}
                      className="mt-4 inline-flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700 transition-colors"
                    >
                      <EditableText as="span" path="helsesektorComp.blockquote.ctaLabel" value={c.blockquote.ctaLabel} className="inline" />
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </a>
                  )}
                </blockquote>
              )}

              <a
                href="/kontakt"
                onClick={() => trackEvent('cta_click', { location: 'helsesektor', cta: 'be_om_kandidater' })}
                className="inline-flex items-center gap-2 px-7 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors duration-200 shadow-md cursor-pointer"
              >
                <EditableText as="span" path="helsesektorComp.ctaLabel" value={c.ctaLabel} className="inline" />
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </AnimateIn>

          <AnimateIn variant="fadeLeft" delay={200}>
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={healthTeamPhoto}
                  alt="Helsepersonell i opplæring gjennom Global Working"
                  className="w-full object-cover"
                  loading="lazy"
                  width="640"
                  height="480"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-900/40 via-transparent to-transparent" aria-hidden="true" />
              </div>

              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-5 border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                  </div>
                  <div>
                    <EditableText
                      as="div"
                      path="helsesektorComp.groupsValue"
                      value={c.groupsValue}
                      className="font-heading font-bold text-2xl text-ink"
                    />
                    <EditableText
                      as="div"
                      path="helsesektorComp.groupsLabel"
                      value={c.groupsLabel}
                      className="text-gray-400 text-xs"
                    />
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
