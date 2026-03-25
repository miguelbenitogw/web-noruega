import { useMemo, useState } from 'react'
import ObjectFieldGroup from './fields/ObjectFieldGroup'
import ObjectListField from './fields/ObjectListField'
import StringListField from './fields/StringListField'
import {
  baseInputClass,
  baseTextareaClass,
  canRenderObjectListField,
  canRenderStructuredField,
  formatLabel,
  getJsonFallback,
  getSchemaType,
  isObjectArraySchema,
  isStructuredAdminEditorEnabled,
  isStringArraySchema,
} from './fields/helpers'

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
      <div className="flex items-center justify-between gap-3">
        <span className="block text-xs font-semibold uppercase tracking-wide text-gray-600">
          {label}
        </span>
        <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
          JSON fallback
        </span>
      </div>
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
  const structuredEditorEnabled = isStructuredAdminEditorEnabled()
  const displayLabel = label || formatLabel(fieldKey)

  const commit = (nextValue) => {
    onErrorChange?.(fieldKey, '')
    onChange(nextValue)
  }

  if (fieldType === 'boolean') {
    return (
      <label className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3">
        <span className="text-sm font-medium text-gray-700">{displayLabel}</span>
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => commit(event.target.checked)}
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
            commit(Number.isNaN(nextValue) ? null : nextValue)
          }}
        />
      </label>
    )
  }

  if (structuredEditorEnabled && fieldType === 'array' && isStringArraySchema(schemaNode, value)) {
    return (
      <StringListField
        fieldKey={fieldKey}
        label={displayLabel}
        value={value}
        onChange={onChange}
        onErrorChange={onErrorChange}
      />
    )
  }

  if (
    structuredEditorEnabled
    && fieldType === 'array'
    && isObjectArraySchema(schemaNode, value)
    && canRenderObjectListField(schemaNode, value)
  ) {
    return (
      <ObjectListField
        fieldKey={fieldKey}
        label={displayLabel}
        value={value}
        schemaNode={schemaNode}
        onChange={onChange}
        onErrorChange={onErrorChange}
      />
    )
  }

  if (structuredEditorEnabled && fieldType === 'object' && canRenderStructuredField(schemaNode, value)) {
    return (
      <ObjectFieldGroup
        fieldKey={fieldKey}
        label={displayLabel}
        value={value}
        schemaNode={schemaNode}
        onChange={onChange}
        onErrorChange={onErrorChange}
      />
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
        onChange={(event) => commit(event.target.value)}
      />
    </label>
  )
}
