import { SealCheck } from '@phosphor-icons/react'
import useContent from '../../hooks/useContent'

/**
 * TrustMarks — las credenciales verificables, en una línea.
 *
 * Quien compra para una kommune se pregunta dos cosas antes de leer nada:
 * «¿esto es una empresa de verdad?» y «¿es un vikarbyrå?». Las respuestas ya
 * estaban en la web, pero enterradas: la ISO en la cuarta columna de servicios,
 * lo del vikarbyrå en la sexta pregunta del FAQ. Acá suben al primer pantallazo,
 * con las mismas palabras que usa la meta description de la portada.
 *
 * Es una lista y no un párrafo con separadores: cada credencial es un hecho
 * independiente y un lector de pantalla las anuncia como tal («lista, 4
 * elementos»). El sello es el mismo en todas porque dicen lo mismo —esto se
 * puede comprobar—, no cuatro iconos decorativos distintos.
 *
 * Props:
 *  · `tone`  — 'dark' sobre navy, 'light' sobre blanco o `surface`.
 *  · `items`   — por defecto las de `trustMarks` en el contenido.
 *  · `stacked` — una sola columna, para la columna lateral de PageHero.
 */
const TONES = {
  dark: { text: 'text-primary-100', icon: 'text-primary-300' },
  light: { text: 'text-ink-muted', icon: 'text-primary-600' },
}

export default function TrustMarks({ tone = 'light', items, stacked = false, className = '' }) {
  const content = useContent('trustMarks')
  const list = items || content.items || []
  const t = TONES[tone] || TONES.light

  if (!list.length) return null

  return (
    <ul
      aria-label={content.label}
      // Retícula de dos y no `flex-wrap`: con wrap, cuatro credenciales de
      // largo distinto caían 3 + 1 y la última quedaba huérfana en su línea.
      className={`grid ${stacked ? "" : "sm:grid-cols-2"} gap-x-8 gap-y-3 font-ui text-body-xs font-medium ${t.text} ${className}`}
    >
      {list.map((item) => (
        <li key={item} className="flex items-start gap-2 leading-snug">
          <SealCheck size={17} weight="regular" aria-hidden="true" className={`shrink-0 mt-px ${t.icon}`} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}
