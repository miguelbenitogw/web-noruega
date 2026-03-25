import { useRef } from 'react'

const toolbarButtonClass = 'inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700'

const assistantBlocks = [
  {
    id: 'template',
    label: 'Start med mal',
    content: '## Kort oppsummering\n\nSkriv to til tre setninger som forklarer hovedpoenget.\n\n## Hva betyr dette?\n\nForklar konsekvensene for kandidaten, kunden eller markedet.\n\n## Neste steg\n\nAvslutt med anbefaling, CTA eller praktisk informasjon.',
    replaceWhenEmpty: true,
  },
  {
    id: 'heading',
    label: 'Mellomtittel',
    content: '## Ny seksjon\n\n',
  },
  {
    id: 'subheading',
    label: 'Underoverskrift',
    content: '### Viktig detalj\n\n',
  },
  {
    id: 'paragraph',
    label: 'Avsnitt',
    content: 'Nytt avsnitt med ren tekst.\n\n',
  },
  {
    id: 'list',
    label: 'Punktliste',
    content: '- Første punkt\n- Andre punkt\n- Tredje punkt\n\n',
  },
  {
    id: 'quote',
    label: 'Sitat',
    content: '> Viktig sitat eller nøkkelpoeng.\n\n',
  },
]

const normaliseInsertion = (currentValue, snippet, replaceWhenEmpty) => {
  const text = String(currentValue || '')

  if (!text.trim() && replaceWhenEmpty) {
    return snippet
  }

  if (!text.trim()) {
    return snippet.trimStart()
  }

  const needsBreak = !text.endsWith('\n')
  const spacer = needsBreak ? '\n\n' : '\n'
  return `${text}${spacer}${snippet}`
}

export default function AdminNewsBodyEditor({ value, onChange }) {
  const textareaRef = useRef(null)

  const insertSnippet = (snippet, replaceWhenEmpty = false) => {
    const textarea = textareaRef.current
    const currentValue = String(value || '')

    if (!textarea) {
      onChange(normaliseInsertion(currentValue, snippet, replaceWhenEmpty))
      return
    }

    const selectionStart = textarea.selectionStart ?? currentValue.length
    const selectionEnd = textarea.selectionEnd ?? currentValue.length
    const selectedText = currentValue.slice(selectionStart, selectionEnd)

    let nextValue = currentValue

    if (!currentValue.trim() && replaceWhenEmpty) {
      nextValue = snippet
    } else if (selectionStart !== selectionEnd && selectedText.trim()) {
      nextValue = `${currentValue.slice(0, selectionStart)}${snippet}${currentValue.slice(selectionEnd)}`
    } else {
      const prefix = currentValue.slice(0, selectionStart)
      const suffix = currentValue.slice(selectionEnd)
      const insertionPrefix = prefix && !prefix.endsWith('\n') ? '\n\n' : prefix ? '\n' : ''
      nextValue = `${prefix}${insertionPrefix}${snippet}${suffix}`
    }

    onChange(nextValue)

    requestAnimationFrame(() => {
      textarea.focus()
      const cursor = Math.min(nextValue.length, selectionStart + snippet.length + 2)
      textarea.setSelectionRange(cursor, cursor)
    })
  }

  return (
    <div className="space-y-4 rounded-[28px] border border-slate-200 bg-slate-50/80 p-4">
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {assistantBlocks.map((block) => (
            <button
              key={block.id}
              type="button"
              onClick={() => insertSnippet(block.content, block.replaceWhenEmpty)}
              className={toolbarButtonClass}
            >
              {block.label}
            </button>
          ))}
        </div>

        <p className="text-xs leading-6 text-slate-500">
          Du trenger ikke skrive markdown manuelt. Bruk knappene for å bygge struktur, og skriv vanlig tekst i feltet under.
        </p>
      </div>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={12}
        className="min-h-[260px] w-full resize-y rounded-[24px] border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-800 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
        placeholder="Skriv artikkelteksten her. Vanlig tekst blir fine avsnitt i forhåndsvisningen."
      />
    </div>
  )
}
