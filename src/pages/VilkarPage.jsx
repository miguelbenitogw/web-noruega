import AnimateIn from '../components/AnimateIn'
import useContent from '../hooks/useContent'

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
            <h1 className="font-heading text-3xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              {c.title}
            </h1>
            <p className="text-blue-100 text-lg max-w-3xl leading-relaxed">{c.intro}</p>
          </AnimateIn>
        </div>
      </section>

      <section className="py-16 bg-surface">
        <div className="container-xl">
          <div className="max-w-4xl bg-white rounded-2xl border border-gray-100 shadow-sm p-8 lg:p-10 space-y-8">
            {(c.blocks || []).map((block, index) => (
              <div key={`${block.heading}-${index}`}>
                <h2 className="font-heading text-2xl font-bold text-ink mb-3">{block.heading}</h2>
                <p className="text-gray-700 leading-relaxed">{block.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

