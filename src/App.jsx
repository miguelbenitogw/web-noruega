import { useEffect, useState } from 'react'
import './index.css'
import Navbar from './components/Navbar'
import ScrollProgress from './components/ScrollProgress'
import Hero from './components/Hero'
import Partners from './components/Partners'
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
import { initAnalyticsWithConsent } from './lib/analytics'
import NewsArticlePage from './pages/NewsArticlePage'
import { setDefaultSEO } from './lib/seo'

const getNewsSlugFromPath = (pathname) => {
  const match = pathname.match(/^\/nyheter\/([^/]+)\/?$/)
  return match ? match[1] : null
}

export default function App() {
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname)
  const newsSlug = getNewsSlugFromPath(currentPath)

  useEffect(() => {
    if (localStorage.getItem('gw-cookies') === 'accepted') {
      initAnalyticsWithConsent()
    }
  }, [])

  useEffect(() => {
    const onPopState = () => setCurrentPath(window.location.pathname)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
    if (!newsSlug) setDefaultSEO()
  }, [newsSlug])

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
          <>
            <Hero />
            <Partners />
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
        )}
      </main>
      <Footer />
      <BackToTop />
      <CookieConsent />
    </>
  )
}
