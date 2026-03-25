import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import './index.css'
import Navbar from './components/Navbar'
import ScrollProgress from './components/ScrollProgress'
import Footer from './components/Footer'
import BackToTop from './components/BackToTop'
import CookieConsent from './components/CookieConsent'
import AdminErrorBoundary from './components/AdminErrorBoundary'
import VisualEditToolbar from './components/admin/VisualEditToolbar'
import { initAnalyticsWithConsent, trackPageView } from './lib/analytics'
import { setDefaultSEO, setNotFoundSEO, setSectionSEO } from './lib/seo'
import { resolveRouteContext } from './lib/contentRuntime'
import { canCurrentUserEditContent } from './lib/contentRemote'
import { resetVisualEditState, updateVisualEditState } from './lib/visualEditSession'

// Pages
import HomePage from './pages/HomePage'
import RekrutteringPage from './pages/RekrutteringPage'
import HelsePage from './pages/HelsePage'
import NyheterPage from './pages/NyheterPage'
import TalentportalenPage from './pages/TalentportalenPage'
import OmOssPage from './pages/OmOssPage'
import KontaktPage from './pages/KontaktPage'
import PersonvernPage from './pages/PersonvernPage'
import VilkarPage from './pages/VilkarPage'
import CookiesPage from './pages/CookiesPage'
import NewsArticlePage from './pages/NewsArticlePage'
import AdminPage from './pages/AdminPage'

const getCurrentPath = () => `${window.location.pathname}${window.location.search}`

export default function App() {
  const [currentPath, setCurrentPath] = useState(getCurrentPath)
  const [canEditVisualContent, setCanEditVisualContent] = useState(false)
  const currentPathname = currentPath.split('?')[0]
  const routeContext = resolveRouteContext(currentPathname)
  const newsSlug = routeContext.newsSlug
  const sectionRoute = routeContext.sectionRoute
  const searchParams = useMemo(() => new URLSearchParams(currentPath.split('?')[1] || ''), [currentPath])
  const isVisualEditRequested = searchParams.get('edit') === '1'
  const isEditableRoute = !routeContext.isAdmin && (['home', 'nyheter', 'helse'].includes(sectionRoute) || Boolean(newsSlug))
  const hasVisualEditPermission = isVisualEditRequested && isEditableRoute ? canEditVisualContent : false
  const isVisualEditMode = isVisualEditRequested && isEditableRoute && hasVisualEditPermission
  const visualEditRouteLabel = newsSlug
    ? `Noticia: ${newsSlug}`
    : sectionRoute === 'home'
      ? 'Landing'
      : sectionRoute === 'nyheter'
        ? 'Noticias'
        : sectionRoute === 'helse'
          ? 'Sector sanitario'
          : null

  useLayoutEffect(() => {
    if (!routeContext.isAdmin) return undefined

    const html = document.documentElement
    const body = document.body
    const previousHtmlTranslate = html.getAttribute('translate')
    const previousHtmlLang = html.getAttribute('lang')
    const previousHtmlClass = html.classList.contains('notranslate')
    const previousBodyTranslate = body ? body.getAttribute('translate') : null
    const previousBodyClass = body ? body.classList.contains('notranslate') : false

    html.classList.add('notranslate')
    html.setAttribute('translate', 'no')
    html.setAttribute('lang', 'nb')

    if (body) {
      body.classList.add('notranslate')
      body.setAttribute('translate', 'no')
    }

    return () => {
      if (previousHtmlTranslate === null) html.removeAttribute('translate')
      else html.setAttribute('translate', previousHtmlTranslate)

      if (previousHtmlLang === null) html.removeAttribute('lang')
      else html.setAttribute('lang', previousHtmlLang)

      if (!previousHtmlClass) html.classList.remove('notranslate')

      if (body) {
        if (previousBodyTranslate === null) body.removeAttribute('translate')
        else body.setAttribute('translate', previousBodyTranslate)

        if (!previousBodyClass) body.classList.remove('notranslate')
      }
    }
  }, [routeContext.isAdmin])

  useEffect(() => {
    if (localStorage.getItem('gw-cookies') === 'accepted') {
      if (initAnalyticsWithConsent()) {
        trackPageView(currentPath)
      }
    }
  }, [currentPath])

  useEffect(() => {
    const onPopState = () => setCurrentPath(getCurrentPath())
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
    let cancelled = false

    if (!isVisualEditRequested || !isEditableRoute) return undefined

    const checkPermissions = async () => {
      try {
        const allowed = await canCurrentUserEditContent()
        if (!cancelled) {
          setCanEditVisualContent(Boolean(allowed))
        }
      } catch {
        if (!cancelled) {
          setCanEditVisualContent(false)
        }
      }
    }

    checkPermissions()

    return () => {
      cancelled = true
    }
  }, [isEditableRoute, isVisualEditRequested])

  useEffect(() => {
    updateVisualEditState({
      requested: isVisualEditRequested,
      enabled: isVisualEditMode,
      canEdit: hasVisualEditPermission,
      isEditableRoute,
      routeKey: newsSlug ? `news:${newsSlug}` : sectionRoute || null,
      routeLabel: visualEditRouteLabel,
      error: null,
    })

    if (!isVisualEditRequested && !isVisualEditMode) {
      resetVisualEditState()
    }
  }, [
    canEditVisualContent,
    hasVisualEditPermission,
    isEditableRoute,
    isVisualEditMode,
    isVisualEditRequested,
    newsSlug,
    sectionRoute,
    visualEditRouteLabel,
  ])

  useEffect(() => {
    if (routeContext.isAdmin) return
    if (newsSlug) return

    if (sectionRoute === 'home') {
      setDefaultSEO()
      return
    }

    if (sectionRoute) {
      setSectionSEO(sectionRoute)
      return
    }

    setNotFoundSEO(currentPathname)
  }, [currentPathname, newsSlug, routeContext.isAdmin, sectionRoute])

  const renderPage = () => {
    if (newsSlug) return <NewsArticlePage slug={newsSlug} />

    switch (sectionRoute) {
      case 'home':
        return <HomePage />
      case 'rekruttering':
        return <RekrutteringPage />
      case 'helse':
        return <HelsePage />
      case 'nyheter':
        return <NyheterPage />
      case 'talentportalen':
        return <TalentportalenPage />
      case 'om-oss':
        return <OmOssPage />
      case 'kontakt':
        return <KontaktPage />
      case 'personvern':
        return <PersonvernPage />
      case 'vilkar':
        return <VilkarPage />
      case 'cookies':
        return <CookiesPage />
      default:
        return (
          <section className="py-24 bg-white">
            <div className="container-xl">
              <h1 className="font-heading text-3xl font-bold text-ink mb-4">Siden ble ikke funnet</h1>
              <p className="text-gray-600 mb-6">Kontroller adressen eller gå tilbake til forsiden.</p>
              <a href="/" className="text-primary-600 font-semibold hover:text-primary-700">
                Tilbake til forsiden
              </a>
            </div>
          </section>
        )
    }
  }

  // Admin page renders standalone without chrome
  if (sectionRoute === 'admin') {
    return (
      <AdminErrorBoundary key={currentPathname}>
        <div className="notranslate" translate="no">
          <AdminPage />
        </div>
      </AdminErrorBoundary>
    )
  }

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-lg"
      >
        Hopp til hovedinnhold
      </a>
      <ScrollProgress />
      <Navbar />
      <main id="main-content">
        {renderPage()}
      </main>
      <VisualEditToolbar
        isRequested={isVisualEditRequested}
        isEnabled={isVisualEditMode}
        canEdit={hasVisualEditPermission}
        isEditableRoute={isEditableRoute}
        routeLabel={visualEditRouteLabel}
      />
      <Footer />
      <BackToTop />
      <CookieConsent />
    </>
  )
}
