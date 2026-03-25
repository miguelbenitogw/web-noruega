import { baseInputClass } from './helpers'

export default function StringListField({ fieldKey, label, value, onChange, onErrorChange }) {
  const items = Array.isArray(value) ? value : []

  const commit = (nextItems) => {
    onErrorChange?.(fieldKey, '')
    onChange(nextItems)
  }

  return (
    <div className="space-y-2 rounded-2xl border border-gray-200 bg-gray-50/70 p-3">
      <div className="flex items-center justify-between gap-3">
        <span className="block text-xs font-semibold uppercase tracking-wide text-gray-600">
          {label}
        </span>
        <button
          type="button"
          onClick={() => commit([...(items || []), ''])}
          className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-600 transition hover:bg-gray-100"
        >
          + Legg til
        </button>
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-300 bg-white px-3 py-3 text-sm text-gray-400">
          Ingen elementer ennå. Legg til første punkt.
        </p>
      ) : null}

      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={`${fieldKey}-${index}`} className="flex items-start gap-2">
            <input
              type="text"
              className={`${baseInputClass} flex-1`}
              value={item ?? ''}
              onChange={(event) => commit(items.map((entry, entryIndex) => (entryIndex === index ? event.target.value : entry)))}
            />
            <button
              type="button"
              onClick={() => commit(items.filter((_, entryIndex) => entryIndex !== index))}
              className="inline-flex h-10 items-center rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-600 transition hover:bg-red-100"
              title="Fjern element"
              aria-label={`Fjern ${label} ${index + 1}`}
            >
              Fjern
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
