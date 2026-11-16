import React, { Suspense, useEffect, useState } from 'react'
import './index.css'
import Navbar from './components/Navbar'
import ScrollProgress from './components/ScrollProgress'
import Footer from './components/Footer'
import BackToTop from './components/BackToTop'
import CookieConsent from './components/CookieConsent'
import { initAnalytics, trackPageView } from './lib/analytics'
import { setDefaultSEO, setNotFoundSEO, setSectionSEO } from './lib/seo'
import { resolveRouteContext } from './lib/contentRuntime'

// Pages
// HomePage es eager (es la landing → LCP rápido). El resto va en chunks
// aparte con React.lazy, así el bundle inicial solo trae la home.
import HomePage from './pages/HomePage'
const RekrutteringPage = React.lazy(() => import('./pages/RekrutteringPage'))
const HelsePage = React.lazy(() => import('./pages/HelsePage'))
const NyheterPage = React.lazy(() => import('./pages/NyheterPage'))
const TalentportalenPage = React.lazy(() => import('./pages/TalentportalenPage'))
const OmOssPage = React.lazy(() => import('./pages/OmOssPage'))
const KontaktPage = React.lazy(() => import('./pages/KontaktPage'))
const SpanskAlicantePage = React.lazy(() => import('./pages/SpanskAlicantePage'))
const SpanskAlicanteHvorforPage = React.lazy(() => import('./pages/SpanskAlicanteHvorforPage'))
const LivetSomStudentPage = React.lazy(() => import('./pages/LivetSomStudentPage'))
const HelsenorskPage = React.lazy(() => import('./pages/HelsenorskPage'))
const PersonvernPage = React.lazy(() => import('./pages/PersonvernPage'))
const VilkarPage = React.lazy(() => import('./pages/VilkarPage'))
const CookiesPage = React.lazy(() => import('./pages/CookiesPage'))
const NewsArticlePage = React.lazy(() => import('./pages/NewsArticlePage'))

const getCurrentPath = () => `${window.location.pathname}${window.location.search}`

export default function App() {
  const [currentPath, setCurrentPath] = useState(getCurrentPath)
  const currentPathname = currentPath.split('?')[0]
  const routeContext = resolveRouteContext(currentPathname)
  const { newsSlug, sectionRoute } = routeContext

  // La medición arranca SIEMPRE, con el consentimiento denegado por defecto
  // (ver la cabecera de lib/analytics.js). Antes esto solo corría si el
  // visitante ya había aceptado, y el resultado era que de cada veinte
  // personas que entraban se contaba una. Sin aceptar no se escribe ninguna
  // cookie: solo llegan señales anónimas a Google.
  useEffect(() => {
    if (initAnalytics()) {
      trackPageView(currentPath)
    }
  }, [currentPath])

  useEffect(() => {
    const onPopState = () => setCurrentPath(getCurrentPath())
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
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
  }, [currentPathname, newsSlug, sectionRoute])

  const renderPage = () => {
    if (newsSlug) return <NewsArticlePage slug={newsSlug} />

    switch (sectionRoute) {
      case 'home':                                 return <HomePage />
      case 'rekruttering':                         return <RekrutteringPage />
      case 'helse':                                return <HelsePage />
      case 'nyheter':                              return <NyheterPage />
      case 'talentportalen':                       return <TalentportalenPage />
      case 'om-oss':                               return <OmOssPage />
      case 'kontakt':                              return <KontaktPage />
      case 'spansk-i-alicante':                    return <SpanskAlicantePage />
      case 'spansk-i-alicante-hvorfor':            return <SpanskAlicanteHvorforPage />
      case 'spansk-i-alicante-livet-som-student':  return <LivetSomStudentPage />
      case 'spansk-i-alicante-helsenorsk':         return <HelsenorskPage />
      case 'personvern':                           return <PersonvernPage />
      case 'vilkar':                               return <VilkarPage />
      case 'cookies':                              return <CookiesPage />
      default:
        return (
          <section className="py-32 bg-white">
            <div className="container-xl">
              <h1 className="text-display-sm font-semibold text-navy mb-4">Siden ble ikke funnet</h1>
              <p className="text-ink-muted mb-8 gw-measure">
                Kontroller adressen eller gå tilbake til forsiden.
              </p>
              <a href="/" className="gw-btn gw-btn-ink">Tilbake til forsiden</a>
            </div>
          </section>
        )
    }
  }

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-navy focus:text-white focus:rounded-pill"
      >
        Hopp til hovedinnhold
      </a>
      <ScrollProgress />
      <Navbar />
      <main id="main-content">
        <Suspense fallback={<div className="min-h-screen" aria-busy="true" />}>
          {renderPage()}
        </Suspense>
      </main>
      <Footer />
      <BackToTop />
      <CookieConsent />
    </>
  )
}
