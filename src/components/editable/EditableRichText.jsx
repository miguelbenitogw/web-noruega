import { useCallback, useEffect, useMemo, useState } from 'react'
import { CONTENT_OVERRIDE_EVENT } from '../../lib/contentOverrides'
import { commitOverrideValue, readOverrideValue, useVisualEditEnabled } from './EditableText'

const isBrowser = () => typeof window !== 'undefined'

export default function EditableRichText({
  path,
  value,
  onCommit,
  renderPreview,
  modalTitle = 'Rediger innhold',
}) {
  const enabled = useVisualEditEnabled()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(() => `${readOverrideValue(path, value) ?? ''}`)
  const [resolvedValue, setResolvedValue] = useState(() => readOverrideValue(path, value) ?? '')

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResolvedValue(readOverrideValue(path, value) ?? '')
  }, [path, value])

  useEffect(() => {
    if (!isBrowser()) return undefined
    const sync = () => setResolvedValue(readOverrideValue(path, value) ?? '')
    window.addEventListener(CONTENT_OVERRIDE_EVENT, sync)
    return () => window.removeEventListener(CONTENT_OVERRIDE_EVENT, sync)
  }, [path, value])

  const preview = useMemo(() => (
    renderPreview ? renderPreview(resolvedValue ?? '') : <pre className="whitespace-pre-wrap">{resolvedValue}</pre>
  ), [renderPreview, resolvedValue])

  const save = useCallback(() => {
    const nextValue = draft.trimEnd()
    const persistedValue = onCommit ? onCommit(nextValue, path) : commitOverrideValue(path, nextValue)
    setResolvedValue(persistedValue)
    setOpen(false)
  }, [draft, onCommit, path])

  if (!enabled) {
    return preview
  }

  return (
    <>
      <div
        className="group relative rounded-3xl outline outline-1 outline-transparent transition-all duration-150 hover:outline-primary-300/70 hover:bg-primary-50/30"
        data-editable-path={path}
      >
        {preview}
        <button
          type="button"
          onClick={() => {
            setDraft(`${resolvedValue ?? ''}`)
            setOpen(true)
          }}
          className="absolute right-4 top-4 rounded-full border border-primary-200 bg-white/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-600 shadow-sm transition-transform hover:-translate-y-0.5"
        >
          Edit markdown
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-navy/60 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-4xl rounded-[28px] border border-white/10 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-600">Visual edit</p>
                <h3 className="font-heading text-2xl font-bold text-ink">{modalTitle}</h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:border-gray-300 hover:text-ink"
              >
                Lukk
              </button>
            </div>

            <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1.2fr,0.8fr]">
              <div>
                <label className="mb-2 block text-sm font-semibold text-ink" htmlFor={`editable-richtext-${path}`}>
                  Markdown
                </label>
                <textarea
                  id={`editable-richtext-${path}`}
                  autoFocus
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                      event.preventDefault()
                      save()
                    }
                    if (event.key === 'Escape') {
                      event.preventDefault()
                      setOpen(false)
                    }
                  }}
                  className="min-h-[420px] w-full rounded-3xl border border-primary-200 bg-surface px-4 py-4 font-mono text-sm leading-7 text-ink shadow-inner outline-none focus:border-primary-500"
                />
                <p className="mt-3 text-xs text-gray-500">Tips: bruk Ctrl/Cmd + Enter for å lagre.</p>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-ink">Forhåndsvisning</p>
                <div className="max-h-[420px] overflow-auto rounded-3xl border border-gray-100 bg-white p-5 shadow-inner">
                  {renderPreview ? renderPreview(draft) : <pre className="whitespace-pre-wrap">{draft}</pre>}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-5">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:border-gray-300 hover:text-ink"
              >
                Avbryt
              </button>
              <button
                type="button"
                onClick={save}
                className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-200 transition-all hover:-translate-y-0.5 hover:bg-primary-700"
              >
                Lagre lokalt
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
