import { useMemo, useState } from 'react'

const tabClass = (active) => `inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold transition ${
  active ? 'bg-primary-600 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100'
}`

function PreviewCard({ title, subtitle, children, tone = 'default' }) {
  const toneClass = tone === 'accent'
    ? 'border-primary-200 bg-primary-50/70'
    : 'border-gray-200 bg-white/90'

  return (
    <section className={`rounded-3xl border p-4 shadow-sm backdrop-blur ${toneClass}`}>
      <div className="mb-3">
        <h3 className="text-sm font-bold text-ink">{title}</h3>
        {subtitle ? <p className="mt-1 text-xs text-gray-500">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  )
}

function PreviewMeta({ label, value }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-gray-700">{value || '—'}</p>
    </div>
  )
}

function renderBodyPreview(body) {
  if (!body?.trim()) {
    return <p className="text-sm text-gray-400">Ingen brødtekst ennå.</p>
  }

  return body
    .split(/\n{2,}/)
    .filter(Boolean)
    .slice(0, 4)
    .map((paragraph, index) => (
      <p key={`${index}-${paragraph.slice(0, 12)}`} className="text-sm leading-7 text-gray-700">
        {paragraph.trim()}
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
}) {
  const [activeTab, setActiveTab] = useState('preview')

  const payloadJson = useMemo(() => JSON.stringify(previewPayload, null, 2), [previewPayload])
  const contentJson = useMemo(() => JSON.stringify(resolvedContent ?? {}, null, 2), [resolvedContent])

  return (
    <div className="space-y-4 rounded-[28px] border border-gray-200 bg-gradient-to-b from-white via-gray-50 to-white p-4 shadow-[0_12px_48px_-24px_rgba(15,23,42,0.35)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-600">
            Live preview
          </p>
          <h2 className="mt-1 font-heading text-lg font-bold text-ink">
            {entityType === 'news' ? 'Forhåndsvisning av nyhet' : 'Forhåndsvisning av side'}
          </h2>
        </div>

        <div className="inline-flex rounded-full border border-gray-200 bg-gray-100 p-1">
          <button type="button" className={tabClass(activeTab === 'preview')} onClick={() => setActiveTab('preview')}>
            Page
          </button>
          <button type="button" className={tabClass(activeTab === 'seo')} onClick={() => setActiveTab('seo')}>
            SEO
          </button>
          <button type="button" className={tabClass(activeTab === 'payload')} onClick={() => setActiveTab('payload')}>
            Payload
          </button>
        </div>
      </div>

      {activeTab === 'preview' ? (
        <div className="space-y-4">
          <PreviewCard
            title={draft.title?.trim() || 'Uten tittel'}
            subtitle={draft.slug ? `/${draft.slug}` : 'Legg inn slug for å se URL-struktur'}
            tone="accent"
          >
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-full border border-primary-200 bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary-700">
                  {draft.status || 'draft'}
                </span>
                {activeTemplate?.name ? (
                  <span className="inline-flex rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-medium text-gray-600">
                    {activeTemplate.name}
                  </span>
                ) : null}
                {draft.publishAt ? (
                  <span className="inline-flex rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-medium text-gray-600">
                    {draft.publishAt}
                  </span>
                ) : null}
              </div>

              {draft.coverImage ? (
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
                  <img src={draft.coverImage} alt={draft.title || 'Preview image'} className="h-44 w-full object-cover" />
                </div>
              ) : (
                <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white text-center text-sm text-gray-400">
                  Cover image vises her når URL er satt.
                </div>
              )}

              {draft.excerpt ? (
                <p className="text-sm leading-7 text-gray-600">{draft.excerpt}</p>
              ) : (
                <p className="text-sm italic text-gray-400">Excerpt vises her når du fyller det inn.</p>
              )}

              <div className="space-y-3">{renderBodyPreview(draft.body)}</div>
            </div>
          </PreviewCard>

          <div className="grid gap-3 sm:grid-cols-2">
            <PreviewMeta label="Template key" value={activeTemplate?.key || draft.templateKey} />
            <PreviewMeta label="Eksisterende ID" value={currentItem?.id || draft.id} />
          </div>

          {templateIssues?.length ? (
            <PreviewCard title="Template issues" subtitle="Disse avvikene kommer direkte fra template-resolveren.">
              <ul className="space-y-2 text-sm text-amber-900">
                {templateIssues.map((issue) => (
                  <li key={issue} className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2">
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
          <PreviewCard title="SERP snapshot" subtitle="Hvordan innholdet omtrent vil fremstå i søkeresultater.">
            <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3">
              <p className="text-xs text-green-700">{draft.slug ? `https://globalworking.no/${draft.slug}` : 'https://globalworking.no/slug'}</p>
              <p className="mt-2 text-base font-medium text-[#1a0dab]">
                {draft.seoTitle?.trim() || draft.title?.trim() || 'SEO title preview'}
              </p>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                {draft.seoDescription?.trim() || draft.excerpt?.trim() || 'SEO description preview'}
              </p>
            </div>
          </PreviewCard>

          <div className="grid gap-3">
            <PreviewMeta label="SEO title length" value={draft.seoTitle ? `${draft.seoTitle.length} tegn` : '0 tegn'} />
            <PreviewMeta label="SEO description length" value={draft.seoDescription ? `${draft.seoDescription.length} tegn` : '0 tegn'} />
          </div>
        </div>
      ) : null}

      {activeTab === 'payload' ? (
        <div className="space-y-4">
          <PreviewCard title="Resolved content" subtitle="Dette er content etter merge mellom defaults og editor-state.">
            <pre className="max-h-[280px] overflow-auto rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">
              {contentJson}
            </pre>
          </PreviewCard>

          <PreviewCard title="Payload snapshot" subtitle="Dette er formen som går inn mot save-laget i neste steg.">
            <pre className="max-h-[360px] overflow-auto rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">
              {payloadJson}
            </pre>
          </PreviewCard>
        </div>
      ) : null}
    </div>
  )
}
