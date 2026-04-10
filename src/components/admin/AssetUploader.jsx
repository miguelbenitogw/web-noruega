import { useId, useMemo, useState } from 'react'
import {
  CONTENT_ASSET_ALLOWED_MIME_TYPES,
  CONTENT_ASSET_MAX_SIZE_BYTES,
  uploadAsset,
} from '../../lib/contentAssetsService.js'

const inputClass = 'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
const helperTextClass = 'text-xs text-slate-500'

const formatFileSize = (value) => {
  const size = Number(value)
  if (!Number.isFinite(size) || size <= 0) return '0 B'
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

const getAcceptedMimeLabel = () => CONTENT_ASSET_ALLOWED_MIME_TYPES.join(', ')

export default function AssetUploader({
  defaultUsageType = '',
  onUploaded,
  submitLabel = 'Last opp asset',
  title = 'Last opp nytt asset',
  compact = false,
}) {
  const fileInputId = useId()
  const [selectedFile, setSelectedFile] = useState(null)
  const [alt, setAlt] = useState('')
  const [usageType, setUsageType] = useState(defaultUsageType)
  const [uploadState, setUploadState] = useState({ kind: 'idle', message: '', progress: 0 })

  const acceptedMimeLabel = useMemo(() => getAcceptedMimeLabel(), [])
  const isUploading = uploadState.kind === 'uploading'

  const handleFileChange = (event) => {
    const nextFile = event.target.files?.[0] ?? null
    setSelectedFile(nextFile)
    setUploadState({ kind: 'idle', message: '', progress: 0 })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!selectedFile) {
      setUploadState({ kind: 'error', message: 'Elegí un archivo antes de subirlo.', progress: 0 })
      return
    }

    setUploadState({ kind: 'uploading', message: 'Validando archivo…', progress: 15 })

    try {
      setUploadState({ kind: 'uploading', message: 'Subiendo asset…', progress: 55 })

      const asset = await uploadAsset(selectedFile, {
        alt,
        usage: usageType,
      })

      setUploadState({ kind: 'success', message: 'Asset subido correctamente.', progress: 100 })
      setSelectedFile(null)
      setAlt('')
      setUsageType(defaultUsageType)

      const fileInput = globalThis.document?.getElementById(fileInputId)
      if (fileInput) {
        fileInput.value = ''
      }

      onUploaded?.(asset)
    } catch (error) {
      setUploadState({
        kind: 'error',
        message: error instanceof Error ? error.message : 'No se pudo subir el asset.',
        progress: 0,
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${compact ? '' : 'rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm'}`}>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
        <p className={helperTextClass}>
          Permitidos: {acceptedMimeLabel}. Máximo: {formatFileSize(CONTENT_ASSET_MAX_SIZE_BYTES)}.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor={fileInputId} className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Archivo
        </label>
        <input
          id={fileInputId}
          type="file"
          accept={CONTENT_ASSET_ALLOWED_MIME_TYPES.join(',')}
          className={inputClass}
          onChange={handleFileChange}
          disabled={isUploading}
        />
        {selectedFile ? (
          <p className={helperTextClass}>
            {selectedFile.name} · {formatFileSize(selectedFile.size)}
          </p>
        ) : null}
      </div>

      <div className={`grid gap-4 ${compact ? '' : 'md:grid-cols-2'}`}>
        <label className="block space-y-2">
          <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Alt (opcional)</span>
          <input
            className={inputClass}
            value={alt}
            onChange={(event) => setAlt(event.target.value)}
            placeholder="Descripción accesible"
            disabled={isUploading}
          />
        </label>

        <label className="block space-y-2">
          <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Usage (opcional)</span>
          <input
            className={inputClass}
            value={usageType}
            onChange={(event) => setUsageType(event.target.value)}
            placeholder="cover-image"
            disabled={isUploading}
          />
        </label>
      </div>

      {uploadState.kind !== 'idle' ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            uploadState.kind === 'error'
              ? 'border-red-200 bg-red-50 text-red-700'
              : uploadState.kind === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-primary-200 bg-primary-50 text-primary-700'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <span>{uploadState.message}</span>
            <span className="text-xs font-semibold">{uploadState.progress}%</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/70">
            <div
              className={`h-full rounded-full transition-all ${
                uploadState.kind === 'error'
                  ? 'bg-red-500'
                  : uploadState.kind === 'success'
                    ? 'bg-emerald-500'
                    : 'bg-primary-500'
              }`}
              style={{ width: `${uploadState.progress}%` }}
            />
          </div>
        </div>
      ) : null}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isUploading}
          className="inline-flex items-center justify-center rounded-2xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isUploading ? 'Subiendo…' : submitLabel}
        </button>
      </div>
    </form>
  )
}
