import { useMemo, useState } from 'react'
import { getLinkableAnchorGroups, isValidInternalDestination } from '../../lib/linkableAnchors'

const MANUAL_DESTINATION_VALUE = '__manual__'
const POPUP_TITLE_ID = 'link-insert-title'
const POPUP_DESCRIPTION_ID = 'link-insert-description'
const POPUP_HELP_ID = 'link-insert-help'
const POPUP_ERROR_ID = 'link-insert-error'
const LINK_TEXT_ID = 'link-insert-link-text'
const DESTINATION_SELECT_ID = 'link-insert-destination'
const MANUAL_DESTINATION_ID = 'link-insert-manual-destination'

export default function LinkInsertPopover({
  initialText = '',
  routeKey = null,
  onClose,
  onInsert,
}) {
  const [linkText, setLinkText] = useState(() => `${initialText ?? ''}`.trim())
  const [destination, setDestination] = useState('')
  const [manualDestination, setManualDestination] = useState(false)
  const [error, setError] = useState('')
  const [errorField, setErrorField] = useState(null)

  const destinationGroups = useMemo(() => getLinkableAnchorGroups({ routeKey }), [routeKey])
  const destinationOptions = useMemo(
    () => destinationGroups.flatMap((group) => group.anchors),
    [destinationGroups],
  )

  const trimmedLinkText = useMemo(() => linkText.trim(), [linkText])
  const trimmedDestination = useMemo(() => destination.trim(), [destination])
  const destinationValid = isValidInternalDestination(trimmedDestination, { routeKey })
  const canInsert = trimmedLinkText.length > 0 && destinationValid

  const clearError = () => {
    setError('')
    setErrorField(null)
  }

  const setValidationError = (field, message) => {
    setErrorField(field)
    setError(message)
  }

  const handleDestinationChange = (nextValue) => {
    if (nextValue === MANUAL_DESTINATION_VALUE) {
      setManualDestination(true)
      setDestination('')
      if (errorField === 'destination') {
        clearError()
      }
      return
    }

    setManualDestination(false)
    setDestination(nextValue)
    if (errorField === 'destination') {
      clearError()
    }
  }

  const handleInsert = () => {
    if (!trimmedLinkText) {
      setValidationError('text', 'Skriv teksten som skal vises.')
      return
    }

    if (!destinationValid) {
      setValidationError(
        'destination',
        'Velg et registrert internt anker, eller skriv en gyldig intern destinasjon som matcher katalogen.',
      )
      return
    }

    clearError()
    onInsert({ text: trimmedLinkText, destination: trimmedDestination })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    handleInsert()
  }

  const linkTextDescribedBy = [
    POPUP_DESCRIPTION_ID,
    errorField === 'text' ? POPUP_ERROR_ID : null,
  ].filter(Boolean).join(' ')

  const destinationDescribedBy = [
    POPUP_HELP_ID,
    errorField === 'destination' ? POPUP_ERROR_ID : null,
  ].filter(Boolean).join(' ')

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby={POPUP_TITLE_ID}
      aria-describedby={POPUP_DESCRIPTION_ID}
      className="absolute left-0 top-full z-30 mt-3 w-full max-w-[38rem] rounded-3xl border border-primary-100 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.14)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-600">Link insert</p>
          <h4 id={POPUP_TITLE_ID} className="mt-1 text-sm font-semibold text-ink">
            Legg til intern lenke
          </h4>
          <p id={POPUP_DESCRIPTION_ID} className="mt-1 text-xs leading-relaxed text-gray-500">
            Velg et registrert anker fra katalogen, eller åpne manuelt felt for å skrive en intern destinasjon.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:border-gray-300 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          Lukk
        </button>
      </div>

      <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={handleSubmit} noValidate>
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
            Linktekst
          </span>
          <input
            id={LINK_TEXT_ID}
            autoFocus
            value={linkText}
            onChange={(event) => {
              setLinkText(event.target.value)
              if (errorField === 'text') {
                clearError()
              }
            }}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.preventDefault()
                onClose()
              }
            }}
            aria-describedby={linkTextDescribedBy || undefined}
            aria-errormessage={errorField === 'text' ? POPUP_ERROR_ID : undefined}
            aria-invalid={errorField === 'text'}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            placeholder="Tekst som vises"
          />
        </label>

        <div className="block">
          <label className="block" htmlFor={DESTINATION_SELECT_ID}>
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
              Destinasjon
            </span>
          </label>
          <select
            id={DESTINATION_SELECT_ID}
            value={manualDestination ? MANUAL_DESTINATION_VALUE : destination}
            onChange={(event) => handleDestinationChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.preventDefault()
                onClose()
              }
            }}
            aria-describedby={destinationDescribedBy || undefined}
            aria-errormessage={errorField === 'destination' ? POPUP_ERROR_ID : undefined}
            aria-invalid={errorField === 'destination'}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            <option value="">Velg et registrert anker…</option>
            {destinationGroups.map((group) => (
              <optgroup
                key={group.pageKey}
                label={`${group.pageLabel}${group.isCurrentPage ? ' · gjeldende side' : ''}`}
              >
                {group.anchors.map((anchor) => (
                  <option key={`${group.pageKey}:${anchor.id}`} value={anchor.destination}>
                    {anchor.label} — {anchor.destination}
                  </option>
                ))}
              </optgroup>
            ))}
            <option value={MANUAL_DESTINATION_VALUE}>Manuell destinasjon…</option>
          </select>

          {manualDestination ? (
            <input
              id={MANUAL_DESTINATION_ID}
              autoFocus
              value={destination}
              onChange={(event) => {
                setDestination(event.target.value)
                if (errorField === 'destination') {
                  clearError()
                }
              }}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  event.preventDefault()
                  onClose()
                }
              }}
              aria-describedby={destinationDescribedBy || undefined}
              aria-errormessage={errorField === 'destination' ? POPUP_ERROR_ID : undefined}
              aria-invalid={errorField === 'destination'}
              className="mt-3 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              placeholder="#anker eller /ruta#anker"
            />
          ) : destination ? (
            <p className="mt-2 text-xs text-gray-500">
              Valgt destinasjon:{' '}
              <code className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-700">{destination}</code>
            </p>
          ) : null}
        </div>

        <div className="md:col-span-2">
          {error ? (
            <p id={POPUP_ERROR_ID} role="alert" aria-live="polite" className="text-xs font-medium text-red-600">
              {error}
            </p>
          ) : null}
          <p id={POPUP_HELP_ID} className="mt-3 text-xs text-gray-500">
            Format: <code>[tekst](#anchor)</code> eller <code>[tekst](/ruta#anchor)</code>. Kun registrerte interne anker er tillatt.
          </p>
          {destinationOptions.length === 0 ? (
            <p className="mt-2 text-xs text-amber-700">
              Denne siden har ingen registrerte anker. Bruk manuelt felt hvis du vil peke til en annen intern destinasjon.
            </p>
          ) : null}

          <div className="mt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:border-gray-300 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              Avbryt
            </button>
            <button
              type="submit"
              disabled={!canInsert}
              className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:bg-primary-300"
            >
              Insert
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
