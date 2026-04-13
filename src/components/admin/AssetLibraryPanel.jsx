import { useCallback, useEffect, useMemo, useState } from 'react'
import { archiveAsset, listAssets, updateAssetMeta } from '../../lib/contentAssetsService.js'
import { clampPageToTotalPages } from './assetLibraryPagination.js'

const inputClass = 'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100'

const formatDate = (value) => {
  if (!value) return 'Sin fecha'

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'Sin fecha'

  return new Intl.DateTimeFormat('nb-NO', { dateStyle: 'medium', timeStyle: 'short' }).format(parsed)
}

const formatFileSize = (value) => {
  const size = Number(value)
  if (!Number.isFinite(size) || size <= 0) return '0 B'
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

const statusToneMap = {
  active: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  inactive: 'border-amber-200 bg-amber-50 text-amber-700',
  archived: 'border-slate-200 bg-slate-100 text-slate-600',
}

const createEditDraft = (asset) => ({
  alt: asset?.alt ?? '',
  caption: asset?.caption ?? '',
  usageType: asset?.usageType ?? '',
})

function AssetCard({
  asset,
  editing,
  editDraft,
  onEditDraftChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onArchive,
  onSelect,
  selected,
  busyAction,
}) {
  const statusTone = statusToneMap[asset.status] || statusToneMap.inactive
  const imageUrl = asset.publicUrl || ''

  return (
    <article className={`rounded-[28px] border p-4 shadow-sm transition ${selected ? 'border-primary-300 bg-primary-50/50' : 'border-slate-200 bg-white'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${statusTone}`}>
            {asset.status}
          </span>
          {asset.usageType ? (
            <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
              {asset.usageType}
            </span>
          ) : null}
        </div>

        {onSelect ? (
          <button
            type="button"
            onClick={() => onSelect(asset)}
            className={`inline-flex items-center justify-center rounded-2xl px-3 py-2 text-xs font-semibold transition ${
              selected
                ? 'bg-primary-600 text-white shadow-sm'
                : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            {selected ? 'Seleccionado' : 'Seleccionar'}
          </button>
        ) : null}
      </div>

      <div className="mt-4 overflow-hidden rounded-[24px] border border-slate-200 bg-slate-100">
        {imageUrl ? (
          <img src={imageUrl} alt={asset.alt || 'Asset preview'} className="h-40 w-full object-cover" />
        ) : (
          <div className="flex h-40 items-center justify-center px-4 text-center text-sm text-slate-400">
            Asset sin URL renderizable todavía.
          </div>
        )}
      </div>

      <div className="mt-4 space-y-2 text-sm text-slate-600">
        <p className="break-all font-mono text-[11px] text-slate-400">{asset.id}</p>
        <p>{asset.caption || asset.alt || 'Sin metadata todavía.'}</p>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
          <span>{asset.mimeType || 'mime n/a'}</span>
          <span>{formatFileSize(asset.sizeBytes)}</span>
          <span>{formatDate(asset.updatedAt || asset.createdAt)}</span>
        </div>
      </div>

      {editing ? (
        <div className="mt-4 space-y-3 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
          <label className="block space-y-2">
            <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Alt</span>
            <input
              className={inputClass}
              value={editDraft.alt}
              onChange={(event) => onEditDraftChange('alt', event.target.value)}
              disabled={busyAction === 'save'}
            />
          </label>

          <label className="block space-y-2">
            <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Caption</span>
            <textarea
              className={`${inputClass} min-h-[96px] resize-y`}
              value={editDraft.caption}
              onChange={(event) => onEditDraftChange('caption', event.target.value)}
              disabled={busyAction === 'save'}
            />
          </label>

          <label className="block space-y-2">
            <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Usage</span>
            <input
              className={inputClass}
              value={editDraft.usageType}
              onChange={(event) => onEditDraftChange('usageType', event.target.value)}
              placeholder="cover-image"
              disabled={busyAction === 'save'}
            />
          </label>

          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={onCancelEdit}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onSaveEdit}
              disabled={busyAction === 'save'}
              className="inline-flex items-center justify-center rounded-2xl bg-primary-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busyAction === 'save' ? 'Guardando…' : 'Guardar metadata'}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={() => onStartEdit(asset)}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Editar metadata
          </button>
          {asset.status !== 'archived' ? (
            <button
              type="button"
              onClick={() => onArchive(asset)}
              disabled={busyAction === 'archive'}
              className="inline-flex items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busyAction === 'archive' ? 'Archivando…' : 'Archivar'}
            </button>
          ) : null}
        </div>
      )}
    </article>
  )
}

export default function AssetLibraryPanel({
  onSelect,
  selectedAssetId = '',
  pageSizeOptions = [6, 12, 24],
  title = 'Librería de assets',
  description = 'Buscá, filtrá y administrá assets existentes.',
}) {
  const [search, setSearch] = useState('')
  const [usageType, setUsageType] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(pageSizeOptions[0] || 6)
  const [response, setResponse] = useState({ items: [], total: 0, totalPages: 0, page: 1, pageSize })
  const [libraryState, setLibraryState] = useState({ kind: 'idle', message: '' })
  const [editingId, setEditingId] = useState('')
  const [editDraft, setEditDraft] = useState(createEditDraft(null))
  const [busyAssetAction, setBusyAssetAction] = useState({ id: '', type: '' })
  const [reloadTick, setReloadTick] = useState(0)

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      setLibraryState({ kind: 'loading', message: 'Cargando assets…' })

      try {
        const result = await listAssets({
          search,
          usageType,
          status,
          page,
          pageSize,
        })

        if (!cancelled) {
          const resolvedPage = clampPageToTotalPages(page, result.totalPages)
          const normalizedResult = {
            ...result,
            page: resolvedPage,
          }

          setResponse(normalizedResult)

          if (resolvedPage !== page) {
            setPage(resolvedPage)
            return
          }

          setLibraryState({ kind: 'idle', message: '' })
        }
      } catch (error) {
        if (!cancelled) {
          setResponse((current) => ({ ...current, items: [] }))
          setLibraryState({
            kind: 'error',
            message: error instanceof Error ? error.message : 'No se pudo cargar la librería.',
          })
        }
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [page, pageSize, reloadTick, search, status, usageType])

  const totalPages = response.totalPages || 0
  const displayPage = totalPages > 0 ? clampPageToTotalPages(page, totalPages) : 1

  const items = useMemo(() => response.items || [], [response.items])

  const usageSuggestions = useMemo(() => {
    const known = items
      .map((asset) => asset.usageType)
      .filter(Boolean)

    return Array.from(new Set(known)).sort((left, right) => left.localeCompare(right))
  }, [items])

  const handleEditDraftChange = useCallback((field, value) => {
    setEditDraft((current) => ({ ...current, [field]: value }))
  }, [])

  const handleStartEdit = useCallback((asset) => {
    setEditingId(asset.id)
    setEditDraft(createEditDraft(asset))
    setLibraryState({ kind: 'idle', message: '' })
  }, [])

  const handleCancelEdit = useCallback(() => {
    setEditingId('')
    setEditDraft(createEditDraft(null))
  }, [])

  const handleSaveEdit = useCallback(async () => {
    if (!editingId) return

    setBusyAssetAction({ id: editingId, type: 'save' })

    try {
      await updateAssetMeta(editingId, editDraft)
      setEditingId('')
      setEditDraft(createEditDraft(null))
      setLibraryState({ kind: 'success', message: 'Metadata actualizada.' })
      setReloadTick((value) => value + 1)
    } catch (error) {
      setLibraryState({
        kind: 'error',
        message: error instanceof Error ? error.message : 'No se pudo actualizar el asset.',
      })
    } finally {
      setBusyAssetAction({ id: '', type: '' })
    }
  }, [editDraft, editingId])

  const handleArchive = useCallback(async (asset) => {
    const shouldProceed = typeof window === 'undefined' ? true : window.confirm(`¿Archivar asset ${asset.id}?`)
    if (!shouldProceed) return

    setBusyAssetAction({ id: asset.id, type: 'archive' })

    try {
      await archiveAsset(asset.id)
      setLibraryState({ kind: 'success', message: 'Asset archivado.' })
      setReloadTick((value) => value + 1)
    } catch (error) {
      setLibraryState({
        kind: 'error',
        message: error instanceof Error ? error.message : 'No se pudo archivar el asset.',
      })
    } finally {
      setBusyAssetAction({ id: '', type: '' })
    }
  }, [])

  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value) || pageSizeOptions[0] || 6)
    setPage(1)
  }

  return (
    <section className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
        <p className="text-xs text-slate-500">{description}</p>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_110px]">
        <input
          className={inputClass}
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(1)
          }}
          placeholder="Buscar por alt, caption, path o usage"
        />

        <div className="space-y-2">
          <select
            className={inputClass}
            value={usageType}
            onChange={(event) => {
              setUsageType(event.target.value)
              setPage(1)
            }}
          >
            <option value="">Todos los usage</option>
            {usageSuggestions.map((suggestion) => (
              <option key={suggestion} value={suggestion}>
                {suggestion}
              </option>
            ))}
          </select>
        </div>

        <select
          className={inputClass}
          value={status}
          onChange={(event) => {
            setStatus(event.target.value)
            setPage(1)
          }}
        >
          <option value="">Todos los estados</option>
          <option value="active">active</option>
          <option value="inactive">inactive</option>
          <option value="archived">archived</option>
        </select>

        <select className={inputClass} value={pageSize} onChange={handlePageSizeChange}>
          {pageSizeOptions.map((option) => (
            <option key={option} value={option}>
              {option}/pag
            </option>
          ))}
        </select>
      </div>

      {libraryState.kind === 'error' ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{libraryState.message}</div>
      ) : null}

      {libraryState.kind === 'success' ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{libraryState.message}</div>
      ) : null}

      {libraryState.kind === 'loading' ? (
        <p className="text-sm text-slate-500">Cargando assets…</p>
      ) : null}

      {!items.length && libraryState.kind !== 'loading' ? (
        <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
          No hay assets que coincidan con los filtros actuales.
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {items.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              editing={editingId === asset.id}
              editDraft={editingId === asset.id ? editDraft : createEditDraft(asset)}
              onEditDraftChange={handleEditDraftChange}
              onStartEdit={handleStartEdit}
              onCancelEdit={handleCancelEdit}
              onSaveEdit={handleSaveEdit}
              onArchive={handleArchive}
              onSelect={onSelect}
              selected={selectedAssetId === asset.id}
              busyAction={busyAssetAction.id === asset.id ? busyAssetAction.type : ''}
            />
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 text-sm text-slate-500">
        <div>
          Página {displayPage} de {totalPages || 1} · {response.total || 0} assets
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={displayPage <= 1}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Anterior
          </button>
          <button
            type="button"
            onClick={() => setPage((current) => current + 1)}
            disabled={!totalPages || displayPage >= totalPages}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Siguiente
          </button>
        </div>
      </div>
    </section>
  )
}
