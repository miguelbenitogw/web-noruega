import { useEffect, useState } from 'react'

// El guard global de index.css solo frena animaciones y transiciones de CSS:
// este conteo corre con requestAnimationFrame, así que hay que preguntarle al
// sistema a mano. Se lee en cada render porque el usuario puede cambiar la
// preferencia con la página abierta, y matchMedia es barato.
const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Contador animado: cuenta de 0 a `end` cuando `active` pasa a true.
 * Acepta strings como "500+" o "50+": saca el número y conserva el sufijo.
 *
 * 900 ms y no 1,8 s: la cifra es el dato, y hacer esperar casi dos segundos
 * para leerla era decoración que le cobraba tiempo al lector.
 */
export default function useCounter(end, active, duration = 900) {
  const num = parseInt(String(end).replace(/[^0-9]/g, ''), 10)
  const suffix = String(end).replace(/[0-9]/g, '')
  const [count, setCount] = useState(0)
  const reduced = prefersReducedMotion()

  useEffect(() => {
    if (!active || isNaN(num) || reduced) return

    const startTime = performance.now()
    let frame = 0

    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1)
      // easeOutCubic: arranca rápido y frena al final. Se fuerza 1 al cerrar
      // para que el redondeo no deje la cifra un número por debajo.
      const eased = progress === 1 ? 1 : 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * num))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    // Si el componente se desmonta a mitad del conteo, no seguimos llamando a
    // setCount sobre algo que ya no existe.
    return () => cancelAnimationFrame(frame)
  }, [active, num, duration, reduced])

  // Con movimiento reducido no hay conteo: la cifra final, ya, siempre.
  if (reduced && !isNaN(num)) return `${num}${suffix}`
  return active ? `${count}${suffix}` : `0${suffix}`
}
