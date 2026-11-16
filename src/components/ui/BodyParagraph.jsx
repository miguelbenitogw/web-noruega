import EditableText from '../editable/EditableText'

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
 * Ojo con la medida: este componente NO la impone. El ancho de lectura lo pone
 * el contenedor con `.gw-measure`, porque hay sitios que lo quieren a una
 * columna y otros a dos.
 */
export default function BodyParagraph({ path, value, className = '', tone = 'light' }) {
  const color = tone === 'dark' ? 'text-primary-100' : 'text-ink-muted'

  return (
    <EditableText
      as="p"
      path={path}
      value={value}
      multiline
      className={`text-body lg:text-[1.125rem] ${color} leading-[1.75] ${className}`}
    />
  )
}
