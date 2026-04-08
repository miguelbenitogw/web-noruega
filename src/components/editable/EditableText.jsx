/* eslint-disable react-refresh/only-export-components, no-unused-vars */
import { useCallback, useEffect, useState } from 'react'
import {
  CONTENT_OVERRIDE_EVENT,
  getByPath,
  readContentOverrides,
  setByPath,
  writeContentOverrides,
} from '../../lib/contentOverrides'

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

export default function EditableText({
  path,
  value,
  as: Component = 'span',
  className = '',
  inputClassName = '',
  multiline = false,
  placeholder = 'Klikk for å redigere',
  onCommit,
  disabled = false,
  ...rest
}) {
  const visualEditEnabled = useVisualEditEnabled()
  const enabled = visualEditEnabled && !disabled
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(() => `${readOverrideValue(path, value) ?? ''}`)
  const [resolvedValue, setResolvedValue] = useState(() => readOverrideValue(path, value) ?? '')

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

  const saveDraft = useCallback(() => {
    const nextValue = draft.trimEnd()
    const persistedValue = onCommit ? onCommit(nextValue, path) : commitOverrideValue(path, nextValue)
    setResolvedValue(persistedValue)
    setEditing(false)
  }, [draft, onCommit, path])

  const cancelEditing = useCallback(() => {
    setDraft(`${resolvedValue ?? ''}`)
    setEditing(false)
  }, [resolvedValue])

  const beginEditing = useCallback((event) => {
    if (!enabled) return
    event?.preventDefault?.()
    event?.stopPropagation?.()
    setDraft(`${resolvedValue ?? ''}`)
    setEditing(true)
  }, [enabled, resolvedValue])

  const interactiveClassName = enabled
    ? 'cursor-text rounded-lg outline outline-1 outline-transparent hover:outline-primary-300/70 hover:bg-primary-50/40 focus-within:outline-primary-400/80 transition-all duration-150'
    : ''

  if (editing) {
    const EditingTag = multiline ? 'div' : 'span'
    return (
      <EditingTag className={`relative block ${className}`} {...rest}>
        {multiline ? (
          <textarea
            autoFocus
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={saveDraft}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.preventDefault()
                cancelEditing()
              }
            }}
            className={`w-full min-h-[140px] rounded-2xl border border-primary-300 bg-white px-4 py-3 text-ink shadow-sm outline-none ring-0 focus:border-primary-500 focus:shadow-md ${inputClassName}`}
            placeholder={placeholder}
          />
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
  const displayValue = isEmpty ? placeholder : resolvedValue

  const renderDisplayValue = () => {
    if (isEmpty || !multiline || typeof displayValue !== 'string') return displayValue
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
