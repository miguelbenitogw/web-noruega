import { useEffect, useMemo } from 'react'
import ObjectFieldGroup from './ObjectFieldGroup'
import {
  createValueFromSchema,
  formatLabel,
  getArrayItemSchema,
  validateStructuredValue,
} from './helpers'

function moveItem(items, fromIndex, toIndex) {
  if (toIndex < 0 || toIndex >= items.length) return items

  const nextItems = [...items]
  const [item] = nextItems.splice(fromIndex, 1)
  nextItems.splice(toIndex, 0, item)
  return nextItems
}

export default function ObjectListField({ fieldKey, label, value, schemaNode, onChange, onErrorChange }) {
  const items = useMemo(() => (Array.isArray(value) ? value : []), [value])
  const itemSchema = getArrayItemSchema(schemaNode)

  const rowErrors = useMemo(
    () => items.map((item) => validateStructuredValue(item, itemSchema)),
    [itemSchema, items],
  )

  const totalErrors = rowErrors.reduce((count, errors) => count + Object.keys(errors).length, 0)

  useEffect(() => {
    onErrorChange?.(fieldKey, totalErrors > 0 ? `${totalErrors} valideringsfeil i ${label}` : '')
  }, [fieldKey, label, onErrorChange, totalErrors])

  const commit = (nextItems) => {
    onChange(nextItems)
  }

  const addItem = () => {
    commit([...items, createValueFromSchema(itemSchema)])
  }

  const updateItem = (index, nextValue) => {
    commit(items.map((item, itemIndex) => (itemIndex === index ? nextValue : item)))
  }

  const removeItem = (index) => {
    commit(items.filter((_, itemIndex) => itemIndex !== index))
  }

  const moveUp = (index) => {
    commit(moveItem(items, index, index - 1))
  }

  const moveDown = (index) => {
    commit(moveItem(items, index, index + 1))
  }

  return (
    <div className="space-y-3 rounded-[1.5rem] border border-gray-200 bg-gradient-to-br from-slate-50 via-white to-blue-50/40 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-gray-600">
            {label}
          </span>
          <p className="mt-1 text-xs text-gray-400">
            Administrer kort, blokker og andre repeterende felt uten rå JSON.
          </p>
        </div>
        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center rounded-xl border border-primary-200 bg-white px-3 py-2 text-xs font-semibold text-primary-700 transition hover:bg-primary-50"
        >
          + Legg til rad
        </button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-4 py-5 text-sm text-gray-400">
          Ingen elementer ennå. Legg til første {formatLabel(label).toLowerCase()}.
        </div>
      ) : null}

      <div className="space-y-4">
        {items.map((item, index) => {
          const errors = rowErrors[index] || {}
          const errorEntries = Object.entries(errors)
          const rowLabel = `${formatLabel(label)} ${index + 1}`

          return (
            <article
              key={`${fieldKey}-${index}`}
              className="overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
            >
              <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">{rowLabel}</h4>
                      <p className="text-xs text-slate-400">
                        {errorEntries.length > 0 ? 'Krever oppmerksomhet før lagring.' : 'Klar til publisering.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {errorEntries.length > 0 ? (
                      <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-red-700">
                        {errorEntries.length} feil
                      </span>
                    ) : (
                      <span className="rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-green-700">
                        OK
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      className="inline-flex items-center rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveDown(index)}
                      disabled={index === items.length - 1}
                      className="inline-flex items-center rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                    >
                      Fjern
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-4">
                {errorEntries.length > 0 ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <p className="font-semibold">Validering for denne raden</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                      {errorEntries.map(([path, message]) => (
                        <li key={`${path}-${message}`}>{message}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <ObjectFieldGroup
                  fieldKey={`${fieldKey}.${index}`}
                  label={rowLabel}
                  value={item}
                  schemaNode={itemSchema}
                  onChange={(nextValue) => updateItem(index, nextValue)}
                  onErrorChange={() => {}}
                  showHeader={false}
                />
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}



