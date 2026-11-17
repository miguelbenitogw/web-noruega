/**
 * RuleList — la lista con filetes.
 *
 * Sustituyó en toda la web al patrón «círculo azul + palomita», que es el tic
 * de cualquier landing generada: acá lo que separa es la línea, no el icono.
 *
 * Estaba definida tres veces, palabra por palabra, en `HelsenorskPage`,
 * `LivetSomStudentPage` y `SpanskAlicantePage` — cada agente escribió la suya
 * sin ver las otras. Es un componente y no una clase CSS porque pinta
 * estructura: el `<ul>`, un `<li>` por elemento y el filete de cada uno.
 *
 * `tone` existe por una razón de verdad y no por gusto: sobre `bg-frost` el
 * filete `line` no se ve, así que la lista del panel de «hvorfor» lo lleva en
 * azul claro. Era la única de las cuatro copias que no cuadraba con el resto.
 */

const TONES = {
  line:  { top: 'border-t border-line',           item: 'border-b border-line' },
  panel: { top: 'border-t border-primary-200/70', item: 'border-b border-primary-200/70' },
}

export default function RuleList({ items, tone = 'line', className = '' }) {
  const rule = TONES[tone] || TONES.line

  return (
    <ul className={`${rule.top} ${className}`}>
      {items.map((item, index) => (
        <li key={`${index}-${item}`} className={`${rule.item} py-3.5 font-ui text-body-sm leading-snug text-ink`}>
          {item}
        </li>
      ))}
    </ul>
  )
}
