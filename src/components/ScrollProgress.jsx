import { useState, useEffect } from 'react'

/**
 * ScrollProgress
 *
 * Antes la barra era un degradado de azul a naranja. Dos problemas: gastaba el
 * acento de marca en un adorno de dos píxeles — y el naranja se usa una vez
 * por pantalla, así que competía con el botón que importa — y un degradado en
 * una línea tan fina no se lee como degradado, se lee como suciedad.
 *
 * Ahora es una línea sólida del azul de marca, un píxel más fina.
 */
export default function ScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight
      setProgress(total > 0 ? (window.scrollY / total) * 100 : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-px" aria-hidden="true">
      <div
        className="h-full bg-primary-500 transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
