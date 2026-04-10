import { useMemo, useState } from 'react'

const tabClass = (active) => `inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold transition ${
  active ? 'bg-primary-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100'
}`

function PreviewCard({ title, subtitle, children, tone = 'default' }) {
  const toneClass = tone === 'accent'
    ? 'border-primary-200 bg-primary-50/70'
    : 'border-slate-200 bg-white/90'

  return (
    <section className={`rounded-[28px] border p-4 shadow-sm backdrop-blur ${toneClass}`}>
      <div className="mb-3">
        <h3 className="text-sm font-bold text-slate-950">{title}</h3>
        {subtitle ? <p className="mt-1 text-xs text-slate-500">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  )
}

function PreviewMeta({ label, value }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-slate-700">{value || '---'}</p>
    </div>
  )
}

function renderBodyPreview(body) {
  if (!body?.trim()) {
    return <p className="text-sm text-slate-400">Ingen brodtekst ennå.</p>
  }

  return body
    .split(/\n{2,}/)
    .filter(Boolean)
    .slice(0, 4)
    .map((paragraph, index) => (
      <p key={`${index}-${paragraph.slice(0, 12)}`} className="text-sm leading-7 text-slate-700">
        {paragraph.replace(/^#{1,6}\s+/gm, '').replace(/^>\s?/gm, '').trim()}
      </p>
    ))
}

export default function ContentLivePreview({
  entityType,
  draft,
  resolvedContent,
  activeTemplate,
  templateIssues,
  currentItem,
  previewPayload,
  assetDataset = [],
}) {
  const [activeTab, setActiveTab] = useState('preview')

  const payloadJson = useMemo(() => JSON.stringify(previewPayload, null, 2), [previewPayload])
  const contentJson = useMemo(() => JSON.stringify(resolvedContent ?? {}, null, 2), [resolvedContent])
  const resolvedCoverAsset = useMemo(
    () => assetDataset.find((asset) => asset?.id === draft.coverImageAssetId) || null,
    [assetDataset, draft.coverImageAssetId],
  )
  const resolvedAssetImageUrl = resolvedCoverAsset?.publicUrl || ''
  const previewImageUrl = resolvedAssetImageUrl || draft.coverImage
  const previewImageAlt = resolvedCoverAsset?.alt || draft.title || 'Forhandsvisningsbilde'

  return (
    <div className="space-y-4 rounded-[28px] border border-slate-200 bg-gradient-to-b from-white via-slate-50 to-white p-4 shadow-[0_12px_48px_-24px_rgba(15,23,42,0.35)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-600">
            Forhandsvisning
          </p>
          <h2 className="mt-1 font-heading text-lg font-bold text-slate-950">
            {entityType === 'news' ? 'Forhandsvisning av nyhet' : 'Forhandsvisning av side'}
          </h2>
        </div>

        <div className="inline-flex rounded-full border border-slate-200 bg-slate-100 p-1">
          <button type="button" className={tabClass(activeTab === 'preview')} onClick={() => setActiveTab('preview')}>
            Side
          </button>
          <button type="button" className={tabClass(activeTab === 'seo')} onClick={() => setActiveTab('seo')}>
            SEO
          </button>
          <button type="button" className={tabClass(activeTab === 'payload')} onClick={() => setActiveTab('payload')}>
            Datastrøm
          </button>
        </div>
      </div>

      {activeTab === 'preview' ? (
        <div className="space-y-4">
          <PreviewCard
            title={draft.title?.trim() || 'Uten tittel'}
            subtitle={draft.slug ? `/${draft.slug}` : 'Legg inn slug for å se URL-strukturen'}
            tone="accent"
          >
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-full border border-primary-200 bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary-700">
                  {draft.status === 'published' ? 'Publisert' : 'Kladd'}
                </span>
                {activeTemplate?.name ? (
                  <span className="inline-flex rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600">
                    {activeTemplate.name}
                  </span>
                ) : null}
                {draft.publishAt ? (
                  <span className="inline-flex rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600">
                    {draft.publishAt}
                  </span>
                ) : null}
                {draft.featured ? (
                  <span className="inline-flex rounded-full border border-primary-200 bg-primary-100 px-2.5 py-1 text-[11px] font-semibold text-primary-700">
                    Fremhevet
                  </span>
                ) : null}
                {resolvedCoverAsset ? (
                  <span className="inline-flex rounded-full border border-primary-200 bg-white px-2.5 py-1 text-[11px] font-medium text-primary-700">
                    Cover via asset
                  </span>
                ) : null}
              </div>

              {previewImageUrl ? (
                <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-slate-100">
                  <img src={previewImageUrl} alt={previewImageAlt} className="h-44 w-full object-cover" />
                </div>
              ) : (
                <div className="flex h-32 items-center justify-center rounded-[24px] border border-dashed border-slate-300 bg-white text-center text-sm text-slate-400">
                  Forsidebildet vises her når du legger inn en URL eller asociás un asset con URL resolvible.
                </div>
              )}

              {draft.excerpt ? (
                <p className="text-sm leading-7 text-slate-600">{draft.excerpt}</p>
              ) : (
                <p className="text-sm italic text-slate-400">Ingressen vises her når du fyller den inn.</p>
              )}

              <div className="space-y-3">{renderBodyPreview(draft.body)}</div>
            </div>
          </PreviewCard>

          <div className="grid gap-3 sm:grid-cols-2">
            <PreviewMeta label="Mal" value={activeTemplate?.key || draft.templateKey} />
            <PreviewMeta label="Eksisterende ID" value={currentItem?.id || draft.id} />
          </div>

          {templateIssues?.length ? (
            <PreviewCard title="Avvik i malen" subtitle="Disse meldingene kommer direkte fra template-resolveren.">
              <ul className="space-y-2 text-sm text-amber-900">
                {templateIssues.map((issue) => (
                  <li key={issue} className="rounded-[20px] border border-amber-200 bg-amber-50 px-3 py-2">
                    {issue}
                  </li>
                ))}
              </ul>
            </PreviewCard>
          ) : null}
        </div>
      ) : null}

      {activeTab === 'seo' ? (
        <div className="space-y-4">
          <PreviewCard title="SERP-utkast" subtitle="Omtrent slik innholdet kan se ut i søkeresultatet.">
            <div className="rounded-[24px] border border-slate-200 bg-white px-4 py-3">
              <p className="text-xs text-green-700">{draft.slug ? `https://globalworking.no/${draft.slug}` : 'https://globalworking.no/slug'}</p>
              <p className="mt-2 text-base font-medium text-[#1a0dab]">
                {draft.seoTitle?.trim() || draft.title?.trim() || 'SEO-tittel'}
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {draft.seoDescription?.trim() || draft.excerpt?.trim() || 'SEO-beskrivelse'}
              </p>
            </div>
          </PreviewCard>

          <div className="grid gap-3">
            <PreviewMeta label="Lengde SEO-tittel" value={draft.seoTitle ? `${draft.seoTitle.length} tegn` : '0 tegn'} />
            <PreviewMeta label="Lengde SEO-beskrivelse" value={draft.seoDescription ? `${draft.seoDescription.length} tegn` : '0 tegn'} />
          </div>
        </div>
      ) : null}

      {activeTab === 'payload' ? (
        <div className="space-y-4">
          <PreviewCard title="Sammenslått content" subtitle="Malens defaults + redigerte verdier.">
            <pre className="max-h-[280px] overflow-auto rounded-[24px] bg-slate-950 p-4 text-xs leading-6 text-slate-100">
              {contentJson}
            </pre>
          </PreviewCard>

          <PreviewCard title="Lagringspayload" subtitle="Dette er formen som sendes videre til lagringslaget.">
            <pre className="max-h-[360px] overflow-auto rounded-[24px] bg-slate-950 p-4 text-xs leading-6 text-slate-100">
              {payloadJson}
            </pre>
          </PreviewCard>
        </div>
      ) : null}
    </div>
  )
}
