import AnimateIn from './AnimateIn'
import { trackEvent } from '../lib/analytics'
import useContent from '../hooks/useContent'

export default function PageEndNav({ current }) {
  const nav = useContent('pageEndNav')
  const otherSections = (nav.sections || []).filter(s => s.href !== current)

  return (
    <section className="py-16 lg:py-20 bg-surface border-t border-gray-100">
      <div className="container-xl">
        <AnimateIn>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            {/* Back to home */}
            <a
              href="/"
              className="group inline-flex items-center gap-3 text-ink font-semibold hover:text-primary-600 transition-colors"
            >
              <span className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center group-hover:bg-primary-600 group-hover:border-primary-600 group-hover:text-white transition-all duration-200 shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
              </span>
              {nav.backLabel}
            </a>

            {/* Explore other sections */}
            <div className="flex flex-wrap gap-2">
              {otherSections.map(s => (
                <a
                  key={s.href}
                  href={s.href}
                  onClick={() => trackEvent('cta_click', { location: 'page_end_nav', cta: s.href })}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:text-primary-600 hover:border-primary-200 hover:shadow-sm transition-all duration-200"
                >
                  {s.label}
                </a>
              ))}
            </div>

            {/* Contact CTA */}
            <a
              href="/kontakt"
              onClick={() => trackEvent('cta_click', { location: 'page_end_nav', cta: 'kontakt' })}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors duration-200 shadow-sm shrink-0 cursor-pointer"
            >
              {nav.contactLabel}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
        </AnimateIn>
      </div>
    </section>
  )
}
