import AnimateIn from './AnimateIn'
import { trackEvent } from '../lib/analytics'
import useContent from '../hooks/useContent'
import EditableText, { useVisualEditEnabled } from './editable/EditableText'
import InlineRichText from './editable/InlineRichText'
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
              <InlineEditableParagraph
                as="p"
                path="helsesektorComp.description"
                value={c.description}
                className="!text-gray-600 text-lg leading-relaxed mb-8"
              />

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
                  src={img(c.imageUrl || IMAGES.enfermeria, 900)}
                  alt={c.imageAlt || 'Helsepersonell i opplæring gjennom Global Working'}
                  className="w-full object-cover"
                  loading="lazy"
                  width="640"
                  height="480"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-900/40 via-transparent to-transparent" aria-hidden="true" />
              </div>

            </div>
          </AnimateIn>
        </div>
      </div>
    </section>
  )
}
