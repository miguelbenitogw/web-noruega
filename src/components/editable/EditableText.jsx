import { parseInlineLinkTokens } from '../../utils/inlineLinkParser'

/**
 * EditableText — ahora solo renderiza.
 *
 * Esto era un editor en línea de 466 líneas: leía overrides de localStorage,
 * escuchaba la sesión de edición visual, abría un textarea al hacer clic y
 * guardaba contra Supabase. Al desconectar Supabase, el editor visual dejó de
 * tener sentido, así que queda el único trabajo que importa para el visitante:
 * pintar el texto, con sus enlaces en línea y sus saltos de párrafo.
 *
 * Se mantiene el nombre y la firma (`path`, `onCommit`, `inputClassName`…)
 * para no tocar de golpe las treinta vistas que lo usan. `path` sigue saliendo
 * como `data-content-path`, que es útil para saber de dónde viene un texto
 * cuando lo buscás en `publishedContent.js`.
 */

const INLINE_LINK_CLASS =
  'text-primary-600 underline decoration-primary-200 underline-offset-2 transition-colors hover:text-primary-700'

const renderInline = (text, baseKey) => {
  const tokens = parseInlineLinkTokens(text)
  if (tokens.length === 1 && tokens[0].type === 'text') return text
  return tokens.map((token, i) => {
    if (token.type === 'link') {
      return (
        <a key={`${baseKey}-l${i}`} href={token.href} className={INLINE_LINK_CLASS}>
          {token.value}
        </a>
      )
    }
    return token.value
  })
}

const renderMarkdown = (text) => {
  if (!text) return null
  const lines = text.split('\n')
  const result = []
  let listItems = []
  let k = 0

  const flushList = () => {
    if (listItems.length === 0) return
    result.push(<ul key={k++} className="list-disc pl-5 space-y-1 mb-3">{listItems.splice(0)}</ul>)
  }

  for (const line of lines) {
    if (line.startsWith('## ')) {
      flushList()
      result.push(<h2 key={k++} className="font-heading text-xl font-semibold text-navy mt-6 mb-2">{renderInline(line.slice(3), k)}</h2>)
    } else if (line.startsWith('### ')) {
      flushList()
      result.push(<h3 key={k++} className="font-heading text-lg font-semibold text-navy mt-5 mb-1">{renderInline(line.slice(4), k)}</h3>)
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      listItems.push(<li key={k++} className="leading-relaxed">{renderInline(line.slice(2), k)}</li>)
    } else if (line.trim() === '') {
      flushList()
    } else {
      flushList()
      result.push(<p key={k++} className="mb-3 leading-relaxed">{renderInline(line, k)}</p>)
    }
  }
  flushList()
  return result.length > 0 ? result : null
}

export default function EditableText({
  path,
  value,
  as = 'span',
  className = '',
  multiline = false,
  richText = false,
  ...rest
}) {
  const Component = as

  // Props que solo tenían sentido con el editor abierto. Se sacan de `rest`
  // para que no acaben como atributos sueltos en el DOM.
  const {
    inputClassName: _inputClassName,
    placeholder: _placeholder,
    onCommit: _onCommit,
    disabled: _disabled,
    ...domProps
  } = rest

  const isEmpty = value === undefined || value === null || value === ''

  const renderValue = () => {
    // Se conserva el envoltorio aunque no haya texto: hay encabezados vacíos
    // que llevan el `id` al que apunta un `aria-labelledby`.
    if (isEmpty) return null
    if (richText && multiline && typeof value === 'string') {
      return renderMarkdown(value)
    }
    if (!multiline || typeof value !== 'string') return renderInline(value, 'sv')

    const lines = value.split('\n')
    if (lines.length <= 1) return renderInline(value, 'sv')

    return lines.map((line, i) => (
      <span key={i}>
        {renderInline(line, `sv-${i}`)}
        {i < lines.length - 1 && <br />}
      </span>
    ))
  }

  return (
    <Component className={className} data-content-path={path} {...domProps}>
      {renderValue()}
    </Component>
  )
}
