import { useMemo, useState } from 'react'
import AssetLibraryPanel from './AssetLibraryPanel'
import AssetUploader from './AssetUploader'

const tabClass = (active) => `inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold transition ${
  active ? 'bg-primary-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100'
}`

export default function AssetPicker({
  selectedAssetId = '',
  selectedAsset = null,
  defaultUsageType = '',
  onSelect,
  onClear,
  title = 'Asset picker',
  description = 'Seleccioná un asset existente o subí uno nuevo.',
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('library')

  const hasSelection = Boolean(selectedAssetId)

  const selectedSummary = useMemo(() => {
    if (!selectedAssetId) return 'Ningún asset seleccionado.'
    if (!selectedAsset) return `Asset seleccionado: ${selectedAssetId}`

    return selectedAsset.alt || selectedAsset.caption || selectedAsset.usageType || selectedAssetId
  }, [selectedAsset, selectedAssetId])

  const handleSelectAsset = (asset) => {
    if (!asset?.id) return
    onSelect?.({ assetId: asset.id, asset })
    setIsOpen(false)
  }

  const handleUploadAsset = (asset) => {
    if (!asset?.id) return
    onSelect?.({ assetId: asset.id, asset })
    setIsOpen(false)
  }

  return (
    <section className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
          <p className="text-xs text-slate-500">{description}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setIsOpen((current) => !current)}
            className="inline-flex items-center justify-center rounded-2xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
          >
            {isOpen ? 'Ocultar picker' : hasSelection ? 'Cambiar asset' : 'Elegir asset'}
          </button>

          {hasSelection ? (
            <button
              type="button"
              onClick={() => onClear?.()}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Limpiar selección
            </button>
          ) : null}
        </div>
      </div>

      <div className={`rounded-[24px] border px-4 py-4 text-sm ${hasSelection ? 'border-primary-200 bg-primary-50/60 text-primary-900' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
        <p className="font-semibold">{selectedSummary}</p>
        {selectedAsset?.publicUrl ? (
          <div className="mt-3 overflow-hidden rounded-[20px] border border-white/60 bg-white">
            <img src={selectedAsset.publicUrl} alt={selectedAsset.alt || 'Selected asset preview'} className="h-36 w-full object-cover" />
          </div>
        ) : null}
      </div>

      {isOpen ? (
        <div className="space-y-4 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
          <div className="inline-flex rounded-full border border-slate-200 bg-slate-100 p-1">
            <button type="button" className={tabClass(activeTab === 'library')} onClick={() => setActiveTab('library')}>
              Librería
            </button>
            <button type="button" className={tabClass(activeTab === 'upload')} onClick={() => setActiveTab('upload')}>
              Upload
            </button>
          </div>

          {activeTab === 'library' ? (
            <AssetLibraryPanel
              onSelect={handleSelectAsset}
              selectedAssetId={selectedAssetId}
              title="Seleccionar desde librería"
              description="Elegí un asset ya cargado para reutilizarlo."
            />
          ) : (
            <AssetUploader
              defaultUsageType={defaultUsageType}
              onUploaded={handleUploadAsset}
              submitLabel="Subir y seleccionar"
              title="Subir nuevo asset"
            />
          )}
        </div>
      ) : null}
    </section>
  )
}
