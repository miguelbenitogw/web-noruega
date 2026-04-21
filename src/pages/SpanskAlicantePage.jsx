import AnimateIn from '../components/AnimateIn'
import EditableText, { useVisualEditEnabled } from '../components/editable/EditableText'
import InlineRichText from '../components/editable/InlineRichText'
import PageEndNav from '../components/PageEndNav'
import { IMAGES, img } from '../assets/images'
import { trackEvent } from '../lib/analytics'
import useContent from '../hooks/useContent'

function InlineEditableParagraph({
  path,
  value,
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
        multiline
        inputClassName="min-h-[220px] resize-y leading-relaxed"
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

function SimpleBulletList({ items, basePath }) {
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

function ProcessStep({ step, index }) {
  return (
    <div className="bg-surface border border-gray-100 rounded-2xl p-5">
      <div className="w-10 h-10 rounded-xl bg-primary-600 text-white font-heading font-bold flex items-center justify-center mb-4">
        {index + 1}
      </div>
      <EditableText
        as="p"
        path={`spanskAlicantePage.processSteps.${index}`}
        value={step}
        className="font-medium text-ink leading-relaxed"
      />
    </div>
  )
}

export default function SpanskAlicantePage() {
  const page = useContent('spanskAlicantePage')

  return (
    <>
      <section className="relative bg-gradient-to-br from-navy via-primary-900 to-primary-800 pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(30,115,190,0.25),transparent_60%)]" aria-hidden="true" />
        <div className="container-xl relative z-10">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
            <AnimateIn>
              <nav aria-label="Brødsmuler" className="mb-6">
                <ol className="flex items-center gap-2 text-sm text-blue-200">
                  <li><a href="/" className="hover:text-white transition-colors">Hjem</a></li>
                  <li aria-hidden="true">/</li>
                  <li className="text-white font-medium">
                    <EditableText as="span" path="spanskAlicantePage.breadcrumb" value={page.breadcrumb} className="inline" />
                  </li>
                </ol>
              </nav>

              <EditableText
                as="h1"
                path="spanskAlicantePage.heroTitle"
                value={page.heroTitle}
                className="font-heading text-3xl lg:text-5xl font-bold text-white leading-tight mb-4"
              />
              <EditableText
                as="p"
                path="spanskAlicantePage.heroSubtitle"
                value={page.heroSubtitle}
                multiline
                className="text-xl text-blue-100 leading-relaxed mb-6 max-w-2xl"
              />
              <EditableText
                as="p"
                path="spanskAlicantePage.intro"
                value={page.intro}
                multiline
                className="text-blue-100/90 leading-relaxed max-w-2xl mb-8"
              />

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="/kontakt"
                  onClick={() => trackEvent('cta_click', { location: 'spansk_alicante_hero', cta: 'kontakt' })}
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-cta text-white font-semibold rounded-xl hover:bg-cta-600 transition-all duration-200 shadow-lg hover:-translate-y-0.5 cursor-pointer"
                >
                  <EditableText as="span" path="spanskAlicantePage.ctaSecondary" value={page.ctaSecondary} className="inline" />
                </a>
                <a
                  href="#spansk-alicante-process"
                  onClick={() => trackEvent('cta_click', { location: 'spansk_alicante_hero', cta: 'process' })}
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/15 transition-colors duration-200 cursor-pointer"
                >
                  <EditableText as="span" path="spanskAlicantePage.ctaPrimary" value={page.ctaPrimary} className="inline" />
                </a>
              </div>
            </AnimateIn>

            <AnimateIn variant="fadeLeft" delay={150}>
              <div className="rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl">
                <img
                  src={img(page.heroImageUrl || IMAGES.spanskAlicanteBeachPalms, 1200)}
                  alt={page.heroImageAlt || 'Strand og palmer i Alicante'}
                  className="w-full h-[360px] lg:h-[460px] object-cover"
                />
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-white">
        <div className="container-xl">
          <AnimateIn>
            <div className="bg-surface border border-gray-100 rounded-[2rem] p-8 lg:p-12 max-w-4xl mx-auto text-center">
              <EditableText
                as="p"
                path="spanskAlicantePage.exchangeNote"
                value={page.exchangeNote}
                multiline
                inputClassName="min-h-[140px]"
                className="text-lg text-gray-700 leading-relaxed"
              />
            </div>
          </AnimateIn>
        </div>
      </section>

      <section className="py-24 lg:py-28 bg-surface">
        <div className="container-xl">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-16 items-start">
            <AnimateIn variant="fadeRight">
              <EditableText
                as="h2"
                path="spanskAlicantePage.roleTitle"
                value={page.roleTitle}
                className="font-heading text-3xl lg:text-4xl font-bold text-ink mb-6 leading-tight"
              />
              <SimpleBulletList items={page.roleItems || []} basePath="spanskAlicantePage.roleItems" />
            </AnimateIn>

            <AnimateIn variant="fadeLeft" delay={120}>
              <div className="rounded-[2rem] overflow-hidden border border-gray-100 shadow-lg bg-white">
                <img
                  src={img(page.roleImageUrl || IMAGES.spanskAlicantePromenade, 1200)}
                  alt={page.roleImageAlt || 'Sosial hverdag og samtaler i Alicante'}
                  className="w-full h-[360px] object-cover"
                  loading="lazy"
                />
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>

      <section className="py-24 lg:py-28 bg-white">
        <div className="container-xl">
          <div className="grid lg:grid-cols-2 gap-8">
            <AnimateIn variant="fadeUp">
              <div className="bg-surface border border-gray-100 rounded-[2rem] p-8 h-full">
                <EditableText
                  as="h2"
                  path="spanskAlicantePage.benefitsTitle"
                  value={page.benefitsTitle}
                  className="font-heading text-2xl lg:text-3xl font-bold text-ink mb-6"
                />
                <SimpleBulletList items={page.benefitsItems || []} basePath="spanskAlicantePage.benefitsItems" />
              </div>
            </AnimateIn>

            <AnimateIn variant="fadeUp" delay={120}>
              <div className="bg-surface border border-gray-100 rounded-[2rem] p-8 h-full">
                <EditableText
                  as="h2"
                  path="spanskAlicantePage.weekTitle"
                  value={page.weekTitle}
                  className="font-heading text-2xl lg:text-3xl font-bold text-ink mb-6"
                />
                <SimpleBulletList items={page.weekItems || []} basePath="spanskAlicantePage.weekItems" />
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>

      <section className="py-24 lg:py-28 bg-gradient-to-br from-primary-50 via-white to-surface">
        <div className="container-xl">
          <AnimateIn>
            <figure className="max-w-4xl mx-auto bg-white border border-gray-100 rounded-[2rem] p-8 lg:p-10 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-8 items-start">
                {page.testimonialImageUrl && (
                  <img
                    src={page.testimonialImageUrl}
                    alt={page.testimonialAuthor || 'Testimonial'}
                    className="w-24 h-24 rounded-full object-cover object-top shrink-0 border-2 border-primary-100 shadow-md"
                    loading="lazy"
                  />
                )}
                <div className="flex-1">
                  <svg className="text-primary-200 mb-5" width="48" height="48" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M7.17 6A5.001 5.001 0 0 0 2 11v7h7v-7H6.08A3.001 3.001 0 0 1 9 8V6H7.17Zm9 0A5.001 5.001 0 0 0 11 11v7h7v-7h-2.92A3.001 3.001 0 0 1 18 8V6h-1.83Z" />
                  </svg>
                  <EditableText
                    as="blockquote"
                    path="spanskAlicantePage.testimonialQuote"
                    value={page.testimonialQuote}
                    multiline
                    className="font-heading text-xl lg:text-2xl font-bold text-ink leading-relaxed mb-4"
                  />
                  <EditableText
                    as="figcaption"
                    path="spanskAlicantePage.testimonialAuthor"
                    value={page.testimonialAuthor}
                    className="text-gray-500 font-medium"
                  />
                </div>
              </div>
            </figure>
          </AnimateIn>
        </div>
      </section>

      {page.beachCollageUrl && (
        <section className="py-10 lg:py-14 bg-white">
          <div className="container-xl">
            <AnimateIn variant="fadeUp">
              <div className="rounded-[2rem] overflow-hidden shadow-lg">
                <img
                  src={page.beachCollageUrl}
                  alt={page.beachCollageAlt || 'Hverdagen i Alicante'}
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
              </div>
            </AnimateIn>
          </div>
        </section>
      )}

      <section className="py-24 lg:py-28 bg-white">
        <div className="container-xl">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8">
            <AnimateIn variant="fadeRight">
              <div className="bg-surface border border-gray-100 rounded-[2rem] p-8 h-full">
                <EditableText
                  as="h2"
                  path="spanskAlicantePage.spanishCourseTitle"
                  value={page.spanishCourseTitle}
                  className="font-heading text-2xl lg:text-3xl font-bold text-ink mb-6"
                />
                <SimpleBulletList items={page.spanishCourseItems || []} basePath="spanskAlicantePage.spanishCourseItems" />
              </div>
            </AnimateIn>

            <AnimateIn variant="fadeLeft" delay={120}>
              <div className="bg-surface border border-gray-100 rounded-[2rem] p-8 h-full">
                <EditableText
                  as="h2"
                  path="spanskAlicantePage.fitTitle"
                  value={page.fitTitle}
                  className="font-heading text-2xl lg:text-3xl font-bold text-ink mb-6"
                />
                <SimpleBulletList items={page.fitItems || []} basePath="spanskAlicantePage.fitItems" />
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>

      <section className="py-24 lg:py-28 bg-surface">
        <div className="container-xl">
          <div className="grid lg:grid-cols-[1fr_0.9fr] gap-10 items-start">
            <AnimateIn variant="fadeRight">
              <EditableText
                as="h2"
                path="spanskAlicantePage.cityTitle"
                value={page.cityTitle}
                className="font-heading text-3xl lg:text-4xl font-bold text-ink mb-6"
              />
              <SimpleBulletList items={page.cityItems || []} basePath="spanskAlicantePage.cityItems" />

              <div className="mt-10 bg-white rounded-2xl border border-gray-100 p-6">
                <EditableText
                  as="h3"
                  path="spanskAlicantePage.socialTitle"
                  value={page.socialTitle}
                  className="font-heading text-xl font-bold text-ink mb-4"
                />
                <div className="flex flex-col gap-3">
                  <a
                    href={page.instagramUrl || 'https://www.instagram.com/globalworking'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-primary-600 transition-colors"
                  >
                    <EditableText
                      as="span"
                      path="spanskAlicantePage.socialInstagram"
                      value={page.socialInstagram}
                      className="inline"
                    />
                  </a>
                  <a
                    href={page.tiktokUrl || 'https://www.tiktok.com/@globalworking'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-primary-600 transition-colors"
                  >
                    <EditableText
                      as="span"
                      path="spanskAlicantePage.socialTikTok"
                      value={page.socialTikTok}
                      className="inline"
                    />
                  </a>
                </div>
              </div>
            </AnimateIn>

            <AnimateIn variant="fadeLeft" delay={120}>
              <div className="rounded-[2rem] overflow-hidden border border-gray-100 shadow-lg">
                <img
                  src={img(page.cityImageUrl || IMAGES.spanskAlicanteCityView, 1200)}
                  alt={page.cityImageAlt || 'Byliv og utsikt i Alicante'}
                  className="w-full h-[420px] object-cover"
                  loading="lazy"
                />
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>

      <section id="spansk-alicante-process" className="py-24 lg:py-28 bg-white">
        <div className="container-xl">
          <AnimateIn>
            <div className="text-center max-w-3xl mx-auto mb-12">
              <EditableText
                as="h2"
                path="spanskAlicantePage.processTitle"
                value={page.processTitle}
                className="font-heading text-3xl lg:text-4xl font-bold text-ink mb-5 leading-tight"
              />
            </div>
          </AnimateIn>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
            {(page.processSteps || []).map((step, index) => (
              <AnimateIn key={`process-${index}`} variant="fadeUp" delay={index * 90}>
                <ProcessStep step={step} index={index} />
              </AnimateIn>
            ))}
          </div>

          <AnimateIn variant="fadeUp" delay={180}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/kontakt"
                onClick={() => trackEvent('cta_click', { location: 'spansk_alicante_process', cta: 'kontakt' })}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors duration-200 shadow-md cursor-pointer"
              >
                <EditableText as="span" path="spanskAlicantePage.ctaSecondary" value={page.ctaSecondary} className="inline" />
              </a>
              <a
                href="/spansk-i-alicante/hvorfor"
                onClick={() => trackEvent('cta_click', { location: 'spansk_alicante_process', cta: 'hvorfor' })}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-primary-200 text-primary-600 font-semibold rounded-xl hover:bg-primary-50 transition-colors duration-200 cursor-pointer"
              >
                <EditableText as="span" path="spanskAlicantePage.visionLinkLabel" value={page.visionLinkLabel} className="inline" />
              </a>
            </div>
          </AnimateIn>
        </div>
      </section>

      <PageEndNav current="/spansk-i-alicante" />
    </>
  )
}
