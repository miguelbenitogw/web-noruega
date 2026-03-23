import { useEffect, useState } from 'react'
import './index.css'
import Navbar from './components/Navbar'
import ScrollProgress from './components/ScrollProgress'
import Footer from './components/Footer'
import BackToTop from './components/BackToTop'
import CookieConsent from './components/CookieConsent'
import { initAnalyticsWithConsent, trackPageView } from './lib/analytics'
import { setDefaultSEO, setNotFoundSEO, setSectionSEO } from './lib/seo'

// Pages
import HomePage from './pages/HomePage'
import RekrutteringPage from './pages/RekrutteringPage'
import HelsePage from './pages/HelsePage'
import NyheterPage from './pages/NyheterPage'
import TalentportalenPage from './pages/TalentportalenPage'
import OmOssPage from './pages/OmOssPage'
import KontaktPage from './pages/KontaktPage'
import NewsArticlePage from './pages/NewsArticlePage'
import AdminPage from './pages/AdminPage'

const getCurrentPath = () => `${window.location.pathname}${window.location.search}`

const getNewsSlugFromPath = (pathname) => {
  const match = pathname.match(/^\/(?:nyheter|journal)\/([^/]+)\/?$/)
  return match ? match[1] : null
}

const normalizePath = (pathname) => {
  if (!pathname || pathname === '/') return '/'
  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
}

const getSectionRoute = (pathname) => {
  const normalized = normalizePath(pathname)
  switch (normalized) {
    case '/':
      return 'home'
    case '/vr-rekrutteringsmodell':
      return 'rekruttering'
    case '/helse':
      return 'helse'
    case '/journal':
    case '/nyheter':
      return 'nyheter'
    case '/talentportalen':
      return 'talentportalen'
    case '/om-oss':
      return 'om-oss'
    case '/kontakt':
      return 'kontakt'
    case '/admin':
      return 'admin'
    default:
      return null
  }
}

export default function App() {
  const [currentPath, setCurrentPath] = useState(getCurrentPath)
  const currentPathname = currentPath.split('?')[0]
  const newsSlug = getNewsSlugFromPath(currentPathname)
  const sectionRoute = getSectionRoute(currentPathname)

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
    if (sectionRoute === 'admin') return
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
    return <AdminPage />
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
      <Footer />
      <BackToTop />
      <CookieConsent />
    </>
  )
}
