/* eslint-disable react-refresh/only-export-components, no-unused-vars */
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  CONTENT_OVERRIDE_EVENT,
  getByPath,
  readContentOverrides,
  setByPath,
  writeContentOverrides,
} from '../../lib/contentOverrides'
import LinkInsertPopover from './LinkInsertPopover'
import { isValidInternalDestination } from '../../lib/linkableAnchors'
import { sanitizeInlineLinkMarkdown, parseInlineLinkTokens } from '../../utils/inlineLinkParser'

const VISUAL_EDIT_EVENTS = ['gw-visual-edit-change', 'gw-visual-edit-state']

const isBrowser = () => typeof window !== 'undefined'

const cloneValue = (value) => {
  if (Array.isArray(value)) return value.map(cloneValue)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, cloneValue(entry)]))
  }
  return value
}

const readVisualEditState = () => {
  if (!isBrowser()) return false
  if (window.__GW_VISUAL_EDIT__?.enabled === true) return true

  const rootMode = window.document?.documentElement?.dataset?.visualEditMode
  if (rootMode === 'true') return true

  const rootAltMode = window.document?.documentElement?.dataset?.visualEdit
  if (rootAltMode === 'true') return true

  const bodyMode = window.document?.body?.dataset?.visualEditMode
  if (bodyMode === 'true') return true

  return false
}

const readVisualEditContext = () => {
  if (!isBrowser()) {
    return {
      enabled: false,
      routeKey: null,
      routeLabel: null,
    }
  }

  return {
    enabled: readVisualEditState(),
    routeKey: window.__GW_VISUAL_EDIT__?.routeKey ?? null,
    routeLabel: window.__GW_VISUAL_EDIT__?.routeLabel ?? null,
  }
}

export const readOverrideValue = (path, fallbackValue) => {
  if (!path) return fallbackValue
  const overrides = readContentOverrides()
  const overrideValue = getByPath(overrides, path)
  return overrideValue === undefined ? fallbackValue : overrideValue
}

export const commitOverrideValue = (path, nextValue) => {
  if (!path) return nextValue
  const overrides = readContentOverrides()
  setByPath(overrides, path, nextValue)
  writeContentOverrides(overrides)
  return nextValue
}

export const createArrayItemCommitter = ({ basePath, fallbackItems, index, field }) => (nextValue) => {
  const overrides = readContentOverrides()
  const currentItems = getByPath(overrides, basePath)
  const sourceItems = Array.isArray(currentItems)
    ? cloneValue(currentItems)
    : Array.isArray(fallbackItems)
      ? cloneValue(fallbackItems)
      : []

  if (!sourceItems[index] || typeof sourceItems[index] !== 'object') {
    sourceItems[index] = {}
  }

  sourceItems[index] = { ...sourceItems[index], [field]: nextValue }
  setByPath(overrides, basePath, sourceItems)
  writeContentOverrides(overrides)
  return nextValue
}

export function useVisualEditEnabled() {
  const [enabled, setEnabled] = useState(() => readVisualEditState())

  useEffect(() => {
    if (!isBrowser()) return undefined
    const sync = () => setEnabled(readVisualEditState())
    VISUAL_EDIT_EVENTS.forEach((eventName) => window.addEventListener(eventName, sync))
    window.addEventListener('storage', sync)

    return () => {
      VISUAL_EDIT_EVENTS.forEach((eventName) => window.removeEventListener(eventName, sync))
      window.removeEventListener('storage', sync)
    }
  }, [])

  return enabled
}

export function useVisualEditContext() {
  const [context, setContext] = useState(() => readVisualEditContext())

  useEffect(() => {
    if (!isBrowser()) return undefined
    const sync = () => setContext(readVisualEditContext())
    VISUAL_EDIT_EVENTS.forEach((eventName) => window.addEventListener(eventName, sync))
    window.addEventListener('storage', sync)

    return () => {
      VISUAL_EDIT_EVENTS.forEach((eventName) => window.removeEventListener(eventName, sync))
      window.removeEventListener('storage', sync)
    }
  }, [])

  return context
}

const INLINE_LINK_CLASS = 'text-primary-600 underline decoration-primary-200 underline-offset-2 transition-colors hover:text-primary-700'

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
      result.push(<h2 key={k++} className="font-heading text-xl font-bold text-ink mt-5 mb-2">{renderInline(line.slice(3), k)}</h2>)
    } else if (line.startsWith('### ')) {
      flushList()
      result.push(<h3 key={k++} className="font-heading text-lg font-semibold text-ink mt-4 mb-1">{renderInline(line.slice(4), k)}</h3>)
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
  as: Component = 'span',
  className = '',
  inputClassName = '',
  multiline = false,
  richText = false,
  placeholder = 'Klikk for å redigere',
  onCommit,
  disabled = false,
  ...rest
}) {
  const visualEditContext = useVisualEditContext()
  const visualEditEnabled = visualEditContext.enabled
  const enabled = visualEditEnabled && !disabled
  const [editing, setEditing] = useState(false)
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false)
  const [linkPopoverInitialText, setLinkPopoverInitialText] = useState('')
  const [draft, setDraft] = useState(() => `${readOverrideValue(path, value) ?? ''}`)
  const [resolvedValue, setResolvedValue] = useState(() => readOverrideValue(path, value) ?? '')
  const editingContainerRef = useRef(null)
  const textareaRef = useRef(null)
  const selectionRangeRef = useRef({ start: 0, end: 0 })

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResolvedValue(readOverrideValue(path, value) ?? '')
  }, [path, value])

  useEffect(() => {
    if (editing) return undefined
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(`${resolvedValue ?? ''}`)
    return undefined
  }, [editing, resolvedValue])

  useEffect(() => {
    if (!isBrowser()) return undefined
    const sync = () => setResolvedValue(readOverrideValue(path, value) ?? '')
    window.addEventListener(CONTENT_OVERRIDE_EVENT, sync)
    return () => window.removeEventListener(CONTENT_OVERRIDE_EVENT, sync)
  }, [path, value])

  const sanitizeDraftBeforeSave = useCallback((nextValue) => {
    if (!multiline) return nextValue

    return sanitizeInlineLinkMarkdown(
      nextValue,
      (destination) => isValidInternalDestination(destination, { routeKey: visualEditContext.routeKey }),
    )
  }, [multiline, visualEditContext.routeKey])

  const saveDraft = useCallback(() => {
    const nextValue = sanitizeDraftBeforeSave(draft.trimEnd())
    const persistedValue = onCommit ? onCommit(nextValue, path) : commitOverrideValue(path, nextValue)
    setResolvedValue(persistedValue)
    setLinkPopoverOpen(false)
    setEditing(false)
  }, [draft, onCommit, path, sanitizeDraftBeforeSave])

  const cancelEditing = useCallback(() => {
    setDraft(`${resolvedValue ?? ''}`)
    setLinkPopoverOpen(false)
    setEditing(false)
  }, [resolvedValue])

  const beginEditing = useCallback((event) => {
    if (!enabled) return
    event?.preventDefault?.()
    event?.stopPropagation?.()
    setDraft(`${resolvedValue ?? ''}`)
    setLinkPopoverOpen(false)
    setEditing(true)
  }, [enabled, resolvedValue])

  const syncSelection = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = typeof textarea.selectionStart === 'number' ? textarea.selectionStart : draft.length
    const end = typeof textarea.selectionEnd === 'number' ? textarea.selectionEnd : start
    selectionRangeRef.current = { start, end }
  }, [draft.length])

  const getSelectionRange = useCallback(() => {
    const textarea = textareaRef.current
    const fallbackRange = selectionRangeRef.current
    const draftLength = draft.length
    const start = typeof textarea?.selectionStart === 'number' ? textarea.selectionStart : fallbackRange.start
    const end = typeof textarea?.selectionEnd === 'number' ? textarea.selectionEnd : fallbackRange.end
    const safeStart = Math.max(0, Math.min(draftLength, Math.min(start, end)))
    const safeEnd = Math.max(0, Math.min(draftLength, Math.max(start, end)))
    return { start: safeStart, end: safeEnd }
  }, [draft.length])

  const insertMarkdownLink = useCallback(({ text, destination }) => {
    const normalizedText = `${text ?? ''}`.trim()
    const normalizedDestination = `${destination ?? ''}`.trim()

    if (!normalizedText || !isValidInternalDestination(normalizedDestination, { routeKey: visualEditContext.routeKey })) {
      return
    }

    const { start, end } = getSelectionRange()
    const snippet = `[${normalizedText}](${normalizedDestination})`
    const nextValue = `${draft.slice(0, start)}${snippet}${draft.slice(end)}`

    setDraft(nextValue)
    setLinkPopoverOpen(false)

    window.requestAnimationFrame(() => {
      const textarea = textareaRef.current
      if (!textarea) return
      const caretPosition = start + snippet.length
      textarea.focus()
      textarea.setSelectionRange(caretPosition, caretPosition)
      selectionRangeRef.current = { start: caretPosition, end: caretPosition }
    })
  }, [draft, getSelectionRange, visualEditContext.routeKey])

  const handleTextareaBlur = useCallback((event) => {
    if (!multiline) {
      saveDraft()
      return
    }

    const nextTarget = event.relatedTarget
    if (nextTarget && editingContainerRef.current?.contains(nextTarget)) return

    window.requestAnimationFrame(() => {
      const activeElement = window.document?.activeElement
      if (activeElement && editingContainerRef.current?.contains(activeElement)) return
      saveDraft()
    })
  }, [multiline, saveDraft])

  const interactiveClassName = enabled
    ? 'cursor-text rounded-lg outline outline-1 outline-transparent hover:outline-primary-300/70 hover:bg-primary-50/40 focus-within:outline-primary-400/80 transition-all duration-150'
    : ''

  if (editing) {
    const EditingTag = multiline ? 'div' : 'span'
    return (
      <EditingTag
        ref={multiline ? editingContainerRef : undefined}
        className={`relative block ${className}`}
        {...rest}
      >
        {multiline ? (
          <>
            {richText && (
              <p className="mb-1.5 text-xs text-gray-400">
                Markdown: <code className="rounded bg-gray-100 px-1">## Overskrift</code>{' '}
                <code className="rounded bg-gray-100 px-1">### Underoverskrift</code>{' '}
                <code className="rounded bg-gray-100 px-1">- Punkt</code>
              </p>
            )}
            <textarea
              ref={textareaRef}
              autoFocus
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value)
                syncSelection()
              }}
              onBlur={handleTextareaBlur}
              onSelect={syncSelection}
              onMouseUp={syncSelection}
              onKeyUp={syncSelection}
              onFocus={syncSelection}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  event.preventDefault()
                  cancelEditing()
                }
              }}
              className={`w-full min-h-[140px] rounded-2xl border border-primary-300 bg-white px-4 py-3 text-ink shadow-sm outline-none ring-0 focus:border-primary-500 focus:shadow-md ${inputClassName}`}
              placeholder={placeholder}
            />

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  syncSelection()
                }}
                onClick={() => {
                  const selection = getSelectionRange()
                  setLinkPopoverInitialText(draft.slice(selection.start, selection.end).trim())
                  setLinkPopoverOpen((current) => !current)
                }}
                className="rounded-full border border-primary-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary-700 shadow-sm transition-colors hover:border-primary-300 hover:bg-primary-50"
              >
                Insert link
              </button>
              <p className="text-xs text-gray-500">Bruk [tekst](#anker) eller [tekst](/ruta#anker).</p>
            </div>

            {linkPopoverOpen && (
              <LinkInsertPopover
                initialText={linkPopoverInitialText}
                routeKey={visualEditContext.routeKey}
                onClose={() => {
                  setLinkPopoverOpen(false)
                  window.requestAnimationFrame(() => {
                    textareaRef.current?.focus()
                  })
                }}
                onInsert={insertMarkdownLink}
              />
            )}
          </>
        ) : (
          <input
            autoFocus
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={saveDraft}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                saveDraft()
              }
              if (event.key === 'Escape') {
                event.preventDefault()
                cancelEditing()
              }
            }}
            className={`w-full min-w-[12ch] rounded-xl border border-primary-300 bg-white px-3 py-2 text-ink shadow-sm outline-none ring-0 focus:border-primary-500 focus:shadow-md ${inputClassName}`}
            placeholder={placeholder}
          />
        )}
      </EditingTag>
    )
  }

  const isEmpty = resolvedValue === undefined || resolvedValue === null || resolvedValue === ''
  // Placeholder only shown in edit mode — never leaks into the published page
  const displayValue = isEmpty ? (enabled ? placeholder : '') : resolvedValue

  const renderDisplayValue = () => {
    if (isEmpty && !enabled) return null
    if (richText && multiline && typeof displayValue === 'string' && !isEmpty) {
      return renderMarkdown(displayValue)
    }
    if (!multiline || typeof displayValue !== 'string') return displayValue
    const lines = displayValue.split('\n')
    if (lines.length <= 1) return displayValue
    return lines.map((line, i) => (
      <span key={i}>
        {line}
        {i < lines.length - 1 && <br />}
      </span>
    ))
  }

  return (
    <Component
      className={`${className} ${interactiveClassName}`.trim()}
      {...rest}
      onClick={beginEditing}
      onMouseDown={(event) => {
        if (!enabled) return
        event.preventDefault()
        event.stopPropagation()
      }}
      onKeyDown={(event) => {
        if (!enabled) return
        if (event.key === 'Enter' || event.key === ' ') {
          beginEditing(event)
        }
      }}
      tabIndex={enabled ? 0 : undefined}
      role={enabled ? 'button' : undefined}
      data-editable-path={path}
      data-editable-active={enabled ? 'true' : 'false'}
      title={enabled ? `Rediger ${path}` : undefined}
    >
      {renderDisplayValue()}
      {enabled && (
        <span className="ml-2 inline-flex align-middle rounded-full border border-primary-200 bg-white/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary-600 shadow-sm">
          Edit
        </span>
      )}
    </Component>
  )
}
