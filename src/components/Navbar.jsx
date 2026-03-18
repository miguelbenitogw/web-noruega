import { useState, useEffect } from 'react'
import { IMAGES } from '../assets/images'
import { trackEvent } from '../lib/analytics'

const navLinks = [
  { label: 'Vår rekrutteringsmodell', href: '/vr-rekrutteringsmodell' },
  { label: 'Helsesektor', href: '/helse' },
  { label: 'Nyheter', href: '/journal' },
  { label: 'Talentportalen', href: '/talentportalen' },
  { label: 'Om oss', href: '/om-oss' },
  { label: 'Kontakt', href: '/kontakt' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-transparent'
      }`}
    >
      <div className="container-xl">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <a href="/" aria-label="Global Working Norge – hjem">
            <img
              src={IMAGES.logo}
              alt="Global Working Norge"
              className={`h-8 lg:h-9 w-auto transition-all duration-300 object-contain ${scrolled ? 'brightness-0' : 'brightness-100'}`}
              width="200"
              height="36"
              loading="eager"
            />
          </a>

          <nav className="hidden lg:flex items-center gap-1" aria-label="Primær navigasjon">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  scrolled
                    ? 'text-ink hover:bg-primary-50 hover:text-primary-700'
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.label}
              </a>
            ))}
            <a
              href="/kontakt"
              onClick={() => trackEvent('cta_click', { location: 'navbar', cta: 'kom_i_gang' })}
              className="ml-3 px-5 py-2.5 bg-cta text-white rounded-lg text-sm font-semibold hover:bg-cta-600 transition-colors duration-200 shadow-sm cursor-pointer"
            >
              Kom i gang
            </a>
          </nav>

          <button
            className={`lg:hidden p-2 rounded-md transition-colors ${scrolled ? 'text-ink' : 'text-white'}`}
            onClick={() => setMenuOpen(v => !v)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Lukk meny' : 'Åpne meny'}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              {menuOpen
                ? <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round"/>
                : <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round"/>
              }
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg">
          <nav className="container-xl py-4 flex flex-col gap-1" aria-label="Mobil navigasjon">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="px-4 py-3 text-ink font-medium rounded-md hover:bg-primary-50 hover:text-primary-700 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a
              href="/kontakt"
              onClick={() => {
                trackEvent('cta_click', { location: 'mobile_nav', cta: 'kom_i_gang' })
                setMenuOpen(false)
              }}
              className="mt-2 px-5 py-3 bg-cta text-white rounded-lg font-semibold text-center hover:bg-cta-600 transition-colors"
            >
              Kom i gang
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}
