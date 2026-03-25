import { useEffect, useMemo, useState } from 'react'
import {
  getVisualEditState,
  hasVisualEditChanges,
  publishVisualEditChanges,
  saveVisualEditDraft,
  subscribeVisualEditSession,
} from '../../lib/visualEditSession'

const removeEditParam = () => {
  const url = new URL(window.location.href)
  url.searchParams.delete('edit')
  window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

const formatTimestamp = (value) => {
  if (!value) return null

  try {
    return new Intl.DateTimeFormat('nb-NO', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date(value))
  } catch {
    return null
  }
}

export default function VisualEditToolbar({
  isRequested,
  isEnabled,
  canEdit,
  isEditableRoute,
  routeLabel,
}) {
  const [session, setSession] = useState(getVisualEditState)
  const [notice, setNotice] = useState('')

  useEffect(() => subscribeVisualEditSession(setSession), [])

  const statusLabel = useMemo(() => {
    if (session.isPublishing) return 'Publicando…'
    if (session.isSaving) return 'Guardando borrador…'
    if (session.error) return session.error

    const publishedAt = formatTimestamp(session.lastPublishedAt)
    if (publishedAt) return `Publicado ${publishedAt}`

    const savedAt = formatTimestamp(session.lastSavedAt)
    if (savedAt) return `Borrador guardado ${savedAt}`

    if (hasVisualEditChanges()) return 'Hay cambios pendientes'
    return 'Sin cambios pendientes'
  }, [session.error, session.isPublishing, session.isSaving, session.lastPublishedAt, session.lastSavedAt])

  const onSaveDraft = async () => {
    setNotice('')
    try {
      await saveVisualEditDraft()
      setNotice('Borrador guardado.')
    } catch {
      setNotice('No se pudo guardar el borrador.')
    }
  }

  const onPublish = async () => {
    setNotice('')
    try {
      await publishVisualEditChanges()
      setNotice('Cambios publicados.')
    } catch {
      setNotice('No se pudo publicar.')
    }
  }

  if (!isRequested && !isEnabled) return null

  const disabled = !isEnabled || !canEdit || !isEditableRoute

  return (
    <div className="fixed right-4 bottom-4 z-[1200] w-[min(26rem,calc(100vw-2rem))] rounded-3xl border border-slate-900/10 bg-slate-950/92 text-white shadow-[0_28px_80px_rgba(15,23,42,0.45)] backdrop-blur-xl">
      <div className="border-b border-white/10 px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300/90">
              Visual edit mode
            </p>
            <h2 className="mt-1 text-sm font-semibold text-white">
              {routeLabel || 'Ruta editable'}
            </h2>
          </div>
          <button
            type="button"
            onClick={removeEditParam}
            className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-white/30 hover:bg-white/10"
          >
            Salir
          </button>
        </div>
      </div>

      <div className="space-y-3 px-4 py-4">
        {!isEditableRoute ? (
          <p className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-sm text-amber-100">
            Esta ruta no entra en el MVP editable. Solo home, nyheter, artículo de noticia y helse.
          </p>
        ) : null}

        {isEditableRoute && !canEdit ? (
          <p className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-100">
            Tu sesión no tiene permisos de editor. El modo visual quedó en solo lectura.
          </p>
        ) : null}

        {isEditableRoute && canEdit && isEnabled ? (
          <p className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-100">
            Estás editando la UI real. Los cambios se persisten con las APIs existentes.
          </p>
        ) : null}

        <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">Estado</p>
          <p className="mt-1 text-sm text-slate-100">{statusLabel}</p>
          {notice ? <p className="mt-2 text-xs text-cyan-200">{notice}</p> : null}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={disabled || session.isSaving || session.isPublishing}
            className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-3 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {session.isSaving ? 'Guardando…' : 'Guardar borrador'}
          </button>
          <button
            type="button"
            onClick={onPublish}
            disabled={disabled || session.isSaving || session.isPublishing}
            className="rounded-2xl border border-fuchsia-300/20 bg-fuchsia-400/10 px-3 py-2 text-sm font-semibold text-fuchsia-100 transition hover:bg-fuchsia-400/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {session.isPublishing ? 'Publicando…' : 'Publicar'}
          </button>
        </div>
      </div>
    </div>
  )
}
