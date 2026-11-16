/* eslint-disable react-refresh/only-export-components */
import { parseInlineLinkTokens } from '../utils/inlineLinkParser'

/**
 * MarkdownArticle — el cuerpo del artículo.
 *
 * Esto es lo único de la web que se lee seguido durante cinco minutos, así que
 * se trata como tipografía editorial y no como «contenido»:
 *
 *  · La medida la pone la página (columna de ~38rem). Antes el cuerpo ocupaba
 *    todo el contenedor de 48rem: en serif a 18px eso son ~85 caracteres por
 *    línea, veinte más de lo que el ojo sigue sin perderse de renglón.
 *  · El primer párrafo entra más grande: invita a empezar.
 *  · Los párrafos que abren con raya («– Jeg hadde venner…») son diálogo de
 *    entrevista. Van con sangría francesa, que es como lo compone la prensa:
 *    la raya cuelga en el margen y la columna de texto queda recta.
 *  · Las listas no llevan viñeta redonda sino un filete corto, el mismo gesto
 *    que `.gw-label`.
 *  · Se añadieron listas numeradas y citas: el markdown de las noticias ya
 *    usaba «1. 2. 3.» y nadie lo estaba renderizando — los tres pasos del
 *    artículo de Talentportalen salían pegados dentro de un mismo párrafo.
 */

// Escala del cuerpo. El ancho de columna NO vive acá: lo decide la página.
export const ARTICLE_BODY_MEASURE_CLASS = 'text-body lg:text-[1.125rem] leading-[1.78]'

const LEAD_CLASS = 'text-[1.1875rem] lg:text-[1.3125rem] leading-[1.58] text-navy'

const LINK_CLASS = 'text-primary-700 underline decoration-primary-300 decoration-1 underline-offset-[3px] hover:text-navy hover:decoration-navy transition-colors'

// Sangría francesa del diálogo. La raya sale al margen izquierdo.
const DIALOGUE_CLASS = 'pl-[0.85em] [text-indent:-0.85em]'

const DIALOGUE_RE = /^[–—]\s/
// Uno o dos dígitos a propósito: así una frase que arranca con un año
// («2014. El año que…») no se convierte en una lista numerada.
const ORDERED_ITEM_RE = /^\d{1,2}[.)]\s+/

const isExternal = (href) => href.startsWith('https://')

const renderInline = (text, baseKey) => {
  const tokens = parseInlineLinkTokens(text, { allowExternal: true })
  if (tokens.length === 1 && tokens[0].type === 'text') return text
  return tokens.map((token, i) =>
    token.type === 'link'
      ? <a
          key={`${baseKey}-l${i}`}
          href={token.href}
          className={LINK_CLASS}
          {...(isExternal(token.href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >{token.value}</a>
      : token.value
  )
}

const slugifyHeading = (value) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')

const createHeadingIdGenerator = () => {
  const seen = new Map()
  return (heading) => {
    const base = slugifyHeading(heading) || 'seksjon'
    const count = seen.get(base) || 0
    seen.set(base, count + 1)
    return count === 0 ? base : `${base}-${count}`
  }
}

export const getMarkdownSections = (markdown) => {
  const lines = markdown.split('\n')
  const nextHeadingId = createHeadingIdGenerator()

  return lines
    .map(rawLine => rawLine.trim())
    .filter(line => line.startsWith('## '))
    .map(line => {
      const title = line.replace(/^##\s+/, '').trim()
      return { title, id: nextHeadingId(title) }
    })
}

export default function MarkdownArticle({ markdown }) {
  const lines = (markdown || '').split('\n')
  const nodes = []
  const paragraphBuffer = []
  const quoteBuffer = []
  let listItems = []
  let listKind = null
  let keyIndex = 0
  let paragraphCount = 0
  const nextHeadingId = createHeadingIdGenerator()

  const flushParagraph = () => {
    if (!paragraphBuffer.length) return
    const text = paragraphBuffer.join(' ').trim()
    paragraphBuffer.length = 0
    if (!text) return

    const key = `p-${keyIndex++}`
    const isLead = paragraphCount === 0
    paragraphCount += 1

    const className = [
      isLead ? LEAD_CLASS : `${ARTICLE_BODY_MEASURE_CLASS} text-ink`,
      DIALOGUE_RE.test(text) ? DIALOGUE_CLASS : null,
      'mb-6',
    ].filter(Boolean).join(' ')

    nodes.push(<p key={key} className={className}>{renderInline(text, key)}</p>)
  }

  const flushList = () => {
    if (!listItems.length) {
      listKind = null
      return
    }

    const items = listItems
    listItems = []
    const key = `list-${keyIndex++}`

    if (listKind === 'ordered') {
      nodes.push(
        <ol
          key={key}
          className={`${ARTICLE_BODY_MEASURE_CLASS} mb-7 list-decimal space-y-2.5 pl-7 text-ink
                      marker:font-ui marker:text-[0.9375rem] marker:font-semibold marker:text-primary-600`}
        >
          {items.map((item, i) => <li key={`${key}-${i}`}>{renderInline(item, `${key}-${i}`)}</li>)}
        </ol>,
      )
      listKind = null
      return
    }

    nodes.push(
      <ul key={key} className={`${ARTICLE_BODY_MEASURE_CLASS} mb-7 space-y-2.5 text-ink`}>
        {items.map((item, i) => (
          <li
            key={`${key}-${i}`}
            className="relative pl-6 before:absolute before:left-0 before:top-[0.85em]
                       before:h-px before:w-3 before:bg-primary-400"
          >
            {renderInline(item, `${key}-${i}`)}
          </li>
        ))}
      </ul>,
    )
    listKind = null
  }

  const flushQuote = () => {
    if (!quoteBuffer.length) return
    const text = quoteBuffer.join(' ').trim()
    quoteBuffer.length = 0
    if (!text) return

    const key = `bq-${keyIndex++}`
    nodes.push(
      <blockquote
        key={key}
        className="my-9 border-l-2 border-primary-300 pl-6 text-[1.1875rem] lg:text-[1.3125rem]
                   leading-[1.55] text-navy"
      >
        {renderInline(text, key)}
      </blockquote>,
    )
  }

  // Cierra lo que esté abierto antes de empezar un bloque de otro tipo.
  const flushAll = () => {
    flushList()
    flushQuote()
    flushParagraph()
  }

  for (const rawLine of lines) {
    const line = rawLine.trim()

    if (!line) {
      flushAll()
      continue
    }

    if (line.startsWith('## ')) {
      flushAll()
      const headingText = line.replace(/^##\s+/, '')
      const headingId = nextHeadingId(headingText)
      nodes.push(
        <h2
          id={headingId}
          key={`h2-${keyIndex++}`}
          className="scroll-mt-28 mt-14 mb-5 font-heading text-[1.5rem] lg:text-[1.75rem]
                     font-semibold text-navy first:mt-0"
        >
          {renderInline(headingText, `h2-${keyIndex}`)}
        </h2>,
      )
      continue
    }

    if (line.startsWith('### ')) {
      flushAll()
      const headingText = line.replace(/^###\s+/, '')
      const headingId = nextHeadingId(headingText)
      nodes.push(
        <h3
          id={headingId}
          key={`h3-${keyIndex++}`}
          className="scroll-mt-28 mt-10 mb-3.5 font-heading text-[1.125rem] lg:text-[1.1875rem]
                     font-semibold text-ink"
        >
          {renderInline(headingText, `h3-${keyIndex}`)}
        </h3>,
      )
      continue
    }

    if (line.startsWith('> ')) {
      flushList()
      flushParagraph()
      quoteBuffer.push(line.replace(/^>\s+/, ''))
      continue
    }

    if (line.startsWith('- ') || line.startsWith('* ')) {
      flushQuote()
      flushParagraph()
      if (listKind === 'ordered') flushList()
      listKind = 'bullet'
      listItems.push(line.slice(2).trim())
      continue
    }

    if (ORDERED_ITEM_RE.test(line)) {
      flushQuote()
      flushParagraph()
      if (listKind === 'bullet') flushList()
      listKind = 'ordered'
      listItems.push(line.replace(ORDERED_ITEM_RE, '').trim())
      continue
    }

    flushList()
    flushQuote()
    paragraphBuffer.push(line)
  }

  flushAll()

  return <div className="[&>*:last-child]:mb-0">{nodes}</div>
}
