import StringListField from './StringListField'
import {
  baseInputClass,
  canRenderStructuredField,
  formatLabel,
  getSchemaType,
  getObjectProperties,
  isPlainObject,
  isStringArraySchema,
} from './helpers'

function PrimitiveField({ fieldKey, label, value, fieldType, onChange, onErrorChange }) {
  const commit = (nextValue) => {
    onErrorChange?.(fieldKey, '')
    onChange(nextValue)
  }

  if (fieldType === 'boolean') {
    return (
      <label className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3">
        <span className="text-sm font-medium text-gray-700">{label}</span>
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
        <span className="block text-xs font-semibold uppercase tracking-wide text-gray-600">{label}</span>
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

  return (
    <label className="block space-y-2">
      <span className="block text-xs font-semibold uppercase tracking-wide text-gray-600">{label}</span>
      <input
        type="text"
        className={baseInputClass}
        value={value ?? ''}
        onChange={(event) => commit(event.target.value)}
      />
    </label>
  )
}

export default function ObjectFieldGroup({
  fieldKey,
  label,
  value,
  schemaNode,
  onChange,
  onErrorChange,
  depth = 0,
  showHeader = true,
}) {
  const properties = getObjectProperties(schemaNode)
  const safeValue = isPlainObject(value) ? value : {}

  if (!properties || !canRenderStructuredField(schemaNode, safeValue, depth)) {
    return null
  }

  const updateProperty = (propertyKey, nextValue) => {
    onErrorChange?.(fieldKey, '')
    onChange({
      ...safeValue,
      [propertyKey]: nextValue,
    })
  }

  return (
    <div className="space-y-3 rounded-2xl border border-gray-200 bg-gradient-to-b from-gray-50 to-white p-4 shadow-sm">
      {showHeader ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">{label}</p>
          <p className="mt-1 text-xs text-gray-400">Rediger feltene uten å skrive rå JSON.</p>
        </div>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-2">
        {Object.entries(properties).map(([propertyKey, propertySchema]) => {
          const propertyLabel = formatLabel(propertyKey)
          const propertyValue = Object.prototype.hasOwnProperty.call(safeValue, propertyKey)
            ? safeValue[propertyKey]
            : undefined
          const propertyType = getSchemaType(propertySchema, propertyValue)
          const nestedFieldKey = `${fieldKey}.${propertyKey}`

          if (propertyType === 'array' && isStringArraySchema(propertySchema, propertyValue)) {
            return (
              <div key={nestedFieldKey} className="lg:col-span-2">
                <StringListField
                  fieldKey={nestedFieldKey}
                  label={propertyLabel}
                  value={propertyValue}
                  onChange={(nextValue) => updateProperty(propertyKey, nextValue)}
                  onErrorChange={onErrorChange}
                />
              </div>
            )
          }

          if (propertyType === 'object') {
            return (
              <div key={nestedFieldKey} className="lg:col-span-2">
                <ObjectFieldGroup
                  fieldKey={nestedFieldKey}
                  label={propertyLabel}
                  value={propertyValue}
                  schemaNode={propertySchema}
                  onChange={(nextValue) => updateProperty(propertyKey, nextValue)}
                  onErrorChange={onErrorChange}
                  depth={depth + 1}
                />
              </div>
            )
          }

          return (
            <PrimitiveField
              key={nestedFieldKey}
              fieldKey={nestedFieldKey}
              label={propertyLabel}
              value={propertyValue}
              fieldType={propertyType}
              onChange={(nextValue) => updateProperty(propertyKey, nextValue)}
              onErrorChange={onErrorChange}
            />
          )
        })}
      </div>
    </div>
  )
}
