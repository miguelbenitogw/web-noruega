import { Fragment, createElement, useMemo } from 'react'
import { parseInlineLinkTokens } from '../../utils/inlineLinkParser'

/**
 * `text-gray-700` era el gris por defecto de Tailwind, y el sistema dice con
 * todas las letras que esos grises no existen en esta marca: el texto
 * secundario es `ink-muted`, entintado de navy. No se notaba porque todas las
 * llamadas lo pisan con `!text-ink-muted` —y ese `!` existe justamente porque
 * el color de acá competía con el de ellas—, pero el día que alguien escriba
 * un párrafo sin pisarlo, le sale un gris de otra paleta.
 */
const DEFAULT_ROOT_CLASSNAME = 'whitespace-pre-wrap text-ink-muted leading-relaxed'
const DEFAULT_LINK_CLASSNAME = 'text-primary-600 underline decoration-primary-200 underline-offset-2 transition-colors hover:text-primary-700 hover:decoration-primary-400'

const joinClassNames = (...values) => values.filter(Boolean).join(' ')

export default function InlineRichText({
  value = '',
  as: RootComponent = 'div',
  className = '',
  linkClassName = '',
  ...rest
}) {
  const tokens = useMemo(() => parseInlineLinkTokens(value), [value])

  const rootClassName = joinClassNames(DEFAULT_ROOT_CLASSNAME, className)
  const resolvedLinkClassName = joinClassNames(DEFAULT_LINK_CLASSNAME, linkClassName)

  return createElement(
    RootComponent,
    { className: rootClassName, ...rest },
    tokens.map((token, index) => {
      if (token.type === 'link') {
        return createElement(
          'a',
          {
            key: `link-${index}`,
            href: token.href,
            className: resolvedLinkClassName,
          },
          token.value,
        )
      }

      return (
        <Fragment key={`text-${index}`}>
          {token.value}
        </Fragment>
      )
    }),
  )
}
