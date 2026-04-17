import { IMAGES, img } from '../assets/images'
import useContent from '../hooks/useContent'
import EditableText, { createArrayItemCommitter, useVisualEditEnabled } from './editable/EditableText'
import InlineRichText from './editable/InlineRichText'

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

export default function OmOss() {
  const c = useContent('omOssComp')

  return (
    <section id="om-oss" className="scroll-mt-28 py-24 lg:py-32 bg-white" aria-labelledby="om-oss-heading">
      <div className="container-xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <EditableText
              as="span"
              path="omOssComp.label"
              value={c.label}
              className="inline-block text-primary-600 font-semibold text-sm tracking-wide uppercase mb-3"
            />
            <EditableText
              as="h2"
              path="omOssComp.heading"
              value={c.heading}
              className="font-heading text-3xl lg:text-4xl font-bold text-ink mb-5 leading-tight"
            />
            <InlineEditableParagraph
              as="p"
              path="omOssComp.p1"
              value={c.p1}
              className="!text-gray-600 text-lg leading-relaxed mb-6"
            />
            <InlineEditableParagraph
              as="p"
              path="omOssComp.p2"
              value={c.p2}
              className="!text-gray-600 leading-relaxed mb-8"
            />

            {c.blockquote && (
              <blockquote className="mb-8 rounded-2xl border border-primary-100 bg-primary-50/40 p-5 text-sm leading-relaxed text-gray-700">
                "<EditableText
                  as="span"
                  path="omOssComp.blockquote.text"
                  value={c.blockquote.text}
                  className="inline"
                />"
                <footer className="mt-3 font-semibold text-ink">— <EditableText
                  as="span"
                  path="omOssComp.blockquote.author"
                  value={c.blockquote.author}
                  className="inline"
                /></footer>
              </blockquote>
            )}

            <div className="flex flex-wrap gap-8">
              {(c.stats || []).map((s, i) => {
                const commitStatValue = createArrayItemCommitter({
                  basePath: 'omOssComp.stats',
                  fallbackItems: c.stats || [],
                  index: i,
                  field: 'value',
                })
                const commitStatLabel = createArrayItemCommitter({
                  basePath: 'omOssComp.stats',
                  fallbackItems: c.stats || [],
                  index: i,
                  field: 'label',
                })
                return (
                  <div key={s.label}>
                    {i > 0 && <div className="hidden sm:block w-px bg-gray-100 absolute" />}
                    <EditableText
                      as="div"
                      path={`omOssComp.stats.${i}.value`}
                      value={s.value}
                      onCommit={commitStatValue}
                      className="font-heading text-3xl font-bold text-primary-600"
                    />
                    <EditableText
                      as="div"
                      path={`omOssComp.stats.${i}.label`}
                      value={s.label}
                      onCommit={commitStatLabel}
                      className="text-gray-400 text-sm mt-0.5"
                    />
                  </div>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl overflow-hidden shadow-lg row-span-2 relative group uppercase">
              <img
                src={img(c.teamImageUrl || IMAGES.teamGroup, 1200)}
                alt={c.teamImageAlt || 'Global Working-teamet'}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-navy/20 group-hover:bg-transparent transition-colors duration-300" />
            </div>
            <div className="rounded-2xl overflow-hidden shadow-lg relative group">
              <img
                src={img(c.officeImageUrl || IMAGES.oficina, 800)}
                alt={c.officeImageAlt || 'Global Working-kontor'}
                className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-navy/20 group-hover:bg-transparent transition-colors duration-300" />
            </div>
            <div className="rounded-2xl overflow-hidden shadow-lg bg-navy flex items-center justify-center p-6 text-center">
              <div className="text-white">
                <EditableText
                  as="div"
                  path="omOssComp.locationLabel"
                  value={c.locationLabel}
                  className="font-heading text-4xl font-bold mb-1"
                />
                <EditableText
                  as="div"
                  path="omOssComp.locationSub"
                  value={c.locationSub}
                  className="text-blue-200 text-sm font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {(c.values || []).map((v, i) => {
            const commitValueTitle = createArrayItemCommitter({
              basePath: 'omOssComp.values',
              fallbackItems: c.values || [],
              index: i,
              field: 'title',
            })
            const commitValueDesc = createArrayItemCommitter({
              basePath: 'omOssComp.values',
              fallbackItems: c.values || [],
              index: i,
              field: 'desc',
            })
            return (
              <div key={v.title} className="bg-surface rounded-2xl p-7 border border-gray-100 hover:shadow-md hover:border-primary-100 transition-all duration-300">
                <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center mb-4">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E73BE" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <EditableText
                  as="h3"
                  path={`omOssComp.values.${i}.title`}
                  value={v.title}
                  onCommit={commitValueTitle}
                  className="font-heading text-lg font-bold text-ink mb-2"
                />
                <InlineEditableParagraph
                  as="p"
                  path={`omOssComp.values.${i}.desc`}
                  value={v.desc}
                  onCommit={commitValueDesc}
                  className="!text-gray-500 leading-relaxed text-sm"
                />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
