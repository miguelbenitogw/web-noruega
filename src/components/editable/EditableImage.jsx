import { useState } from 'react'
import {
  CONTENT_OVERRIDE_EVENT,
  readContentOverrides,
  setByPath,
  writeContentOverrides,
} from '../../lib/contentOverrides'
import AssetPicker from '../admin/AssetPicker'

const isBrowser = () => typeof window !== 'undefined'

function isVisualEditEnabled() {
  if (!isBrowser()) return false
  if (window.__GW_VISUAL_EDIT__?.enabled === true) return true
  const rootMode = window.document?.documentElement?.dataset?.visualEditMode
  if (rootMode === 'true') return true
  const bodyMode = window.document?.body?.dataset?.visualEditMode
  if (bodyMode === 'true') return true
  return false
}

/**
 * EditableImage — drop-in replacement for <img> that shows an inline
 * "Bytt bilde" overlay when the admin visual-edit mode is active.
 *
 * Props:
 *   path        — dot-notation content path (e.g. "rekrutteringComp.imageUrl")
 *   src         — current image URL
 *   alt         — alt text
 *   className   — forwarded to <img>
 *   wrapperClassName — applied to the wrapper div in edit mode
 *   ...rest     — forwarded to <img> (width, height, loading, etc.)
 */
export default function EditableImage({ path, src, alt, className, wrapperClassName, ...rest }) {
  const [open, setOpen] = useState(false)
  const editMode = isVisualEditEnabled()

  function handleSelect({ asset }) {
    if (!asset?.publicUrl || !path) return
    const overrides = readContentOverrides()
    setByPath(overrides, path, asset.publicUrl)
    writeContentOverrides(overrides)
    window.dispatchEvent(new CustomEvent(CONTENT_OVERRIDE_EVENT))
    setOpen(false)
  }

  if (!editMode) {
    return <img src={src} alt={alt} className={className} {...rest} />
  }

  return (
    <>
      <div className={`relative group/editimg ${wrapperClassName || ''}`}>
        <img src={src} alt={alt} className={className} {...rest} />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover/editimg:bg-black/30 transition-all duration-200 cursor-pointer"
          style={{ borderRadius: 'inherit' }}
          aria-label="Rediger bilde"
        >
          <span className="opacity-0 group-hover/editimg:opacity-100 transition-opacity flex items-center gap-2 bg-white text-slate-900 text-xs font-bold px-3 py-2 rounded-full shadow-lg pointer-events-none">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
            Bytt bilde
          </span>
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.55)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-white rounded-3xl shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
              <h2 className="font-heading text-lg font-bold text-slate-950">Bytt bilde</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-2 hover:bg-slate-100 transition-colors"
                aria-label="Lukk"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div className="p-6">
              <AssetPicker
                title="Velg eller last opp bilde"
                description="Velg et eksisterende bilde fra biblioteket, eller last opp et nytt."
                defaultUsageType="image"
                onSelect={handleSelect}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
