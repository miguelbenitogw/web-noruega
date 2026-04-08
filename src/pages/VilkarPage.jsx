import AnimateIn from '../components/AnimateIn'
import useContent from '../hooks/useContent'
import EditableText, { createArrayItemCommitter } from '../components/editable/EditableText'

export default function VilkarPage() {
  const c = useContent('legalVilkar')

  return (
    <>
      <section className="pt-32 pb-12 bg-gradient-to-br from-navy via-primary-900 to-primary-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(30,115,190,0.3),transparent_60%)]" aria-hidden="true" />
        <div className="container-xl relative z-10">
          <AnimateIn>
            <nav className="text-blue-200/70 text-sm mb-6" aria-label="Breadcrumb">
              <a href="/" className="hover:text-white transition-colors">Hjem</a>
              <span className="mx-2">/</span>
              <span className="text-white">{c.breadcrumb}</span>
            </nav>
            <EditableText
              as="h1"
              path="legalVilkar.title"
              value={c.title}
              className="font-heading text-3xl lg:text-5xl font-bold text-white mb-4 leading-tight"
            />
            <EditableText
              as="p"
              path="legalVilkar.intro"
              value={c.intro}
              multiline
              className="text-blue-100 text-lg max-w-3xl leading-relaxed"
            />
          </AnimateIn>
        </div>
      </section>

      <section className="py-16 bg-surface">
        <div className="container-xl">
          <div className="max-w-4xl bg-white rounded-2xl border border-gray-100 shadow-sm p-8 lg:p-10 space-y-8">
            {(c.blocks || []).map((block, index) => {
              const commitHeading = createArrayItemCommitter({
                basePath: 'legalVilkar.blocks',
                fallbackItems: c.blocks || [],
                index,
                field: 'heading',
              })
              const commitBody = createArrayItemCommitter({
                basePath: 'legalVilkar.blocks',
                fallbackItems: c.blocks || [],
                index,
                field: 'body',
              })

              return (
                <div key={`${block.heading}-${index}`}>
                  <EditableText
                    as="h2"
                    path={`legalVilkar.blocks.${index}.heading`}
                    value={block.heading}
                    onCommit={commitHeading}
                    className="font-heading text-2xl font-bold text-ink mb-3"
                  />
                  <EditableText
                    as="p"
                    path={`legalVilkar.blocks.${index}.body`}
                    value={block.body}
                    onCommit={commitBody}
                    multiline
                    className="text-gray-700 leading-relaxed"
                  />
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}


