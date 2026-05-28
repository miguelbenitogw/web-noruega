import { useState, useRef, useEffect } from 'react'
import { IMAGES } from '../assets/images'
import useContent from '../hooks/useContent'
import EditableText, { createArrayItemCommitter } from './editable/EditableText'

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
// ─────────────────────────────────────────────────────────────────────────────

// ─── Desktop dropdown ────────────────────────────────────────────────────────
function DropdownMenu({ link, scrolled, index, navLinks, currentPath }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const parentActive =
    matchesHref(link.href, currentPath) ||
    (link.children || []).some(c => matchesHref(c.href, currentPath))

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const commitLabel = createArrayItemCommitter({
    basePath: 'navbar.links',
    fallbackItems: navLinks,
    index,
    field: 'label',
  })

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
        className={`relative flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
          scrolled
            ? parentActive
              ? 'text-primary-700 font-semibold'
              : 'text-ink hover:bg-primary-50 hover:text-primary-700'
            : parentActive
              ? 'text-white font-semibold'
              : 'text-white/90 hover:text-white hover:bg-white/10'
        }`}
        onClick={() => setOpen(v => !v)}
      >
        <EditableText
          as="span"
          path={`navbar.links.${index}.label`}
          value={link.label}
          onCommit={commitLabel}
          className="inline"
        />
        <svg
          width="14" height="14" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
          aria-hidden="true"
          className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
        {/* Active indicator dot */}
        <span
          aria-hidden="true"
          className={`absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full transition-all duration-200 ${
            parentActive ? 'opacity-100' : 'opacity-0'
          } ${scrolled ? 'bg-primary-600' : 'bg-white'}`}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50">
          {link.children.map(child => (
            <a
              key={child.href}
              href={child.href}
              className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors duration-150 ${
                matchesHref(child.href, currentPath)
                  ? 'text-primary-700 bg-primary-50'
                  : 'text-gray-700 hover:bg-primary-50 hover:text-primary-700'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary-400 shrink-0" aria-hidden="true" />
              {child.label}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
// ─────────────────────────────────────────────────────────────────────────────

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpenDropdown, setMobileOpenDropdown] = useState(null)
  const c = useContent('navbar')
  const navLinks = c.links || []
  const currentPath = useCurrentPath()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
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

          {/* Logo — color variant when scrolled, white when over hero */}
          <a href="/" aria-label="Global Working Norge – hjem">
            <img
              src={scrolled ? IMAGES.logoColor : IMAGES.logo}
              alt="Global Working Norge"
              className="h-9 lg:h-11 w-auto transition-opacity duration-300 object-contain"
              style={scrolled ? { mixBlendMode: 'multiply' } : undefined}
              width="200"
              height="36"
              loading="eager"
            />
          </a>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Primær navigasjon">
            {navLinks.map((link, index) => {
              // Dropdown
              if (link.children?.length) {
                return (
                  <DropdownMenu
                    key={link.href}
                    link={link}
                    scrolled={scrolled}
                    index={index}
                    navLinks={navLinks}
                    currentPath={currentPath}
                  />
                )
              }

              // CTA button
              if (link.cta) {
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    className={`ml-2 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${
                      scrolled
                        ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm'
                        : 'bg-white/15 text-white border border-white/30 hover:bg-white/25'
                    }`}
                  >
                    <EditableText
                      as="span"
                      path={`navbar.links.${index}.label`}
                      value={link.label}
                      onCommit={createArrayItemCommitter({ basePath: 'navbar.links', fallbackItems: navLinks, index, field: 'label' })}
                      className="inline"
                    />
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </a>
                )
              }

              // Regular link
              const active = matchesHref(link.href, currentPath)
              const commitLabel = createArrayItemCommitter({ basePath: 'navbar.links', fallbackItems: navLinks, index, field: 'label' })

              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`relative px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    scrolled
                      ? active
                        ? 'text-primary-700 font-semibold'
                        : 'text-ink hover:bg-primary-50 hover:text-primary-700'
                      : active
                        ? 'text-white font-semibold'
                        : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <EditableText
                    as="span"
                    path={`navbar.links.${index}.label`}
                    value={link.label}
                    onCommit={commitLabel}
                    className="inline"
                  />
                  {/* Active indicator dot */}
                  <span
                    aria-hidden="true"
                    className={`absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                      active ? 'opacity-100' : 'opacity-0'
                    } ${scrolled ? 'bg-primary-600' : 'bg-white'}`}
                  />
                </a>
              )
            })}
          </nav>

          {/* Mobile hamburger */}
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

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg">
          <nav className="container-xl py-4 flex flex-col gap-1" aria-label="Mobil navigasjon">
            {navLinks.map((link, index) => {
              const commitLabel = createArrayItemCommitter({ basePath: 'navbar.links', fallbackItems: navLinks, index, field: 'label' })

              // Dropdown (accordion)
              if (link.children?.length) {
                const isOpen = mobileOpenDropdown === link.href
                const parentActive = matchesHref(link.href, currentPath) || link.children.some(c => matchesHref(c.href, currentPath))
                return (
                  <div key={link.href}>
                    <button
                      type="button"
                      className={`w-full flex items-center justify-between px-4 py-3 font-medium rounded-md transition-colors ${
                        parentActive ? 'text-primary-700 bg-primary-50' : 'text-ink hover:bg-primary-50 hover:text-primary-700'
                      }`}
                      onClick={() => setMobileOpenDropdown(isOpen ? null : link.href)}
                      aria-expanded={isOpen}
                    >
                      <EditableText as="span" path={`navbar.links.${index}.label`} value={link.label} onCommit={commitLabel} className="inline" />
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
                      <div className="pl-4 flex flex-col gap-0.5 pb-1">
                        {link.children.map(child => (
                          <a
                            key={child.href}
                            href={child.href}
                            onClick={() => setMenuOpen(false)}
                            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${
                              matchesHref(child.href, currentPath)
                                ? 'text-primary-700 bg-primary-50'
                                : 'text-gray-600 hover:bg-primary-50 hover:text-primary-700'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-primary-400 shrink-0" aria-hidden="true" />
                            {child.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )
              }

              // CTA button (mobile)
              if (link.cta) {
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="mt-2 px-4 py-3 bg-primary-600 text-white font-semibold rounded-xl text-center hover:bg-primary-700 transition-colors"
                  >
                    {link.label}
                  </a>
                )
              }

              // Regular link (mobile)
              const active = matchesHref(link.href, currentPath)
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`px-4 py-3 font-medium rounded-md transition-colors ${
                    active
                      ? 'text-primary-700 bg-primary-50 font-semibold'
                      : 'text-ink hover:bg-primary-50 hover:text-primary-700'
                  }`}
                >
                  <EditableText
                    as="span"
                    path={`navbar.links.${index}.label`}
                    value={link.label}
                    onCommit={commitLabel}
                    className="inline"
                  />
                </a>
              )
            })}
          </nav>
        </div>
      )}
    </header>
  )
}
