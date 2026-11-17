import { Fragment } from 'react'
import { parseInlineLinkTokens } from '../../utils/inlineLinkParser'
import { splitParagraphs } from '../../lib/paragraphs'

/**
 * RichText — un texto de los datos, pintado con sus párrafos y sus enlaces.
 *
 * Reemplaza a los tres envoltorios del editor visual (EditableText,
 * InlineRichText y EditableImage), que sobrevivieron al admin solo para
 * renderizar. Cada uno resolvía los saltos de línea a su manera:
 *
 *  · EditableText partía por `\n` y metía `<br>`, así que un párrafo nuevo
 *    era una línea en blanco DENTRO del mismo <p>.
 *  · InlineRichText usaba `whitespace-pre-wrap`, que respeta literalmente
 *    cada espacio del dato. Por eso el último párrafo de «Vårt tilbud» salía
 *    corrido a la derecha: en publishedContent.js arranca con trece espacios.
 *
 * Acá hay una sola regla: una línea en blanco separa párrafos, cada párrafo
 * se recorta y un salto simple es un `<br>`. Con un párrafo sale un único
 * elemento `as`; con varios, un contenedor `.gw-stack` que lleva TODO el
 * estilo y párrafos desnudos que lo heredan, de modo que no pueden diferir
 * entre sí.
 *
 * El markdown (`##`, listas) está aparte, en MarkdownText: solo lo usan tres
 * bloques de páginas que se cargan bajo demanda, y acá viajaría en el chunk
 * compartido que baja toda visita.
 *
 * Props:
 *  · `value`     — el string de los datos.
 *  · `as`        — etiqueta cuando es un solo párrafo (por defecto `p`).
 *  · `className` — tipografía, color, medida y márgenes del bloque.
 *  · `tone`      — 'light' (por defecto) o 'dark' para bandas navy. Solo
 *                  cambia el enlace: el color del texto lo pone `className`.
 */

const LINK_CLASS = {
  light:
    'text-primary-600 underline decoration-primary-200 underline-offset-2 transition-colors hover:text-primary-700 hover:decoration-primary-400',
  /* Sobre navy: blanco con el subrayado en azul claro, que se aclara al pasar. */
  dark: 'text-white underline decoration-primary-400 underline-offset-4 transition-colors hover:decoration-white',
}

/* El texto de un párrafo con sus enlaces `[texto](/ruta)` y sus saltos. */
export function InlineLinks({ text, tone = 'light' }) {
  return String(text).split('\n').map((line, lineIndex) => (
    <Fragment key={lineIndex}>
      {lineIndex > 0 && <br />}
      {parseInlineLinkTokens(line.trim()).map((token, i) =>
        token.type === 'link' ? (
          <a key={i} href={token.href} className={LINK_CLASS[tone] || LINK_CLASS.light}>
            {token.value}
          </a>
        ) : (
          <Fragment key={i}>{token.value}</Fragment>
        ),
      )}
    </Fragment>
  ))
}

export default function RichText({ value, as = 'p', className = '', tone = 'light', ...rest }) {
  const Tag = as
  const paragraphs = splitParagraphs(value)

  // Un solo párrafo (o ninguno: el envoltorio se conserva porque a veces
  // lleva el `id` de un `aria-labelledby`).
  if (paragraphs.length <= 1) {
    return (
      <Tag className={className || undefined} {...rest}>
        {paragraphs[0] ? <InlineLinks text={paragraphs[0]} tone={tone} /> : null}
      </Tag>
    )
  }

  return (
    <div className={`gw-stack ${className}`.trim()} {...rest}>
      {paragraphs.map((paragraph, i) => (
        <p key={i}>
          <InlineLinks text={paragraph} tone={tone} />
        </p>
      ))}
    </div>
  )
}
