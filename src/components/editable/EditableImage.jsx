import { useEffect, useState } from 'react'

const isBrowser = () => typeof window !== 'undefined'

const GW_IMAGE_FIELD_FOCUS = 'gw-image-field-focus'
const GW_VISUAL_EDIT_CHANGE = 'gw-visual-edit-change'

function readEditEnabled() {
  if (!isBrowser()) return false
  if (window.__GW_VISUAL_EDIT__?.enabled === true) return true
  const rootMode = window.document?.documentElement?.dataset?.visualEditMode
  if (rootMode === 'true') return true
  const bodyMode = window.document?.body?.dataset?.visualEditMode
  if (bodyMode === 'true') return true
  return false
}

/**
 * EditableImage — drop-in replacement for <img> that shows a "Bytt bilde"
 * hover overlay in admin visual-edit mode. Clicking dispatches a
 * `gw-image-field-focus` event so the right panel opens the field editor.
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
  // Reactive: re-reads whenever the admin toggles visual-edit mode
  const [editMode, setEditMode] = useState(() => readEditEnabled())

  useEffect(() => {
    const handler = () => setEditMode(readEditEnabled())
    window.addEventListener(GW_VISUAL_EDIT_CHANGE, handler)
    // Also sync on mount in case the event already fired
    handler()
    return () => window.removeEventListener(GW_VISUAL_EDIT_CHANGE, handler)
  }, [])

  function handleClick() {
    if (!path) return
    window.dispatchEvent(new CustomEvent(GW_IMAGE_FIELD_FOCUS, { detail: { path } }))
  }

  if (!editMode) {
    return <img src={src} alt={alt} className={className} {...rest} />
  }

  return (
    <div className={`relative group/editimg ${wrapperClassName || ''}`}>
      <img src={src} alt={alt} className={className} {...rest} />
      <button
        type="button"
        onClick={handleClick}
        onContextMenu={(e) => { e.preventDefault(); handleClick() }}
        className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover/editimg:bg-black/40 outline outline-2 outline-dashed outline-primary-400/70 hover:outline-primary-500 transition-all duration-200 cursor-pointer"
        style={{ borderRadius: 'inherit' }}
        aria-label="Rediger bilde"
      >
        <span className="flex items-center gap-2 bg-white text-slate-900 text-xs font-bold px-3 py-2 rounded-full shadow-lg pointer-events-none group-hover/editimg:scale-110 transition-transform">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
          Bytt bilde
        </span>
      </button>
    </div>
  )
}
