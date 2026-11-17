import RichText from './RichText'

/**
 * BodyParagraph — párrafo de lectura.
 *
 * El cuerpo largo de las páginas de Alicante: serif, un punto más grande que
 * el texto corriente y con interlineado de lectura. Estaba definido dos veces,
 * palabra por palabra, en `HelsenorskPage` y `LivetSomStudentPage`, porque los
 * escribió el mismo agente en archivos distintos sin poder crear uno común.
 *
 * `tone="dark"` es para las bandas navy, donde el texto va en `primary-100`.
 *
 * Tampoco impone el aire entre párrafos: el contenedor lleva `.gw-stack`. Antes
 * cada llamada ponía `mt-6` (24 px) y, cuando un mismo campo traía dos
 * párrafos, entre esos dos quedaba la línea en blanco del dato (33 px): en un
 * mismo bloque convivían dos separaciones distintas.
 *
 * Ojo con la medida: este componente NO la impone. El ancho de lectura lo pone
 * el contenedor con `.gw-measure`, porque hay sitios que lo quieren a una
 * columna y otros a dos.
 */
export default function BodyParagraph({ value, className = '', tone = 'light' }) {
  const color = tone === 'dark' ? 'text-primary-100' : 'text-ink-muted'

  return (
    <RichText
      value={value}
      tone={tone}
      className={`text-body lg:text-[1.125rem] ${color} leading-[1.75] ${className}`}
    />
  )
}
