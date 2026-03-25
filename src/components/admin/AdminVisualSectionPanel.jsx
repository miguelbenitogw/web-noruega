import { useEffect, useMemo, useState } from 'react'
import { CONTENT_OVERRIDE_EVENT, getByPath, readContentOverrides } from '../../lib/contentOverrides'

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

export default function AdminVisualSectionPanel({
  activeSectionId,
  activeTab,
  onChangeTab,
  onSelectSection,
  previewConfig,
}) {
  const [overrideTick, setOverrideTick] = useState(0)

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
        <p className="mt-1 text-sm leading-relaxed text-slate-500">
          {previewConfig.panelVariant === 'news-manager'
            ? 'Bruk dette panelet som huskeliste mens du jobber i nyhetsstudioet.'
            : 'Velg en seksjon for å få oversikt over hvilke felter som styres i canvaset.'}
        </p>
      </div>

      <div className="max-h-[40vh] overflow-y-auto px-5 py-5 xl:h-[calc(100vh-206px)] xl:max-h-none">
        {previewConfig.panelVariant === 'news-manager' ? (
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
                      const hasOverride = entry.path ? getByPath(overrides, entry.path) !== undefined : false

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
