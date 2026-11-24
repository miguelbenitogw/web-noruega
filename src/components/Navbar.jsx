import { useState, useRef, useEffect } from 'react'
import { IMAGES } from '../assets/images'
import useContent from '../hooks/useContent'

/**
 * Navbar
 *
 * Antes: fondo translúcido con `backdrop-blur` y `shadow-md` al bajar, y un
 * puntito bajo el enlace activo. Ahora: blanco sólido con un filete abajo —
 * una sombra difusa sobre blanco no separa nada, solo ensucia — y el activo
 * se marca con un subrayado naranja de 2 px, que es el gesto de la marca.
 */

// ─── Active-path detection ───────────────────────────────────────────────────
function useCurrentPath() {
  const [path, setPath] = useState(() => window.location.pathname)
  useEffect(() => {
    const handler = () => setPath(window.location.pathname)
    window.addEventListener('popstate', handler)
    return () => window.removeEventListener('popstate', handler)
  }, [])
  return path
}

function matchesHref(href, currentPath) {
  if (href === '/') return currentPath === '/'
  return currentPath === href || currentPath.startsWith(href + '/')
}

// Returns the single most-specific (longest) href that matches the current path,
// so only ONE nav item lights up even when routes are nested.
function computeActiveHref(currentPath, navLinks) {
  let best = null
  const consider = (href) => {
    if (!href) return
    if (matchesHref(href, currentPath) && (!best || href.length > best.length)) best = href
  }
  navLinks.forEach((link) => {
    consider(link.href)
    ;(link.children || []).forEach((child) => consider(child.href))
  })
  return best
}

// Subrayado del enlace activo — 2 px naranja, no un punto flotante.
function ActiveRule({ visible }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute left-3 right-3 -bottom-px h-[2px] bg-cta transition-opacity duration-200 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    />
  )
}

// Sin salto en xl. Nueve enlaces más el logo y el botón necesitaban 1315 px,
// y `.container-xl` da como mucho 1296 (max-w-7xl son 1360 px con el rem a 17,
// menos el padding): la barra no entraba en NINGÚN viewport, ni en un 4K — el
// botón «Kontakt» quedaba cortado. El `xl:px-3` la ensanchaba justo donde más
// sitio parecía haber. Si algún día entra un décimo enlace, esto no se arregla
// apretando píxeles: hay que agrupar en un desplegable.
const linkClasses = (scrolled, active) =>
  `relative whitespace-nowrap px-2 py-5 font-ui text-body-xs transition-colors duration-200 ${
    scrolled
      ? active ? 'text-navy font-semibold' : 'text-ink-muted hover:text-navy font-medium'
      : active ? 'text-white font-semibold' : 'text-white/80 hover:text-white font-medium'
  }`

// ─── Desktop dropdown ────────────────────────────────────────────────────────
function DropdownMenu({ link, scrolled, activeHref }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const parentActive =
    link.href === activeHref ||
    (link.children || []).some(c => c.href === activeHref)

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])


  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        className={`${linkClasses(scrolled, parentActive)} flex items-center gap-1`}
        onClick={() => setOpen(v => !v)}
      >
        <span>{link.label}</span>
        <svg
          width="13" height="13" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
          aria-hidden="true"
          className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
        <ActiveRule visible={parentActive} />
      </button>

      {open && (
        <div className="absolute top-full left-0 w-56 bg-white border border-line rounded-panel py-2 z-50">
          {link.children.map(child => (
            <a
              key={child.href}
              href={child.href}
              className={`block px-4 py-2.5 font-ui text-sm transition-colors duration-150 ${
                child.href === activeHref
                  ? 'text-navy font-semibold bg-surface'
                  : 'text-ink-muted hover:bg-surface hover:text-navy'
              }`}
            >
              {child.label}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(() => typeof window !== 'undefined' && window.scrollY > 60)
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpenDropdown, setMobileOpenDropdown] = useState(null)
  const c = useContent('navbar')
  const navLinks = c.links || []
  const currentPath = useCurrentPath()
  const activeHref = computeActiveHref(currentPath, navLinks)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        scrolled ? 'bg-white border-b border-line' : 'bg-transparent'
      }`}
    >
      <div className="container-xl">
        <div className="flex items-center justify-between h-16 xl:h-[4.5rem]">

          <a href="/" aria-label="Global Working Norge – hjem" className="gw-tap shrink-0">
            <img
              src={scrolled ? IMAGES.logoColor : IMAGES.logo}
              alt="Global Working Norge"
              className="h-8 lg:h-10 w-auto transition-opacity duration-300 object-contain"
              style={scrolled ? { mixBlendMode: 'multiply' } : undefined}
              width="200"
              height="36"
              loading="eager"
            />
          </a>

          {/* Desktop nav */}
          <nav className="hidden xl:flex items-center" aria-label="Primær navigasjon">
            {navLinks.map((link) => {
              if (link.children?.length) {
                return (
                  <DropdownMenu
                    key={link.href}
                    link={link}
                    scrolled={scrolled}
                    activeHref={activeHref}
                  />
                )
              }

              if (link.cta) {
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    className={`ml-3 gw-btn whitespace-nowrap px-5 py-2.5 text-sm ${
                      scrolled ? 'gw-btn-ink' : 'gw-btn-ghost'
                    }`}
                  >
                    <span>{link.label}</span>
                  </a>
                )
              }

              const active = link.href === activeHref

              return (
                <a key={link.href} href={link.href} className={linkClasses(scrolled, active)}>
                  <span>{link.label}</span>
                  <ActiveRule visible={active} />
                </a>
              )
            })}
          </nav>

          {/* Mobile hamburger.
              El icono mide 24 px: con `p-2` el botón quedaba en 41x41 y es el
              control más importante del móvil. `p-2.5` lo deja en 44x44
              exactos, y el margen negativo crece igual para que el borde
              óptico del botón siga alineado con el del contenedor. */}
          <button
            className={`xl:hidden p-2.5 -mr-2.5 transition-colors ${scrolled ? 'text-navy' : 'text-white'}`}
            onClick={() => setMenuOpen(v => !v)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Lukk meny' : 'Åpne meny'}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              {menuOpen
                ? <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round"/>
                : <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round"/>
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="xl:hidden bg-white border-t border-line max-h-[calc(100vh-4rem)] overflow-y-auto">
          <nav className="container-xl py-3 flex flex-col" aria-label="Mobil navigasjon">
            {navLinks.map((link) => {

              if (link.children?.length) {
                const isOpen = mobileOpenDropdown === link.href
                const parentActive = link.href === activeHref || link.children.some(c => c.href === activeHref)
                return (
                  <div key={link.href} className="border-b border-line last:border-b-0">
                    <button
                      type="button"
                      className={`w-full flex items-center justify-between py-4 font-ui text-left transition-colors ${
                        parentActive ? 'text-navy font-semibold' : 'text-ink-muted'
                      }`}
                      onClick={() => setMobileOpenDropdown(isOpen ? null : link.href)}
                      aria-expanded={isOpen}
                    >
                      <span>{link.label}</span>
                      <svg
                        width="16" height="16" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                        aria-hidden="true"
                        className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>
                    {isOpen && (
                      <div className="pb-3 flex flex-col">
                        {link.children.map(child => (
                          <a
                            key={child.href}
                            href={child.href}
                            onClick={() => setMenuOpen(false)}
                            className={`py-2.5 pl-4 font-ui text-sm border-l-2 transition-colors ${
                              child.href === activeHref
                                ? 'text-navy font-semibold border-cta'
                                : 'text-ink-muted border-line'
                            }`}
                          >
                            {child.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )
              }

              if (link.cta) {
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="gw-btn gw-btn-ink mt-4 mb-2 w-full"
                  >
                    {link.label}
                  </a>
                )
              }

              const active = link.href === activeHref
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`py-4 font-ui border-b border-line last:border-b-0 transition-colors ${
                    active ? 'text-navy font-semibold' : 'text-ink-muted'
                  }`}
                >
                  <span>{link.label}</span>
                </a>
              )
            })}
          </nav>
        </div>
      )}
    </header>
  )
}
