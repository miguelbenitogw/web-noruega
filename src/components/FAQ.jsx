import { useState } from 'react'
import AnimateIn from './AnimateIn'
import useContent from '../hooks/useContent'

function AccordionItem({ faq, isOpen, onToggle }) {
  return (
    <div className={`border rounded-2xl transition-all duration-200 ${isOpen ? 'border-primary-200 bg-primary-50/30 shadow-sm' : 'border-gray-100 bg-white'}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left cursor-pointer"
        aria-expanded={isOpen}
      >
        <span className={`font-heading font-semibold text-sm lg:text-base transition-colors ${isOpen ? 'text-primary-700' : 'text-ink'}`}>
          {faq.q}
        </span>
        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-primary-600 rotate-180' : 'bg-gray-100'}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isOpen ? 'white' : '#64748b'} strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
        <p className="px-6 pb-5 text-gray-500 text-sm leading-relaxed">{faq.a}</p>
      </div>
    </div>
  )
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0)
  const c = useContent('faq')

  return (
    <section className="py-24 lg:py-32 bg-white" aria-labelledby="faq-heading">
      <div className="container-xl">
        <div className="grid lg:grid-cols-5 gap-14 items-start">
          <div className="lg:col-span-2 lg:sticky lg:top-28">
            <AnimateIn>
              <span className="inline-block text-primary-600 font-semibold text-sm tracking-wide uppercase mb-3">
                {c.label}
              </span>
              <h2 id="faq-heading" className="font-heading text-3xl lg:text-4xl font-bold text-ink mb-5 leading-tight">
                {c.heading}
              </h2>
              <p className="text-gray-600 leading-relaxed mb-8">{c.description}</p>
              <a
                href="/kontakt"
                className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700 transition-colors"
              >
                {c.ctaText}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
            </AnimateIn>
          </div>

          <div className="lg:col-span-3 space-y-3">
            {(c.items || []).map((faq, i) => (
              <AnimateIn key={i} variant="fadeUp" delay={i * 80}>
                <AccordionItem
                  faq={faq}
                  isOpen={openIndex === i}
                  onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
                />
              </AnimateIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
