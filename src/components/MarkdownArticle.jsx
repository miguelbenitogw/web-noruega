/* eslint-disable react-refresh/only-export-components */
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
    <p key={key} className="text-gray-700 leading-relaxed mb-4">
      {text}
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
      <ul key={`ul-${keyIndex++}`} className="list-disc pl-6 mb-4 space-y-1 text-gray-700">
        {listItems.map(item => <li key={`${keyIndex++}-${item.slice(0, 12)}`}>{item}</li>)}
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
          {headingText}
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
          {headingText}
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
