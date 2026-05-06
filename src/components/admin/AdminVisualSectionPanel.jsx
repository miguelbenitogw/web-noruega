import { useEffect, useMemo, useState } from 'react'
import { CONTENT_OVERRIDE_EVENT, deleteByPath, getByPath, readContentOverrides, setByPath, writeContentOverrides } from '../../lib/contentOverrides'
import { getAssetById, listAssets, uploadAsset, CONTENT_ASSET_ALLOWED_MIME_TYPES, CONTENT_ASSET_MAX_SIZE_BYTES } from '../../lib/contentAssetsService'

function TabButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-2xl px-3 py-2 text-sm font-semibold transition ${
        active
          ? 'bg-slate-950 text-white shadow-sm'
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      {children}
    </button>
  )
}

function NewsManagerPanel() {
  return (
    <div className="space-y-4">
      <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Hva du kan gjøre</p>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-600">
          <li>• Opprett nye nyheter med slug, ingress, tagg og lesetid.</li>
          <li>• Lagre som kladd eller publiser direkte med eksisterende API-er.</li>
          <li>• Merk en sak som fremhevet uten å kreve SQL-endringer.</li>
          <li>• Bygg artikkelinnhold med hjelpeknapper i stedet for manuell markdown-syntaks.</li>
        </ul>
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Kompatibilitet</p>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Fremhevet-status lagres kompatibelt i <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-800">metadata.content.featured</code> når modellen ikke tilbyr et eget felt.
        </p>
      </div>

      <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">API-begrensning</p>
        <p className="mt-3 text-sm leading-relaxed text-amber-900">
          Sletting er ikke eksponert i dagens content API. Derfor håndterer studioet kladd og publisering, men ikke hard delete.
        </p>
      </div>
    </div>
  )
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function isImageUrlPath(path) {
  if (!path) return false
  return path.endsWith('ImageUrl') || path.endsWith('.imageUrl')
}

function commitOverride(path, value) {
  const current = readContentOverrides()
  setByPath(current, path, value)
  writeContentOverrides(current)
}

function clearOverride(path) {
  const current = readContentOverrides()
  deleteByPath(current, path)
  writeContentOverrides(current)
}

function CompactAssetLibrary({ selectedAssetId, onSelect }) {
  const [search, setSearch] = useState('')
  const [assets, setAssets] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    listAssets({ page: 1, pageSize: 18, search, status: 'active' })
      .then((result) => {
        if (!cancelled) {
          setAssets(result?.items ?? result ?? [])
          setError(null)
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message ?? 'Kunne ikke laste bilder')
      })
    return () => { cancelled = true }
  }, [search])

  return (
    <div className="space-y-2">
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Søk i bibliotek…"
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-300"
      />
      {error ? (
        <p className="py-2 text-xs text-red-500">{error}</p>
      ) : assets.length === 0 ? (
        <p className="py-4 text-center text-xs text-slate-400">Ingen bilder funnet</p>
      ) : (
        <div className="grid grid-cols-3 gap-1.5">
          {assets.map((asset) => {
            const isSelected = asset.id === selectedAssetId
            return (
              <button
                key={asset.id}
                type="button"
                onClick={() => onSelect({ assetId: asset.id, asset })}
                className={`rounded-xl overflow-hidden border cursor-pointer transition ${
                  isSelected
                    ? 'border-primary-500 ring-2 ring-primary-500'
                    : 'border-slate-200 hover:border-primary-400'
                }`}
              >
                <img
                  src={asset.publicUrl}
                  alt={asset.altText ?? ''}
                  className="h-16 w-full object-cover"
                  loading="lazy"
                  onError={(e) => { e.currentTarget.style.opacity = '0.3' }}
                />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function CompactAssetUpload({ onUploaded }) {
  const [file, setFile] = useState(null)
  const [altText, setAltText] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) return
    if (!CONTENT_ASSET_ALLOWED_MIME_TYPES.includes(file.type)) {
      setError('Ugyldig filtype. Tillatt: JPEG, PNG, WebP')
      return
    }
    if (file.size > CONTENT_ASSET_MAX_SIZE_BYTES) {
      setError(`Filen er for stor. Maks ${Math.round(CONTENT_ASSET_MAX_SIZE_BYTES / 1024 / 1024)} MB`)
      return
    }
    setError(null)
    setUploading(true)
    try {
      const asset = await uploadAsset(file, { altText: altText.trim() || undefined })
      onUploaded({ assetId: asset.id, asset })
    } catch (err) {
      setError(err?.message ?? 'Opplasting mislyktes')
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div>
        <input
          type="file"
          accept={CONTENT_ASSET_ALLOWED_MIME_TYPES.join(',')}
          onChange={(e) => { setFile(e.target.files?.[0] ?? null); setError(null) }}
          className="w-full text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
        />
      </div>
      <input
        type="text"
        value={altText}
        onChange={(e) => setAltText(e.target.value)}
        placeholder="Alternativ tekst (valgfritt)"
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-300"
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={!file || uploading}
        className="w-full rounded-xl bg-primary-600 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {uploading ? 'Laster opp…' : 'Last opp'}
      </button>
    </form>
  )
}

function ImageFieldEditor({ path, currentValue }) {
  // Derive initial mode and values directly from currentValue — avoids setState-in-effect lint error.
  // The component is reset via `key` at the call site when currentValue changes externally.
  const isInitialUUID = Boolean(currentValue && typeof currentValue === 'string' && UUID_PATTERN.test(currentValue.trim()))
  const [selectedAssetId, setSelectedAssetId] = useState(() => isInitialUUID ? currentValue.trim() : '')
  const [selectedAsset, setSelectedAsset] = useState(null)
  const [textValue, setTextValue] = useState(() => isInitialUUID ? '' : (currentValue || ''))
  const [mode, setMode] = useState(() => isInitialUUID ? 'asset' : 'url')
  const [assetTab, setAssetTab] = useState('bibliotek')

  // Only the async side-effect: fetch asset details when assetId is known.
  // selectedAsset is reset to null via event handlers (handleAssetClear) — not here.
  useEffect(() => {
    if (!selectedAssetId) return
    let cancelled = false
    getAssetById(selectedAssetId)
      .then((asset) => { if (!cancelled) setSelectedAsset(asset) })
      .catch(() => { if (!cancelled) setSelectedAsset(null) })
    return () => { cancelled = true }
  }, [selectedAssetId])

  const handleAssetSelect = ({ assetId, asset }) => {
    setSelectedAssetId(assetId)
    setSelectedAsset(asset)
    // Store publicUrl as the override value so all current consumers work immediately
    const urlToStore = asset?.publicUrl || assetId
    commitOverride(path, urlToStore)
  }

  const handleAssetClear = () => {
    setSelectedAssetId('')
    setSelectedAsset(null)
    clearOverride(path)
  }

  const handleUrlCommit = (value) => {
    setTextValue(value)
    if (value.trim()) {
      commitOverride(path, value.trim())
    } else {
      clearOverride(path)
    }
  }

  const handleUploaded = ({ assetId, asset }) => {
    handleAssetSelect({ assetId, asset })
    setAssetTab('bibliotek')
  }

  const previewUrl = selectedAsset?.publicUrl || (!isInitialUUID && currentValue ? currentValue : null)

  return (
    <div className="mt-3 space-y-3">
      {/* Mode toggle */}
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={() => setMode('asset')}
          className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${mode === 'asset' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
        >
          Bibliotek
        </button>
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${mode === 'url' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
        >
          URL direkte
        </button>
      </div>

      {mode === 'asset' ? (
        <div className="space-y-3">
          {/* Current image preview */}
          {previewUrl && (
            <div className="flex items-center gap-2">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                <img src={previewUrl} alt="" className="h-full w-full object-cover" />
              </div>
              <button
                type="button"
                onClick={handleAssetClear}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 transition"
              >
                Fjern
              </button>
            </div>
          )}

          {/* Inner tabs: Bibliotek / Last opp */}
          <div className="flex gap-2 rounded-[20px] bg-slate-100 p-1">
            <TabButton active={assetTab === 'bibliotek'} onClick={() => setAssetTab('bibliotek')}>
              Bibliotek
            </TabButton>
            <TabButton active={assetTab === 'upload'} onClick={() => setAssetTab('upload')}>
              Last opp
            </TabButton>
          </div>

          {assetTab === 'bibliotek' ? (
            <CompactAssetLibrary selectedAssetId={selectedAssetId} onSelect={handleAssetSelect} />
          ) : (
            <CompactAssetUpload onUploaded={handleUploaded} />
          )}
        </div>
      ) : (
        <label className="block space-y-1.5">
          <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">URL</span>
          <input
            type="text"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-300"
            value={textValue}
            placeholder="https://… eller /path/to/image.jpg"
            onChange={(e) => setTextValue(e.target.value)}
            onBlur={(e) => handleUrlCommit(e.target.value)}
          />
          {textValue && (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
              <img src={textValue} alt="" className="h-28 w-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
            </div>
          )}
        </label>
      )}
    </div>
  )
}

function TextFieldEditor({ path, currentValue }) {
  // No useEffect needed — component is reset via `key` at the call site when currentValue changes externally.
  const [value, setValue] = useState(currentValue ?? '')

  const handleBlur = () => {
    if (value.trim()) {
      commitOverride(path, value)
    } else {
      clearOverride(path)
    }
  }

  return (
    <div className="mt-3">
      <input
        type="text"
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-300"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        placeholder="Skriv inn verdi…"
      />
    </div>
  )
}

function InstructionsPanel() {
  return (
    <div className="space-y-4">
      <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Hva kan du redigere?</p>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-600">
          <li>• <strong>Tekst:</strong> Klikk på et felt i forhåndsvisningen og skriv direkte</li>
          <li>• <strong>Bilder:</strong> Velg fra Asset Picker (bibliotek) eller lim inn URL direkte</li>
          <li>• <strong>Lenker og CTA:</strong> Redigeres i "Felter"-fanen (denne panelen)</li>
          <li>• <strong>Lagring:</strong> Endringer lagres automatisk lokalt mens du skriver</li>
        </ul>
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Flyt: kladd → publiser → resultat</p>
        <ol className="mt-3 space-y-2 text-sm leading-relaxed text-slate-600 list-none">
          <li><strong>1.</strong> Gjør endringer direkte i forhåndsvisningen til venstre</li>
          <li><strong>2.</strong> Klikk <strong>«Lagre kladd»</strong> øverst → lagres i Supabase som kladd</li>
          <li><strong>3.</strong> Klikk <strong>«Publiser»</strong> øverst → endringer blir aktive for alle besøkende</li>
          <li><strong>4.</strong> Åpne siden i ny fane for å bekrefte publisert versjon</li>
        </ol>
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Tekstfelt: ett avsnitt vs. flere</p>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-600">
          <li>• <strong>Én linje:</strong> Skriv normalt og trykk Enter</li>
          <li>• <strong>Nytt avsnitt:</strong> Trykk <code className="rounded bg-slate-200 px-1.5 py-0.5 font-mono text-xs">Enter</code> to ganger — skaper synlig avstand</li>
          <li>• Norske tegn (æ, ø, å) og spesialtegn støttes fullt ut</li>
        </ul>
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Bilder: to måter å bytte</p>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-600">
          <li>• <strong>Asset Picker:</strong> Velg <em>Asset</em>-knappen → åpner mediebiblioteket → velg eller last opp bilde (PNG, JPG, WebP)</li>
          <li>• <strong>URL direkte:</strong> Velg <em>URL direkte</em>-knappen → lim inn en bildelenke (https://…)</li>
          <li>• Bildestørrelse tilpasses automatisk av siden — ingen grunn til å tenke på dette</li>
        </ul>
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Lagring: automatisk vs. manuell</p>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-600">
          <li>• <strong>Automatisk:</strong> Endringer lagres øyeblikkelig i nettleseren (lokal cache)</li>
          <li>• <strong>Kladd:</strong> «Lagre kladd» sender endringene til Supabase — trygt mellomlagret</li>
          <li>• <strong>Publisering:</strong> Bare «Publiser»-knappen gjør endringer synlige for besøkende</li>
        </ul>
      </div>

      <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Tips og feilsøking</p>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-amber-900">
          <li>• <strong>Noe ser feil ut?</strong> Klikk «Tøm lokal cache» øverst — dette fjerner usave lokale endringer og henter siste publiserte versjon</li>
          <li>• <strong>Seksjoner:</strong> Bruk «Seksjoner»-fanen for å navigere mellom deler av siden uten å gå ut av editoren</li>
          <li>• <strong>Asset Picker:</strong> Du kan navigere normalt mens Asset Picker er åpen</li>
        </ul>
      </div>
    </div>
  )
}

export default function AdminVisualSectionPanel({
  activeSectionId,
  activeTab,
  onChangeTab,
  onSelectSection,
  previewConfig,
}) {
  const [overrideTick, setOverrideTick] = useState(0)
  const [showInstructions, setShowInstructions] = useState(false)

  useEffect(() => {
    const sync = () => setOverrideTick((value) => value + 1)
    window.addEventListener(CONTENT_OVERRIDE_EVENT, sync)
    return () => window.removeEventListener(CONTENT_OVERRIDE_EVENT, sync)
  }, [])

  const overrides = useMemo(() => {
    void overrideTick
    return readContentOverrides()
  }, [overrideTick])

  const selectedSection = previewConfig.sections.find((entry) => entry.id === activeSectionId) || previewConfig.sections[0] || null

  return (
    <aside className="w-full shrink-0 border-t border-slate-200 bg-white xl:min-h-0 xl:w-[380px] xl:border-l xl:border-t-0">
      <div className="border-b border-slate-200 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          {previewConfig.panelVariant === 'news-manager' ? 'Redaksjon' : 'Seksjonspanel'}
        </p>
        <h2 className="mt-2 font-heading text-xl font-bold text-slate-950">{previewConfig.label}</h2>
        <button
          type="button"
          onClick={() => setShowInstructions((v) => !v)}
          className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
            showInstructions
              ? 'bg-primary-600 text-white'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900'
          }`}
        >
          <span aria-hidden="true">?</span>
          {showInstructions ? 'Lukk hjelp' : 'Hjelp og instruksjoner'}
        </button>
        <p className="mt-1 text-sm leading-relaxed text-slate-500">
          {previewConfig.panelVariant === 'news-manager'
            ? 'Bruk dette panelet som huskeliste mens du jobber i nyhetsstudioet.'
            : 'Velg en seksjon for å få oversikt over hvilke felter som styres i canvaset.'}
        </p>
      </div>

      <div className="max-h-[40vh] overflow-y-auto px-5 py-5 xl:h-[calc(100vh-206px)] xl:max-h-none">
        {showInstructions ? (
          <InstructionsPanel />
        ) : previewConfig.panelVariant === 'news-manager' ? (
          <NewsManagerPanel />
        ) : (
          <>
            <div className="flex gap-2 rounded-[20px] bg-slate-100 p-1">
              <TabButton active={activeTab === 'sections'} onClick={() => onChangeTab('sections')}>
                Seksjoner
              </TabButton>
              <TabButton active={activeTab === 'fields'} onClick={() => onChangeTab('fields')}>
                Felter
              </TabButton>
            </div>

            <div className="mt-5">
              {activeTab === 'sections' ? (
                <div className="space-y-3">
                  {previewConfig.sections.map((entry, index) => {
                    const isActive = entry.id === selectedSection?.id

                    return (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => onSelectSection(entry.id)}
                        className={`w-full rounded-[24px] border px-4 py-4 text-left transition ${
                          isActive
                            ? 'border-primary-200 bg-primary-50 shadow-sm'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                              Seksjon {String(index + 1).padStart(2, '0')}
                            </p>
                            <h3 className="mt-1 font-heading text-lg font-bold text-slate-950">{entry.label}</h3>
                          </div>
                          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-500">
                            {entry.fields.length}
                          </span>
                        </div>

                        {entry.description ? (
                          <p className="mt-3 text-sm leading-relaxed text-slate-500">
                            {entry.description}
                          </p>
                        ) : null}
                      </button>
                    )
                  })}
                </div>
              ) : selectedSection ? (
                <div className="space-y-4">
                  <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Aktiv seksjon</p>
                    <h3 className="mt-2 font-heading text-lg font-bold text-slate-950">{selectedSection.label}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">
                      {selectedSection.description || 'Dette er feltene som hører til denne seksjonen.'}
                    </p>
                  </div>

                  {selectedSection.fields.length === 0 ? (
                    <div className="rounded-[24px] border border-dashed border-slate-300 px-4 py-5 text-sm leading-relaxed text-slate-500">
                      Denne seksjonen har ingen registrerte felter ennå.
                    </div>
                  ) : (
                    selectedSection.fields.map((entry) => {
                      const currentOverride = entry.path ? getByPath(overrides, entry.path) : undefined
                      const hasOverride = currentOverride !== undefined
                      const isImage = isImageUrlPath(entry.path)

                      return (
                        <div key={`${selectedSection.id}-${entry.path}-${entry.label}`} className="rounded-[24px] border border-slate-200 bg-white px-4 py-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-slate-950">{entry.label}</p>
                              {entry.description ? (
                                <p className="mt-1 text-sm leading-relaxed text-slate-500">{entry.description}</p>
                              ) : null}
                            </div>
                            <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                              hasOverride
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-slate-100 text-slate-500'
                            }`}>
                              {hasOverride ? 'overstyrt' : 'grunnlag'}
                            </span>
                          </div>

                          <code className="mt-3 block break-all rounded-2xl bg-slate-950 px-3 py-2 text-xs leading-relaxed text-slate-100">
                            {entry.path}
                          </code>

                          {entry.path ? (
                            isImage ? (
                              <ImageFieldEditor
                                key={`${entry.path}::${typeof currentOverride === 'string' ? currentOverride : ''}`}
                                path={entry.path}
                                currentValue={typeof currentOverride === 'string' ? currentOverride : ''}
                              />
                            ) : (
                              <TextFieldEditor
                                key={`${entry.path}::${currentOverride != null ? String(currentOverride) : ''}`}
                                path={entry.path}
                                currentValue={currentOverride != null ? String(currentOverride) : ''}
                              />
                            )
                          ) : null}
                        </div>
                      )
                    })
                  )}
                </div>
              ) : null}
            </div>
          </>
        )}
      </div>
    </aside>
  )
}
