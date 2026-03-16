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

export default function MarkdownArticle({ markdown }) {
  const lines = markdown.split('\n')
  const nodes = []
  const paragraphBuffer = []
  let listItems = []
  let keyIndex = 0

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
      nodes.push(
        <h2 key={`h2-${keyIndex++}`} className="font-heading text-2xl font-bold text-ink mt-8 mb-4">
          {line.replace(/^##\s+/, '')}
        </h2>,
      )
      continue
    }

    if (line.startsWith('### ')) {
      flushList()
      const paragraphNode = flushParagraph(paragraphBuffer, `p-${keyIndex++}`)
      if (paragraphNode) nodes.push(paragraphNode)
      nodes.push(
        <h3 key={`h3-${keyIndex++}`} className="font-heading text-xl font-semibold text-ink mt-6 mb-3">
          {line.replace(/^###\s+/, '')}
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

