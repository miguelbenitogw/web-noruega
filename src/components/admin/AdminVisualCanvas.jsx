import { useEffect, useMemo, useRef } from 'react'
import ContentEntityManager from './ContentEntityManager'
import HomePage from '../../pages/HomePage'
import HelsePage from '../../pages/HelsePage'
import NewsArticlePage from '../../pages/NewsArticlePage'
import NyheterPage from '../../pages/NyheterPage'

const scrollToPreviewTarget = (previewRoot, activeSection) => {
  if (!previewRoot || !activeSection) return

  if (activeSection.scrollToTop) {
    previewRoot.scrollIntoView({ behavior: 'smooth', block: 'start' })
    return
  }

  if (activeSection.anchorId) {
    const anchor = previewRoot.querySelector(`[id="${activeSection.anchorId}"]`)
    if (anchor) {
      anchor.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
  }

  if (typeof activeSection.sectionIndex === 'number') {
    const sections = previewRoot.querySelectorAll('section')
    const target = sections[activeSection.sectionIndex]
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
}

export default function AdminVisualCanvas({ activeSection, article, previewConfig }) {
  const previewRootRef = useRef(null)

  const renderedPreview = useMemo(() => {
    switch (previewConfig.id) {
      case 'landing':
        return <HomePage />
      case 'nyheter':
        return <NyheterPage />
      case 'helse':
        return <HelsePage />
      case 'news-manager':
        return <ContentEntityManager entityType="news" />
      case 'article':
        if (!article) {
          return (
            <section className="bg-white py-24">
              <div className="container-xl">
                <h2 className="font-heading text-3xl font-bold text-slate-950">Velg en artikkel</h2>
                <p className="mt-4 max-w-2xl leading-relaxed text-slate-600">
                  Forhåndsvisningen trenger en konkret nyhet for å vise artikkelen. Velg en artikkel i topplinjen, så fortsetter vi.
                </p>
              </div>
            </section>
          )
        }
        return <NewsArticlePage slug={article.slug} />
      default:
        return null
    }
  }, [article, previewConfig.id])

  useEffect(() => {
    if (previewConfig.id === 'news-manager') return
    scrollToPreviewTarget(previewRootRef.current, activeSection)
  }, [activeSection, previewConfig.id])

  const handleLinkClickCapture = (event) => {
    if (previewConfig.id === 'news-manager') return

    const anchor = event.target.closest('a')
    if (!anchor || !previewRootRef.current?.contains(anchor)) return

    const href = anchor.getAttribute('href')
    if (!href) return

    if (href.startsWith('#')) {
      event.preventDefault()
      const target = previewRootRef.current.querySelector(href)
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }

    if (href.includes('#')) {
      event.preventDefault()
      const hash = href.split('#')[1]
      if (!hash) return
      const target = previewRootRef.current.querySelector(`[id="${hash}"]`)
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }

    event.preventDefault()
  }

  return (
    <section className="min-h-0 min-w-0 flex-1 bg-slate-100">
      <div className="flex h-full min-h-0 flex-col">
        <div className="border-b border-slate-200 bg-white px-4 py-3 lg:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                {previewConfig.id === 'news-manager' ? 'Nyhetsstudio' : 'Forhåndsvisning'}
              </p>
              <h2 className="mt-1 font-heading text-xl font-bold text-slate-950">{previewConfig.label}</h2>
            </div>
            <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500">
              {previewConfig.path}
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto px-4 py-4 lg:px-6 lg:py-6">
          <div className={`mx-auto w-full ${previewConfig.id === 'news-manager' ? 'max-w-[1600px]' : 'max-w-[1200px]'}`}>
            <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.18)]">
              <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-5 py-3">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
                <div className="ml-3 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">
                  {previewConfig.id === 'news-manager'
                    ? 'Administrasjon med skjema og forhåndsvisning'
                    : 'Ekte forhåndsvisning · navigasjon låst'}
                </div>
              </div>

              <div className="max-h-[calc(100vh-230px)] overflow-auto bg-white" onClickCapture={handleLinkClickCapture}>
                <div ref={previewRootRef}>
                  {renderedPreview}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
