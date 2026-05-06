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

export default function LivetSomStudentPage() {
  const page = useContent('livetSomStudent')
  const contacts = useContent('contacts')

  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-navy via-primary-900 to-primary-800 pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(30,115,190,0.25),transparent_60%)]" aria-hidden="true" />
        <div className="container-xl relative z-10">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
            <AnimateIn>
              <nav aria-label="Brødsmuler" className="mb-6">
                <ol className="flex items-center gap-2 text-sm text-blue-200">
                  <li><a href="/" className="hover:text-white transition-colors">Hjem</a></li>
                  <li aria-hidden="true">/</li>
                  <li><a href="/spansk-i-alicante" className="hover:text-white transition-colors">Spansk i Alicante</a></li>
                  <li aria-hidden="true">/</li>
                  <li className="text-white font-medium">
                    <EditableText as="span" path="livetSomStudent.breadcrumb" value={page.breadcrumb} className="inline" />
                  </li>
                </ol>
              </nav>

              <EditableText
                as="h1"
                path="livetSomStudent.heroTitle"
                value={page.heroTitle}
                className="font-heading text-3xl lg:text-5xl font-bold text-white leading-tight mb-4"
              />
              <EditableText
                as="p"
                path="livetSomStudent.heroSubtitle"
                value={page.heroSubtitle}
                multiline
                className="text-xl text-blue-100 leading-relaxed max-w-2xl"
              />
            </AnimateIn>

            <AnimateIn variant="fadeLeft" delay={150}>
              <div className="rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl">
                <EditableImage
                  path="livetSomStudent.heroImageUrl"
                  src={img(page.heroImageUrl || IMAGES.spanskAlicanteBeachPalms)}
                  alt={page.heroImageAlt || 'Studentlivet i Alicante'}
                  className="w-full h-[360px] lg:h-[460px] object-cover"
                />
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* Intro: Livet som student i Alicante */}
      <section className="py-24 lg:py-28 bg-white">
        <div className="container-xl">
          <div className="max-w-3xl mx-auto">
            <AnimateIn>
              <EditableText
                as="h2"
                path="livetSomStudent.introTitle"
                value={page.introTitle}
                className="font-heading text-3xl lg:text-4xl font-bold text-ink mb-6 leading-tight"
              />
              <EditableText
                as="p"
                path="livetSomStudent.introP1"
                value={page.introP1}
                multiline
                className="text-gray-600 text-lg leading-relaxed mb-4"
              />
              <EditableText
                as="p"
                path="livetSomStudent.introP2"
                value={page.introP2}
                multiline
                className="text-gray-600 text-lg leading-relaxed"
              />
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* Undervisningen */}
      <section className="py-24 lg:py-28 bg-surface">
        <div className="container-xl">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-16 items-center">
            <AnimateIn variant="fadeRight">
              <EditableText
                as="h2"
                path="livetSomStudent.undervisningTitle"
                value={page.undervisningTitle}
                className="font-heading text-3xl lg:text-4xl font-bold text-ink mb-6 leading-tight"
              />
              <EditableText
                as="p"
                path="livetSomStudent.undervisningP1"
                value={page.undervisningP1}
                multiline
                className="text-gray-600 leading-relaxed mb-4"
              />
              <EditableText
                as="p"
                path="livetSomStudent.undervisningP2"
                value={page.undervisningP2}
                multiline
                className="text-gray-600 leading-relaxed mb-6"
              />
              <a
                href="/spansk-i-alicante/hvorfor"
                onClick={() => trackEvent('cta_click', { location: 'livet_undervisning', cta: 'hvorfor' })}
                className="inline-flex items-center gap-2 text-primary-600 font-semibold text-sm hover:text-primary-700 transition-colors"
              >
                Les mer om norskundervisningen
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </a>
            </AnimateIn>

            <AnimateIn variant="fadeLeft" delay={120}>
              <div className="rounded-[2rem] overflow-hidden border border-gray-100 shadow-lg bg-white">
                <EditableImage
                  path="livetSomStudent.undervisningImageUrl"
                  src={img(page.undervisningImageUrl || IMAGES.spanskAlicantePromenade)}
                  alt={page.undervisningImageAlt || 'Undervisning i Alicante'}
                  className="w-full h-[360px] object-cover"
                  loading="lazy"
                />
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* Norsk for helsesektoren */}
      <section className="py-24 lg:py-28 bg-white">
        <div className="container-xl">
          <div className="max-w-3xl mx-auto">
            <AnimateIn>
              <EditableText
                as="h2"
                path="livetSomStudent.helseTitle"
                value={page.helseTitle}
                className="font-heading text-3xl lg:text-4xl font-bold text-ink mb-6 leading-tight"
              />
              <EditableText
                as="p"
                path="livetSomStudent.helseP1"
                value={page.helseP1}
                multiline
                className="text-gray-600 leading-relaxed mb-4"
              />
              <EditableText
                as="p"
                path="livetSomStudent.helseP2"
                value={page.helseP2}
                multiline
                className="text-gray-600 leading-relaxed mb-4"
              />
              <EditableText
                as="p"
                path="livetSomStudent.helseP3"
                value={page.helseP3}
                multiline
                className="text-gray-600 leading-relaxed mb-4"
              />
              <BulletList items={page.helseItems || []} basePath="livetSomStudent.helseItems" />
              <EditableText
                as="p"
                path="livetSomStudent.helseP4"
                value={page.helseP4}
                multiline
                className="text-gray-600 leading-relaxed mt-6"
              />
            </AnimateIn>
          </div>

          <AnimateIn variant="fadeUp" delay={120}>
            <div className="mt-12 max-w-4xl mx-auto rounded-[2rem] overflow-hidden border border-gray-100 shadow-lg">
              <EditableImage
                path="livetSomStudent.helseImageUrl"
                src={img(page.helseImageUrl || IMAGES.spanskAlicantePromenade)}
                alt={page.helseImageAlt || 'Helsenorsk undervisning'}
                className="w-full h-[360px] object-cover"
                loading="lazy"
              />
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* Samtaleassistenter */}
      <section className="py-24 lg:py-28 bg-surface">
        <div className="container-xl">
          <div className="max-w-3xl mx-auto">
            <AnimateIn>
              <EditableText
                as="h2"
                path="livetSomStudent.samtaleTitle"
                value={page.samtaleTitle}
                className="font-heading text-3xl lg:text-4xl font-bold text-ink mb-6 leading-tight"
              />
              <EditableText
                as="p"
                path="livetSomStudent.samtaleP1"
                value={page.samtaleP1}
                multiline
                className="text-gray-600 leading-relaxed mb-4"
              />
              <EditableText
                as="p"
                path="livetSomStudent.samtaleP2"
                value={page.samtaleP2}
                multiline
                className="text-gray-600 leading-relaxed mb-4"
              />
              <BulletList items={page.samtaleItems || []} basePath="livetSomStudent.samtaleItems" />
              <EditableText
                as="p"
                path="livetSomStudent.samtaleP3"
                value={page.samtaleP3}
                multiline
                className="text-gray-600 leading-relaxed mt-6 mb-4"
              />
              <EditableText
                as="p"
                path="livetSomStudent.samtaleP4"
                value={page.samtaleP4}
                multiline
                className="text-gray-600 leading-relaxed mb-6"
              />
              <a
                href="/spansk-i-alicante"
                onClick={() => trackEvent('cta_click', { location: 'livet_samtale', cta: 'spansk_alicante' })}
                className="inline-flex items-center gap-2 text-primary-600 font-semibold text-sm hover:text-primary-700 transition-colors"
              >
                Les mer om Spansk i Alicante-programmet
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </a>
            </AnimateIn>
          </div>

          <AnimateIn variant="fadeUp" delay={120}>
            <div className="mt-12 max-w-4xl mx-auto rounded-[2rem] overflow-hidden border border-gray-100 shadow-lg">
              <EditableImage
                path="livetSomStudent.samtaleImageUrl"
                src={img(page.samtaleImageUrl || IMAGES.spanskAlicantePromenade)}
                alt={page.samtaleImageAlt || 'Samtaleassistenter i Alicante'}
                className="w-full h-[360px] object-cover"
                loading="lazy"
              />
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* Fellesskap og aktiviteter */}
      <section className="py-24 lg:py-28 bg-white">
        <div className="container-xl">
          <div className="max-w-3xl mx-auto">
            <AnimateIn>
              <EditableText
                as="h2"
                path="livetSomStudent.fellesskapTitle"
                value={page.fellesskapTitle}
                className="font-heading text-3xl lg:text-4xl font-bold text-ink mb-6 leading-tight"
              />
              <EditableText
                as="p"
                path="livetSomStudent.fellesskapP1"
                value={page.fellesskapP1}
                multiline
                className="text-gray-600 leading-relaxed mb-4"
              />
              <EditableText
                as="p"
                path="livetSomStudent.fellesskapP2"
                value={page.fellesskapP2}
                multiline
                className="text-gray-600 leading-relaxed mb-4"
              />
              <EditableText
                as="p"
                path="livetSomStudent.fellesskapLabel"
                value={page.fellesskapLabel}
                className="text-ink font-semibold mb-3"
              />
              <BulletList items={page.fellesskapItems || []} basePath="livetSomStudent.fellesskapItems" />
              <EditableText
                as="p"
                path="livetSomStudent.fellesskapP3"
                value={page.fellesskapP3}
                multiline
                className="text-gray-600 leading-relaxed mt-6"
              />
            </AnimateIn>
          </div>

          <AnimateIn variant="fadeUp" delay={120}>
            <div className="mt-12 max-w-4xl mx-auto rounded-[2rem] overflow-hidden border border-gray-100 shadow-lg">
              <EditableImage
                path="livetSomStudent.fellesskapImageUrl"
                src={img(page.fellesskapImageUrl || IMAGES.spanskAlicanteBeachPalms)}
                alt={page.fellesskapImageAlt || 'Fellesskap og aktiviteter i Alicante'}
                className="w-full h-[360px] object-cover"
                loading="lazy"
              />
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* CTA: Ønsker du å bli kjent med våre kandidater? */}
      <section className="py-24 lg:py-28 bg-gradient-to-br from-primary-50 via-white to-surface">
        <div className="container-xl">
          <AnimateIn>
            <div className="max-w-3xl mx-auto text-center">
              <span className="inline-block text-primary-600 font-semibold text-sm tracking-wide uppercase mb-3">
                {page.ctaLabel}
              </span>
              <EditableText
                as="h2"
                path="livetSomStudent.ctaTitle"
                value={page.ctaTitle}
                className="font-heading text-3xl lg:text-4xl font-bold text-ink mb-6 leading-tight"
              />
              <EditableText
                as="p"
                path="livetSomStudent.ctaP1"
                value={page.ctaP1}
                multiline
                className="text-gray-600 leading-relaxed mb-4"
              />
              <EditableText
                as="p"
                path="livetSomStudent.ctaP2"
                value={page.ctaP2}
                multiline
                className="text-gray-600 leading-relaxed mb-8"
              />

              <div className="grid sm:grid-cols-2 gap-4 max-w-lg mx-auto mb-8">
                {(contacts || []).map((contact) => (
                  <div key={contact.name} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-left">
                    <div className="font-heading font-bold text-ink text-sm mb-0.5">{contact.name}</div>
                    <a href={`mailto:${contact.email}`} className="text-primary-600 text-xs hover:underline block">{contact.email}</a>
                    <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="text-gray-500 text-xs hover:text-primary-600 transition-colors block">{contact.phone}</a>
                  </div>
                ))}
              </div>

              <a
                href="/kontakt"
                onClick={() => trackEvent('cta_click', { location: 'livet_som_student_cta', cta: 'kontakt' })}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors duration-200 shadow-md cursor-pointer"
              >
                {page.ctaButton}
              </a>
            </div>
          </AnimateIn>
        </div>
      </section>

      <PageEndNav current="/spansk-i-alicante/livet-som-student" />
    </>
  )
}
