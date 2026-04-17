import { IMAGES, img } from '../assets/images'
import AnimateIn from './AnimateIn'
import useContent from '../hooks/useContent'
import EditableText from './editable/EditableText'

export default function GodeGrunner() {
  const c = useContent('godeGrunner')

  return (
    <section className="py-24 lg:py-32 bg-surface" aria-labelledby="gode-grunner-heading">
      <div className="container-xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-14">
          <AnimateIn variant="fadeRight">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src={img(c.imageUrl || IMAGES.rekruttering, 900)}
                alt={c.imageAlt || 'Global Working samarbeid med norske kommuner'}
                className="w-full object-cover"
                loading="lazy"
                width="640"
                height="450"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-900/30 via-transparent to-transparent" aria-hidden="true" />
            </div>
          </AnimateIn>

          <div>
            <AnimateIn>
              <EditableText
                as="span"
                path="godeGrunner.label"
                value={c.label}
                className="inline-block text-primary-600 font-semibold text-sm tracking-wide uppercase mb-3"
              />
              <EditableText
                id="gode-grunner-heading"
                as="h2"
                path="godeGrunner.heading"
                value={c.heading}
                className="font-heading text-3xl lg:text-4xl font-bold text-ink mb-5 leading-tight"
              />
              <EditableText
                as="p"
                path="godeGrunner.description"
                value={c.description}
                multiline
                className="text-gray-600 text-lg leading-relaxed mb-8"
              />
              <a
                href={c.articleLink}
                className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700 transition-colors"
              >
                <EditableText
                  as="span"
                  path="godeGrunner.articleLinkLabel"
                  value={c.articleLinkLabel}
                  className="inline"
                />
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
            </AnimateIn>
          </div>
        </div>
      </div>
    </section>
  )
}
