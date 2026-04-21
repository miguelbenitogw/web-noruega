/* eslint-disable react-refresh/only-export-components */
import { parseInlineLinkTokens } from '../utils/inlineLinkParser'

export const ARTICLE_BODY_MEASURE_CLASS = 'max-w-[68ch] text-[1.0625rem] leading-[1.85]'

const LINK_CLASS = 'text-primary-600 underline decoration-primary-200 underline-offset-2 hover:text-primary-700 transition-colors'

const renderInline = (text, baseKey) => {
  const tokens = parseInlineLinkTokens(text)
  if (tokens.length === 1 && tokens[0].type === 'text') return text
  return tokens.map((token, i) =>
    token.type === 'link'
      ? <a key={`${baseKey}-l${i}`} href={token.href} className={LINK_CLASS}>{token.value}</a>
      : token.value
  )
}

const slugifyHeading = (value) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
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

const flushParagraph = (buffer, key) => {
  if (!buffer.length) return null
  const text = buffer.join(' ').trim()
  buffer.length = 0
  if (!text) return null
  return (
    <p key={key} className={`${ARTICLE_BODY_MEASURE_CLASS} mb-5 text-gray-700`}>
      {renderInline(text, key)}
    </p>
  )
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
  const lines = markdown.split('\n')
  const nodes = []
  const paragraphBuffer = []
  let listItems = []
  let keyIndex = 0
  const nextHeadingId = createHeadingIdGenerator()

  const flushList = () => {
    if (!listItems.length) return
    nodes.push(
      <ul key={`ul-${keyIndex++}`} className={`${ARTICLE_BODY_MEASURE_CLASS} list-disc pl-6 mb-5 space-y-1 text-gray-700`}>
        {listItems.map((item, i) => <li key={`${keyIndex++}-${i}`}>{renderInline(item, `li-${keyIndex}`)}</li>)}
      </ul>,
    )
    listItems = []
  }

  for (const rawLine of lines) {
    const line = rawLine.trim()

    if (!line) {
      flushList()
      const paragraphNode = flushParagraph(paragraphBuffer, `p-${keyIndex++}`)
      if (paragraphNode) nodes.push(paragraphNode)
      continue
    }

    if (line.startsWith('## ')) {
      flushList()
      const paragraphNode = flushParagraph(paragraphBuffer, `p-${keyIndex++}`)
      if (paragraphNode) nodes.push(paragraphNode)
      const headingText = line.replace(/^##\s+/, '')
      const headingId = nextHeadingId(headingText)
      nodes.push(
        <h2 id={headingId} key={`h2-${keyIndex++}`} className="font-heading text-2xl font-bold text-ink mt-8 mb-4 scroll-mt-28">
          {renderInline(headingText, `h2-${keyIndex}`)}
        </h2>,
      )
      continue
    }

    if (line.startsWith('### ')) {
      flushList()
      const paragraphNode = flushParagraph(paragraphBuffer, `p-${keyIndex++}`)
      if (paragraphNode) nodes.push(paragraphNode)
      const headingText = line.replace(/^###\s+/, '')
      const headingId = nextHeadingId(headingText)
      nodes.push(
        <h3 id={headingId} key={`h3-${keyIndex++}`} className="font-heading text-xl font-semibold text-ink mt-6 mb-3 scroll-mt-28">
          {renderInline(headingText, `h3-${keyIndex}`)}
        </h3>,
      )
      continue
    }

    if (line.startsWith('- ')) {
      const paragraphNode = flushParagraph(paragraphBuffer, `p-${keyIndex++}`)
      if (paragraphNode) nodes.push(paragraphNode)
      listItems.push(line.replace(/^- /, ''))
      continue
    }

    paragraphBuffer.push(line)
  }

  flushList()
  const paragraphNode = flushParagraph(paragraphBuffer, `p-${keyIndex++}`)
  if (paragraphNode) nodes.push(paragraphNode)

  return <div>{nodes}</div>
}
