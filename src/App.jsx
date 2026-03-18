import { useEffect, useState } from 'react'
import './index.css'
import Navbar from './components/Navbar'
import ScrollProgress from './components/ScrollProgress'
import Hero from './components/Hero'
import HvaGjor from './components/HvaGjor'
import Rekruttering from './components/Rekruttering'
import Helsesektor from './components/Helsesektor'
import GodeGrunner from './components/GodeGrunner'
import Nyheter from './components/Nyheter'
import CTABanner from './components/CTABanner'
import Talentportalen from './components/Talentportalen'
import OmOss from './components/OmOss'
import FAQ from './components/FAQ'
import Kontakt from './components/Kontakt'
import LegalSections from './components/LegalSections'
import Footer from './components/Footer'
import BackToTop from './components/BackToTop'
import CookieConsent from './components/CookieConsent'
import { initAnalyticsWithConsent, trackPageView } from './lib/analytics'
import NewsArticlePage from './pages/NewsArticlePage'
import { setDefaultSEO } from './lib/seo'

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
    if (!newsSlug) setDefaultSEO()
  }, [newsSlug, sectionRoute])

  const renderSectionRoute = () => {
    switch (sectionRoute) {
      case 'home':
        return (
          <>
            <Hero />
            <HvaGjor />
            <Rekruttering />
            <Helsesektor />
            <GodeGrunner />
            <Nyheter />
            <CTABanner />
            <Talentportalen />
            <OmOss />
            <FAQ />
            <Kontakt />
            <LegalSections />
          </>
        )
      case 'rekruttering':
        return (
          <>
            <HvaGjor />
            <Rekruttering />
            <GodeGrunner />
            <CTABanner />
            <Kontakt />
            <LegalSections />
          </>
        )
      case 'helse':
        return (
          <>
            <Helsesektor />
            <GodeGrunner />
            <Nyheter />
            <CTABanner />
            <Kontakt />
            <LegalSections />
          </>
        )
      case 'nyheter':
        return (
          <>
            <Nyheter />
            <CTABanner />
            <Kontakt />
            <LegalSections />
          </>
        )
      case 'talentportalen':
        return (
          <>
            <Talentportalen />
            <CTABanner />
            <Kontakt />
            <LegalSections />
          </>
        )
      case 'om-oss':
        return (
          <>
            <OmOss />
            <FAQ />
            <Kontakt />
            <LegalSections />
          </>
        )
      case 'kontakt':
        return (
          <>
            <Kontakt />
            <LegalSections />
          </>
        )
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
        {newsSlug ? (
          <NewsArticlePage slug={newsSlug} />
        ) : (
          renderSectionRoute()
        )}
      </main>
      <Footer />
      <BackToTop />
      <CookieConsent />
    </>
  )
}
