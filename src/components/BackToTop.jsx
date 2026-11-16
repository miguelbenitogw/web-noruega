import { useState, useEffect } from 'react'

/**
 * BackToTop
 *
 * Cambios de aspecto: pastilla en lugar de `rounded-xl` (los dos radios del
 * sistema son pastilla y panel), navy en lugar del azul de marca — el acento
 * se reserva para la acción que vende — y fuera la `shadow-lg`: un filete
 * claro basta para despegarlo de la página.
 */
export default function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`fixed bottom-6 right-5 sm:right-6 z-50 w-11 h-11 rounded-pill bg-navy text-white
                  border border-white/15 flex items-center justify-center cursor-pointer
                  transition-all duration-300 hover:bg-primary-800 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
      }`}
      aria-label="Tilbake til toppen"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
        <path d="M18 15l-6-6-6 6"/>
      </svg>
    </button>
  )
}
