import AnimateIn from './AnimateIn'
import useContent from '../hooks/useContent'
import EditableText from './editable/EditableText'

export default function Rekruttering() {
  const c = useContent('rekrutteringComp')

  return (
    <section id="rekruttering" className="scroll-mt-28 py-24 lg:py-32 bg-white" aria-labelledby="rekruttering-heading">
      <div className="container-xl">
        <div className="rounded-3xl border border-gray-100 bg-surface/80 p-8 shadow-sm lg:p-10 mb-20">
          <AnimateIn variant="fadeRight">
            <EditableText
              as="span"
              path="rekrutteringComp.label"
              value={c.label}
              className="inline-block text-primary-600 font-semibold text-sm tracking-wide uppercase mb-3"
            />
            <EditableText
              id="rekruttering-heading"
              as="h2"
              path="rekrutteringComp.heading"
              value={c.heading}
              className="font-heading text-3xl lg:text-4xl font-bold text-ink mb-5 leading-tight"
            />
            <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
              <EditableText
                as="div"
                path="rekrutteringComp.p1"
                value={c.p1}
                multiline
                richText
                inputClassName="min-h-[120px]"
                className="text-gray-600 text-lg leading-relaxed"
              />
              <EditableText
                as="div"
                path="rekrutteringComp.p2"
                value={c.p2}
                multiline
                richText
                inputClassName="min-h-[120px]"
                className="text-gray-600 text-base leading-relaxed"
              />
              <EditableText
                as="div"
                path="rekrutteringComp.p3"
                value={c.p3 || ''}
                multiline
                richText
                inputClassName="min-h-[120px]"
                className="text-gray-600 text-base leading-relaxed"
              />
            </div>
          </AnimateIn>
        </div>

      </div>
    </section>
  )
}
