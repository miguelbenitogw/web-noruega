import { useEffect, useMemo, useRef } from 'react'
import Footer from '../Footer'
import Navbar from '../Navbar'
import ContentEntityManager from './ContentEntityManager'
import HomePage from '../../pages/HomePage'
import HelsePage from '../../pages/HelsePage'
import NewsArticlePage from '../../pages/NewsArticlePage'
import NyheterPage from '../../pages/NyheterPage'
import OmOssPage from '../../pages/OmOssPage'
import KontaktPage from '../../pages/KontaktPage'
import TalentportalenPage from '../../pages/TalentportalenPage'
import RekrutteringPage from '../../pages/RekrutteringPage'
import SpanskAlicantePage from '../../pages/SpanskAlicantePage'
import SpanskAlicanteHvorforPage from '../../pages/SpanskAlicanteHvorforPage'
import LivetSomStudentPage from '../../pages/LivetSomStudentPage'
import PersonvernPage from '../../pages/PersonvernPage'
import VilkarPage from '../../pages/VilkarPage'
import CookiesPage from '../../pages/CookiesPage'

const PAGE_PREVIEW_COMPONENTS = {
  global: GlobalPreviewChrome,
  landing: HomePage,
  nyheter: NyheterPage,
  helse: HelsePage,
  'spansk-alicante': SpanskAlicantePage,
  'spansk-alicante-hvorfor': SpanskAlicanteHvorforPage,
  'spansk-alicante-livet-som-student': LivetSomStudentPage,
  rekruttering: RekrutteringPage,
  kontakt: KontaktPage,
  'om-oss': OmOssPage,
  talentportalen: TalentportalenPage,
  personvern: PersonvernPage,
  vilkar: VilkarPage,
  cookies: CookiesPage,
}

function GlobalPreviewChrome() {
  return (
    <div className="bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <Navbar />
        <div className="border-t border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
          Endringer i navigasjonen vises her. Bruk seksjonspanelet for å hoppe mellom navbar og footer.
        </div>
      </section>

      <section className="bg-slate-950">
        <Footer />
      </section>
    </div>
  )
}

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

const findPreviewTarget = (previewRoot, targetId) => {
  if (!previewRoot || !targetId) return null

  const normalizedTargetId = targetId.startsWith('#') ? targetId.slice(1) : targetId
  if (!normalizedTargetId) return null

  return previewRoot.querySelector(`[id="${normalizedTargetId}"]`)
}

const resolvePreviewLink = (href, previewPath) => {
  if (typeof href !== 'string' || !href.trim()) return null

  try {
    const currentUrl = new URL(previewPath || '/', window.location.origin)
    const targetUrl = new URL(href, currentUrl)

    return {
      currentPathname: currentUrl.pathname,
      targetPathname: targetUrl.pathname,
      targetHash: targetUrl.hash.startsWith('#') ? targetUrl.hash.slice(1) : '',
    }
  } catch {
    return null
  }
}

export default function AdminVisualCanvas({ activeSection, article, previewConfig }) {
  const previewRootRef = useRef(null)

  const renderedPreview = useMemo(() => {
    if (previewConfig.id === 'news-manager') {
      return <ContentEntityManager entityType="news" />
    }

    if (previewConfig.id === 'article') {
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
    }

    const PreviewComponent = PAGE_PREVIEW_COMPONENTS[previewConfig.id]
    if (PreviewComponent) {
      return <PreviewComponent />
    }

    return (
      <section className="bg-white py-24">
        <div className="container-xl">
          <h2 className="font-heading text-3xl font-bold text-slate-950">Forhåndsvisning mangler</h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-slate-600">
            Det finnes ingen registrert canvas-renderer for denne modusen ennå.
          </p>
        </div>
      </section>
    )
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

    const resolvedLink = resolvePreviewLink(href, previewConfig.path)
    if (!resolvedLink) return

    event.preventDefault()

    if (resolvedLink.targetPathname !== resolvedLink.currentPathname) {
      return
    }

    if (!resolvedLink.targetHash) return

    const target = findPreviewTarget(previewRootRef.current, resolvedLink.targetHash)
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
