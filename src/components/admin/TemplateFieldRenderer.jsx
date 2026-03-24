import { useMemo, useState } from 'react'

const baseInputClass = 'w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
const baseTextareaClass = `${baseInputClass} min-h-[110px] resize-y font-mono text-xs leading-5`

const formatLabel = (value) =>
  String(value || '')
    .replace(/_/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (char) => char.toUpperCase())

const getSchemaType = (schemaNode, value) => {
  if (schemaNode && typeof schemaNode === 'object' && !Array.isArray(schemaNode) && typeof schemaNode.type === 'string') {
    return schemaNode.type.toLowerCase()
  }

  if (typeof schemaNode === 'string') {
    return schemaNode.toLowerCase()
  }

  if (Array.isArray(value)) return 'array'
  if (value !== null && typeof value === 'object') return 'object'
  if (typeof value === 'boolean') return 'boolean'
  if (typeof value === 'number') return 'number'

  return 'string'
}

const getJsonFallback = (fieldType) => (fieldType === 'array' ? [] : {})

function JsonField({ fieldKey, label, value, fieldType, onChange, onErrorChange }) {
  const initialRaw = useMemo(() => JSON.stringify(value ?? getJsonFallback(fieldType), null, 2), [fieldType, value])
  const [raw, setRaw] = useState(initialRaw)
  const [error, setError] = useState('')

  const handleChange = (nextValue) => {
    setRaw(nextValue)

    try {
      const parsed = JSON.parse(nextValue)
      setError('')
      onErrorChange?.(fieldKey, '')
      onChange(parsed)
    } catch {
      const message = 'Ugyldig JSON'
      setError(message)
      onErrorChange?.(fieldKey, message)
    }
  }

  return (
    <label className="block space-y-2">
      <span className="block text-xs font-semibold uppercase tracking-wide text-gray-600">
        {label}
      </span>
      <textarea
        className={baseTextareaClass}
        value={raw}
        onChange={(event) => handleChange(event.target.value)}
        spellCheck={false}
      />
      {error ? <span className="block text-xs text-red-600">{error}</span> : null}
    </label>
  )
}

export default function TemplateFieldRenderer({
  fieldKey,
  label,
  value,
  schemaNode,
  onChange,
  onErrorChange,
}) {
  const fieldType = getSchemaType(schemaNode, value)
  const displayLabel = label || formatLabel(fieldKey)

  if (fieldType === 'boolean') {
    return (
      <label className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3">
        <span className="text-sm font-medium text-gray-700">{displayLabel}</span>
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(event.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
      </label>
    )
  }

  if (fieldType === 'number') {
    return (
      <label className="block space-y-2">
        <span className="block text-xs font-semibold uppercase tracking-wide text-gray-600">
          {displayLabel}
        </span>
        <input
          type="number"
          className={baseInputClass}
          value={value ?? ''}
          onChange={(event) => {
            const nextValue = event.target.value === '' ? null : Number(event.target.value)
            onChange(Number.isNaN(nextValue) ? null : nextValue)
          }}
        />
      </label>
    )
  }

  if (fieldType === 'object' || fieldType === 'array') {
    const jsonStateKey = `${fieldKey}:${JSON.stringify(value ?? getJsonFallback(fieldType))}`
    return (
      <JsonField
        key={jsonStateKey}
        fieldKey={fieldKey}
        label={displayLabel}
        value={value}
        fieldType={fieldType}
        onChange={onChange}
        onErrorChange={onErrorChange}
      />
    )
  }

  return (
    <label className="block space-y-2">
      <span className="block text-xs font-semibold uppercase tracking-wide text-gray-600">
        {displayLabel}
      </span>
      <input
        type="text"
        className={baseInputClass}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}
