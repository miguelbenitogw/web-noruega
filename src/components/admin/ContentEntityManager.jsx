import { useCallback, useEffect, useMemo, useState } from 'react'
import AdminEntityEditorShell from './AdminEntityEditorShell'
import AdminNewsBodyEditor from './AdminNewsBodyEditor'
import AssetPicker from './AssetPicker'
import ContentLivePreview from './ContentLivePreview'
import TemplateFieldRenderer from './TemplateFieldRenderer'
import useTemplates from '../../hooks/useTemplates'
import useTemplateContent from '../../hooks/useTemplateContent'
import { cloneValue, deepMergeContent } from '../../lib/contentMappers'
import { isStructuredAdminEditorEnabled } from './fields/helpers'
import { getAssetById } from '../../lib/contentAssetsService.js'
import {
  getNewsBySlug,
  getPageBySlug,
  isSupabaseConfigured,
  listNews,
  listPages,
  upsertNews,
  upsertPage,
} from '../../lib/contentServices'

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const baseInputClass = 'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
const baseTextareaClass = `${baseInputClass} min-h-[120px] resize-y`
const adminDateFormatter = new Intl.DateTimeFormat('nb-NO', { dateStyle: 'medium', timeStyle: 'short' })
const NEWS_TEMPLATE_DEFINITIONS = [
  {
    key: 'news_plattform',
    label: 'Kommunikasjon',
    description: 'Bedriftsoppdateringer, lanseringer og korte meldinger.',
  },
  {
    key: 'news_suksesshistorie',
    label: 'Suksesshistorie',
    description: 'Kundecaser og historier med tydelig resultat.',
  },
]
const ALLOWED_NEWS_TEMPLATE_KEYS = new Set(NEWS_TEMPLATE_DEFINITIONS.map((template) => template.key))

const entityConfig = {
  page: {
    title: 'Sider',
    createLabel: 'Ny side',
    emptyLabel: 'Ingen sider ennå.',
    singular: 'side',
    titleFieldLabel: 'Tittel',
    loadList: listPages,
    loadBySlug: getPageBySlug,
    save: upsertPage,
    templateType: 'page',
    bodyLabel: 'Brødtekst',
    extraFields: [],
  },
  news: {
    title: 'Nyheter',
    createLabel: 'Ny nyhet',
    emptyLabel: 'Ingen nyheter ennå.',
    singular: 'nyhet',
    titleFieldLabel: 'Overskrift',
    loadList: listNews,
    loadBySlug: getNewsBySlug,
    save: upsertNews,
    templateType: 'news',
    bodyLabel: 'Artikkelinnhold',
    extraFields: [
      { key: 'tag', label: 'Tagg', placeholder: 'Nyhet' },
      { key: 'readTime', label: 'Lesetid', placeholder: '3 min' },
      { key: 'author', label: 'Forfatter', placeholder: 'Global Working' },
    ],
  },
}

const getNowIso = () => new Date().toISOString()

const getContentLevelAssetId = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return ''
  const assetId = value.coverImageAssetId
  return typeof assetId === 'string' ? assetId : ''
}

const stripSystemContentFields = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}

  const next = { ...value }
  delete next.coverImageAssetId
  return next
}

const resolveSchemaNode = (schema, fieldKey) => {
  if (!schema || typeof schema !== 'object') return null

  if (schema.properties && typeof schema.properties === 'object' && schema.properties[fieldKey] !== undefined) {
    return schema.properties[fieldKey]
  }

  if (schema.fields && typeof schema.fields === 'object' && schema.fields[fieldKey] !== undefined) {
    return schema.fields[fieldKey]
  }

  if (schema[fieldKey] !== undefined) {
    return schema[fieldKey]
  }

  return null
}

const isFeaturedNews = (item) => Boolean(item?.featured || item?.content?.featured)

const createInitialDraft = (entityType, template, existing = {}) => {
  const defaults = template?.defaults ?? template?.frontmatter_example ?? {}
  const contentAssetId = existing.coverImageAssetId ?? getContentLevelAssetId(existing.content) ?? ''
  const resolvedContent = deepMergeContent(defaults, stripSystemContentFields(existing.content ?? {}))
  const featured = entityType === 'news' ? Boolean(existing.featured ?? resolvedContent.featured) : false

  if (entityType === 'news') {
    resolvedContent.featured = featured
  }

  return {
    id: existing.id ?? null,
    slug: existing.slug ?? '',
    title: existing.title ?? '',
    excerpt: existing.excerpt ?? '',
    body: existing.body ?? '',
    status: existing.status ?? 'draft',
    publishAt: existing.publishAt ?? '',
    seoTitle: existing.seoTitle ?? '',
    seoDescription: existing.seoDescription ?? '',
    coverImage: existing.coverImage ?? '',
    coverImageAssetId: String(contentAssetId || '').trim(),
    coverImageAsset: existing.coverImageAsset ?? null,
    templateId: template?.id ?? existing.templateId ?? '',
    templateKey: template?.key ?? existing.templateKey ?? '',
    content: cloneValue(resolvedContent),
    tag: entityType === 'news' ? existing.tag ?? 'Nyhet' : undefined,
    readTime: entityType === 'news' ? existing.readTime ?? '3 min' : undefined,
    author: entityType === 'news' ? existing.author ?? 'Global Working' : undefined,
    featured,
    updatedAt: existing.updatedAt ?? null,
    publishedAt: existing.publishedAt ?? null,
  }
}

const normalizeEntityFromRow = (entityType, row) => {
  if (!row) return null

  const normalizedContent = stripSystemContentFields(row.content ?? {})
  const coverImageAssetId = row.coverImageAssetId ?? getContentLevelAssetId(row.content) ?? ''

  return {
    id: row.id,
    slug: row.slug ?? '',
    title: row.title ?? '',
    excerpt: row.excerpt ?? '',
    body: row.body ?? '',
    status: row.status ?? 'draft',
    publishAt: row.publishAt ?? '',
    seoTitle: row.seoTitle ?? '',
    seoDescription: row.seoDescription ?? '',
    coverImage: row.coverImage ?? '',
    coverImageAssetId: String(coverImageAssetId || '').trim(),
    coverImageAsset: row.coverImageAsset ?? null,
    templateId: row.templateId ?? row.template?.id ?? '',
    templateKey: row.template?.key ?? row.templateKey ?? '',
    template: row.template ?? null,
    content: normalizedContent,
    tag: entityType === 'news' ? row.tag ?? 'Nyhet' : undefined,
    readTime: entityType === 'news' ? row.readTime ?? '3 min' : undefined,
    author: entityType === 'news' ? row.author ?? 'Global Working' : undefined,
    featured: entityType === 'news' ? isFeaturedNews(row) : false,
    updatedAt: row.updatedAt ?? null,
    publishedAt: row.publishedAt ?? null,
  }
}

const getTemplateOptions = (templates, entityType) => templates.map((template) => {
  const newsDefinition = entityType === 'news'
    ? NEWS_TEMPLATE_DEFINITIONS.find((definition) => definition.key === template.key)
    : null

  return {
    value: template.id,
    label: newsDefinition?.label || `${template.name} (${template.key})`,
  }
})

function Field({ label, children, hint, required = false }) {
  return (
    <label className="block space-y-2">
      <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
        {hint ? <span className="ml-1 font-normal text-slate-400">({hint})</span> : null}
      </span>
      {children}
    </label>
  )
}

function Section({ title, children, description }) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-base font-bold text-slate-950">{title}</h3>
          {description ? <p className="text-xs text-slate-500">{description}</p> : null}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </section>
  )
}

function StatusBadge({ status }) {
  const statusLabel = status === 'published' ? 'Publisert' : 'Kladd'
  const toneClass = status === 'published'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
    : 'border-amber-200 bg-amber-50 text-amber-700'

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${toneClass}`}>
      {statusLabel}
    </span>
  )
}

function ListItem({ item, selected, templateName, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-[24px] border px-4 py-4 text-left transition ${
        selected
          ? 'border-primary-200 bg-primary-50 shadow-sm'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold text-slate-950">{item.title || item.slug}</p>
            {item.featured ? (
              <span className="inline-flex items-center rounded-full border border-primary-200 bg-primary-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-700">
                Fremhevet
              </span>
            ) : null}
          </div>
          <p className="mt-1 truncate text-[11px] font-mono text-slate-400">{item.slug}</p>
        </div>
        <StatusBadge status={item.status} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
        <span>{templateName || 'Uten mal'}</span>
        {item.updatedAt ? <span>•</span> : null}
        {item.updatedAt ? <span>{adminDateFormatter.format(new Date(item.updatedAt))}</span> : null}
      </div>
    </button>
  )
}

export default function ContentEntityManager({ entityType }) {
  const config = entityConfig[entityType]
  const { templates, loading: templatesLoading, error: templatesError } = useTemplates(config.templateType)
  const [items, setItems] = useState([])
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [refreshTick, setRefreshTick] = useState(0)
  const [selectedSlug, setSelectedSlug] = useState('')
  const [draft, setDraft] = useState(() => createInitialDraft(entityType, null))
  const [saveState, setSaveState] = useState({ kind: 'idle', message: '' })
  const [fieldErrors, setFieldErrors] = useState({})

  const availableTemplates = useMemo(() => {
    if (entityType !== 'news') return templates
    return templates.filter((template) => ALLOWED_NEWS_TEMPLATE_KEYS.has(template.key))
  }, [entityType, templates])
  const templateMap = useMemo(() => Object.fromEntries(availableTemplates.map((template) => [template.id, template])), [availableTemplates])
  const activeTemplate = useMemo(
    () => templateMap[draft.templateId] || availableTemplates[0] || null,
    [availableTemplates, draft.templateId, templateMap],
  )
  const templateValue = templateMap[draft.templateId] ? draft.templateId : activeTemplate?.id || ''

  const { resolvedContent, issues: templateIssues } = useTemplateContent({
    template: activeTemplate,
    content: draft.content,
  })

  const templateFieldEntries = useMemo(() => Object.entries(resolvedContent || {}), [resolvedContent])
  const currentItem = useMemo(() => items.find((item) => item.slug === selectedSlug) || null, [items, selectedSlug])
  const hasTemplateIssues = templateIssues.length > 0
  const structuredEditorEnabled = isStructuredAdminEditorEnabled()
  const statusBusy = saving || publishing || formLoading || templatesLoading || listLoading

  const previewPayload = useMemo(() => ({
    id: draft.id,
    slug: draft.slug,
    title: draft.title,
    excerpt: draft.excerpt,
    body: draft.body,
    status: draft.status,
    publishAt: draft.publishAt,
    seoTitle: draft.seoTitle,
    seoDescription: draft.seoDescription,
    coverImage: draft.coverImage,
    coverImageAssetId: draft.coverImageAssetId,
    templateId: draft.templateId || activeTemplate?.id || '',
    templateKey: draft.templateKey || activeTemplate?.key || '',
    content: {
      ...resolvedContent,
      ...(draft.coverImageAssetId ? { coverImageAssetId: draft.coverImageAssetId } : {}),
      ...(entityType === 'news' ? { featured: draft.featured } : {}),
    },
    ...(entityType === 'news'
      ? {
          tag: draft.tag,
          readTime: draft.readTime,
          author: draft.author,
          featured: draft.featured,
        }
      : {}),
  }), [activeTemplate?.id, activeTemplate?.key, draft, entityType, resolvedContent])

  const reloadItems = useCallback(() => {
    setRefreshTick((value) => value + 1)
  }, [])

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setListLoading(true)
      setListError(null)

      try {
        if (!isSupabaseConfigured) {
          if (!cancelled) setItems([])
          return
        }

        const rows = await config.loadList()
        if (!cancelled) {
          setItems(rows.map((item) => normalizeEntityFromRow(entityType, item)))
        }
      } catch (error) {
        if (!cancelled) {
          setItems([])
          setListError(error instanceof Error ? error : new Error(`Kunne ikke laste ${config.title.toLowerCase()}.`))
        }
      } finally {
        if (!cancelled) setListLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [config, entityType, refreshTick])

  const startCreate = useCallback(() => {
    setSelectedSlug('')
    setFormLoading(false)
    setFieldErrors({})
    setSaveState({ kind: 'idle', message: '' })
    setDraft(createInitialDraft(entityType, activeTemplate, {}))
  }, [activeTemplate, entityType])

  useEffect(() => {
    if (!selectedSlug) return

    let cancelled = false
    setFormLoading(true)
    setFieldErrors({})
    setSaveState({ kind: 'idle', message: '' })

    const loadEntity = async () => {
      try {
        const row = await config.loadBySlug(selectedSlug)
        if (!cancelled && row) {
          const normalized = normalizeEntityFromRow(entityType, row)
          setDraft(createInitialDraft(entityType, row.template || templateMap[row.templateId] || null, normalized))
        }
      } catch (error) {
        if (!cancelled) {
          setSaveState({
            kind: 'error',
            message: `Kunne ikke laste ${config.singular}: ${error instanceof Error ? error.message : 'Ukjent feil'}`,
          })
        }
      } finally {
        if (!cancelled) setFormLoading(false)
      }
    }

    void loadEntity()

    return () => {
      cancelled = true
    }
  }, [config, entityType, selectedSlug, templateMap])

  useEffect(() => {
    if (selectedSlug || !activeTemplate || templateMap[draft.templateId]) return

    setDraft((current) => ({
      ...current,
      templateId: activeTemplate.id,
      templateKey: activeTemplate.key,
    }))
  }, [activeTemplate, draft.templateId, selectedSlug, templateMap])

  useEffect(() => {
    let cancelled = false
    const assetId = draft.coverImageAssetId?.trim()

    if (!assetId) {
      setDraft((current) => (current.coverImageAsset ? { ...current, coverImageAsset: null } : current))
      return () => {
        cancelled = true
      }
    }

    if (draft.coverImageAsset?.id === assetId) {
      return () => {
        cancelled = true
      }
    }

    const loadAsset = async () => {
      try {
        const asset = await getAssetById(assetId)
        if (!cancelled) {
          setDraft((current) => (current.coverImageAssetId?.trim() === assetId
            ? { ...current, coverImageAsset: asset }
            : current))
        }
      } catch {
        if (!cancelled) {
          setDraft((current) => (current.coverImageAssetId?.trim() === assetId
            ? { ...current, coverImageAsset: null }
            : current))
        }
      }
    }

    void loadAsset()

    return () => {
      cancelled = true
    }
  }, [draft.coverImageAsset?.id, draft.coverImageAssetId])

  const handleTemplateChange = useCallback((templateId) => {
    const nextTemplate = templateMap[templateId] || null
    const nextContent = nextTemplate
      ? deepMergeContent(nextTemplate.defaults ?? nextTemplate.frontmatter_example ?? {}, draft.content || {})
      : {}

    if (entityType === 'news') {
      nextContent.featured = draft.featured
    }

    setDraft((current) => ({
      ...current,
      templateId,
      templateKey: nextTemplate?.key || '',
      content: nextContent,
    }))
    setFieldErrors({})
    setSaveState({ kind: 'idle', message: '' })
  }, [draft.content, draft.featured, entityType, templateMap])

  const updateDraft = useCallback((key, value) => {
    setDraft((current) => ({ ...current, [key]: value }))
    setSaveState({ kind: 'idle', message: '' })
  }, [])

  const handleCoverAssetSelect = useCallback(({ assetId, asset }) => {
    setDraft((current) => ({
      ...current,
      coverImageAssetId: assetId || '',
      coverImageAsset: asset || null,
    }))
    setSaveState({ kind: 'idle', message: '' })
  }, [])

  const handleClearCoverAsset = useCallback(() => {
    setDraft((current) => ({
      ...current,
      coverImageAssetId: '',
      coverImageAsset: null,
    }))
    setSaveState({ kind: 'idle', message: '' })
  }, [])

  const updateFeatured = useCallback((checked) => {
    setDraft((current) => ({
      ...current,
      featured: checked,
      content: {
        ...(current.content || {}),
        featured: checked,
      },
    }))
    setSaveState({ kind: 'idle', message: '' })
  }, [])

  const updateTemplateField = useCallback((fieldKey, value) => {
    setDraft((current) => ({
      ...current,
      content: { ...current.content, [fieldKey]: value },
    }))
    setSaveState({ kind: 'idle', message: '' })
  }, [])

  const updateFieldError = useCallback((fieldKey, errorMessage) => {
    setFieldErrors((current) => {
      const next = { ...current }
      if (errorMessage) next[fieldKey] = errorMessage
      else delete next[fieldKey]
      return next
    })
  }, [])

  const validateDraft = useCallback((nextDraft) => {
    const errors = []

    if (!activeTemplate?.id) {
      errors.push(entityType === 'news' ? 'Velg enten Kommunikasjon eller Suksesshistorie før du lagrer.' : 'Velg en mal før du lagrer.')
    }

    if (!nextDraft.slug?.trim()) {
      errors.push('Slug er påkrevd.')
    } else if (!slugPattern.test(nextDraft.slug.trim())) {
      errors.push('Slug kan bare inneholde små bokstaver, tall og bindestreker.')
    }

    if (!nextDraft.title?.trim()) {
      errors.push(`${config.titleFieldLabel} er påkrevd.`)
    }

    if (nextDraft.status === 'published') {
      if (!nextDraft.seoTitle?.trim()) {
        errors.push('SEO-tittel er påkrevd før publisering.')
      }

      if (!nextDraft.seoDescription?.trim()) {
        errors.push('SEO-beskrivelse er påkrevd før publisering.')
      }
    }

    if (Object.values(fieldErrors).length > 0) {
      errors.push('Rett opp ugyldige felt før du lagrer.')
    }

    return errors
  }, [activeTemplate?.id, config.titleFieldLabel, entityType, fieldErrors])

  const handleSave = useCallback(async (modeOverride) => {
    const publishAt = draft.publishAt.trim()
    const nextStatus = modeOverride || draft.status
    const nextDraft = {
      ...draft,
      slug: draft.slug.trim(),
      title: draft.title.trim(),
      excerpt: draft.excerpt.trim(),
      body: draft.body,
      seoTitle: draft.seoTitle.trim(),
      seoDescription: draft.seoDescription.trim(),
      coverImage: draft.coverImage.trim(),
      coverImageAssetId: draft.coverImageAssetId.trim(),
      publishAt,
      status: nextStatus,
      templateId: draft.templateId || activeTemplate?.id || '',
      templateKey: draft.templateKey || activeTemplate?.key || '',
      content: cloneValue({
        ...(draft.content || {}),
        ...(draft.coverImageAssetId.trim() ? { coverImageAssetId: draft.coverImageAssetId.trim() } : {}),
        ...(entityType === 'news' ? { featured: draft.featured } : {}),
      }),
      tag: entityType === 'news' ? (draft.tag || '').trim() : undefined,
      readTime: entityType === 'news' ? (draft.readTime || '').trim() : undefined,
      author: entityType === 'news' ? (draft.author || '').trim() : undefined,
    }

    const validationErrors = validateDraft(nextDraft)
    if (validationErrors.length > 0) {
      setSaveState({ kind: 'error', message: validationErrors[0] })
      return
    }

    const isPublishing = nextStatus === 'published'
    if (isPublishing) setPublishing(true)
    else setSaving(true)

    setSaveState({
      kind: 'saving',
      message: isPublishing ? 'Publiserer nyheten…' : 'Lagrer kladd…',
    })

    try {
      const payload = {
        ...nextDraft,
        publishAt: nextDraft.publishAt || (isPublishing ? getNowIso() : null),
      }

      const saved = await config.save(payload)
      if (!saved) {
        throw new Error('Lagringen ble avvist av API-et.')
      }

      const normalized = normalizeEntityFromRow(entityType, saved)
      setDraft(createInitialDraft(entityType, saved.template || activeTemplate, normalized))
      setSelectedSlug(saved.slug)
      reloadItems()
      setSaveState({
        kind: 'success',
        message: isPublishing ? 'Nyheten er publisert.' : `${config.singular} lagret som kladd.`,
      })
    } catch (error) {
      setSaveState({
        kind: 'error',
        message: error instanceof Error ? error.message : `Kunne ikke lagre ${config.singular}.`,
      })
    } finally {
      setSaving(false)
      setPublishing(false)
    }
  }, [activeTemplate, config, draft, entityType, reloadItems, validateDraft])

  const handleSelect = useCallback((item) => {
    setSelectedSlug(item.slug)
    setSaveState({ kind: 'idle', message: '' })
  }, [])

  const editor = (
    <Section
      title={selectedSlug ? `Rediger ${config.singular}` : `Opprett ${config.singular}`}
      description={activeTemplate ? `Mal: ${getTemplateOptions([activeTemplate], entityType)[0]?.label || activeTemplate.name}` : 'Velg en mal for å starte.'}
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Field label="Mal" required>
          <select
            className={baseInputClass}
            value={templateValue}
            onChange={(event) => handleTemplateChange(event.target.value)}
            disabled={templatesLoading || availableTemplates.length === 0}
          >
            {getTemplateOptions(availableTemplates, entityType).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Status">
          <select
            className={baseInputClass}
            value={draft.status}
            onChange={(event) => updateDraft('status', event.target.value)}
          >
            <option value="draft">Kladd</option>
            <option value="published">Publisert</option>
          </select>
        </Field>

        <Field label="Slug" required>
          <input
            className={baseInputClass}
            value={draft.slug}
            onChange={(event) => updateDraft('slug', event.target.value.toLowerCase().replace(/\s+/g, '-'))}
            placeholder="min-nye-nyhet"
          />
        </Field>

        <Field label={config.titleFieldLabel} required>
          <input
            className={baseInputClass}
            value={draft.title}
            onChange={(event) => updateDraft('title', event.target.value)}
            placeholder="Skriv en tydelig overskrift"
          />
        </Field>

        <Field label="SEO-tittel" hint="må fylles ut ved publisering">
          <input
            className={baseInputClass}
            value={draft.seoTitle}
            onChange={(event) => updateDraft('seoTitle', event.target.value)}
          />
        </Field>

        <Field label="Forsidebilde">
          <input
            className={baseInputClass}
            value={draft.coverImage}
            onChange={(event) => updateDraft('coverImage', event.target.value)}
            placeholder="https://…"
          />
        </Field>

        <div className="lg:col-span-2">
          <AssetPicker
            title="Asset administrado para cover"
            description="Podes mantener la URL legacy y ademas asociar un asset reutilizable para el cover."
            defaultUsageType="cover-image"
            selectedAssetId={draft.coverImageAssetId}
            selectedAsset={draft.coverImageAsset}
            onSelect={handleCoverAssetSelect}
            onClear={handleClearCoverAsset}
          />
        </div>

        <div className="lg:col-span-2">
          <Field label="Ingress">
            <textarea
              className={baseTextareaClass}
              value={draft.excerpt}
              onChange={(event) => updateDraft('excerpt', event.target.value)}
              rows={3}
            />
          </Field>
        </div>

        <div className="lg:col-span-2">
          <Field label={config.bodyLabel} hint={entityType === 'news' ? 'bruk hjelperknappene under' : undefined}>
            {entityType === 'news' ? (
              <AdminNewsBodyEditor
                value={draft.body}
                onChange={(nextValue) => updateDraft('body', nextValue)}
              />
            ) : (
              <textarea
                className={`${baseTextareaClass} min-h-[220px]`}
                value={draft.body}
                onChange={(event) => updateDraft('body', event.target.value)}
                rows={10}
              />
            )}
          </Field>
        </div>

        <Field label="Publiseringsdato" hint="ISO eller tomt for automatisk dato ved publisering">
          <input
            className={baseInputClass}
            value={draft.publishAt}
            onChange={(event) => updateDraft('publishAt', event.target.value)}
            placeholder="2026-03-25T08:00:00Z"
          />
        </Field>

        <Field label="SEO-beskrivelse" hint="må fylles ut ved publisering">
          <textarea
            className={baseTextareaClass}
            value={draft.seoDescription}
            onChange={(event) => updateDraft('seoDescription', event.target.value)}
            rows={3}
          />
        </Field>

        {config.extraFields.map((field) => (
          <Field key={field.key} label={field.label}>
            <input
              className={baseInputClass}
              value={draft[field.key] ?? ''}
              onChange={(event) => updateDraft(field.key, event.target.value)}
              placeholder={field.placeholder || field.label}
            />
          </Field>
        ))}

        {entityType === 'news' ? (
          <div className="lg:col-span-2 rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={draft.featured}
                onChange={(event) => updateFeatured(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <div>
                <p className="text-sm font-semibold text-slate-950">Fremhev denne nyheten</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">
                  Lagres som et enkelt av/på-flagg i metadata/content slik at offentlig visning bruker samme sannhet.
                </p>
              </div>
            </label>
          </div>
        ) : null}
      </div>

      <div className="mt-6 rounded-[28px] border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-semibold text-slate-950">Malfelter</h4>
            <p className="text-xs text-slate-500">Verdiene her kommer fra malens struktur slått sammen med gjeldende innhold.</p>
          </div>
          {hasTemplateIssues ? <StatusBadge status="draft" /> : null}
        </div>

        {hasTemplateIssues ? (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <p className="font-semibold">Malvalidering fant avvik</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {templateIssues.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {templateFieldEntries.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">Denne malen eksponerer ingen ekstra redigerbare felt ennå.</p>
        ) : (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {templateFieldEntries.map(([fieldKey, fieldValue]) => (
              <TemplateFieldRenderer
                key={`${fieldKey}-${draft.id || 'new'}-${templateValue || 'none'}-${draft.updatedAt || 'pending'}`}
                fieldKey={fieldKey}
                label={fieldKey}
                value={Object.prototype.hasOwnProperty.call(draft.content || {}, fieldKey) ? draft.content[fieldKey] : fieldValue}
                schemaNode={resolveSchemaNode(activeTemplate?.schema ?? activeTemplate?.frontmatter_schema, fieldKey)}
                onChange={(nextValue) => updateTemplateField(fieldKey, nextValue)}
                onErrorChange={updateFieldError}
              />
            ))}
          </div>
        )}
      </div>

      {currentItem ? (
        <div className="mt-6 rounded-[24px] border border-slate-200 bg-white p-4 text-xs text-slate-500">
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <span>ID: {currentItem.id}</span>
            {currentItem.updatedAt ? <span>Sist oppdatert: {adminDateFormatter.format(new Date(currentItem.updatedAt))}</span> : null}
            {currentItem.publishedAt ? <span>Publisert: {adminDateFormatter.format(new Date(currentItem.publishedAt))}</span> : null}
          </div>
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={() => handleSave('draft')}
          disabled={statusBusy || !availableTemplates.length}
          className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Lagrer…' : 'Lagre som kladd'}
        </button>
        <button
          type="button"
          onClick={() => handleSave('published')}
          disabled={statusBusy || !availableTemplates.length}
          className="inline-flex items-center justify-center rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {publishing ? 'Publiserer…' : 'Publiser'}
        </button>
      </div>
    </Section>
  )

  const previewPane = (
    <ContentLivePreview
      entityType={entityType}
      draft={draft}
      resolvedContent={resolvedContent}
      activeTemplate={activeTemplate}
      templateIssues={templateIssues}
      currentItem={currentItem}
      previewPayload={previewPayload}
      assetDataset={draft.coverImageAsset ? [draft.coverImageAsset] : []}
    />
  )

  const contentWorkspace = structuredEditorEnabled ? (
    <AdminEntityEditorShell editor={editor} preview={previewPane} />
  ) : (
    <div className="space-y-6">
      {editor}
      <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_12px_48px_-24px_rgba(15,23,42,0.35)]">
        {previewPane}
      </div>
    </div>
  )

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
      <div className="space-y-4">
        <Section title={config.title} description={entityType === 'news' ? 'Opprett, rediger og publiser nyheter fra ett sted.' : 'Administrer sider og kladder.'}>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={startCreate}
              className="inline-flex items-center justify-center rounded-2xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
            >
              {config.createLabel}
            </button>
            <span className="text-xs text-slate-500">{items.length} totalt</span>
          </div>
          {entityType === 'news' ? (
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              Nye artikler opprettes bare med malene <strong>Kommunikasjon</strong> og <strong>Suksesshistorie</strong>.
            </p>
          ) : null}
        </Section>

        <Section title="Oversikt">
          {listLoading ? <p className="text-sm text-slate-500">Laster innhold…</p> : null}
          {listError ? <p className="text-sm text-red-600">{listError.message}</p> : null}
          {!listLoading && !listError && items.length === 0 ? (
            <p className="text-sm text-slate-500">{config.emptyLabel}</p>
          ) : null}
          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <ListItem
                key={item.id || item.slug}
                item={item}
                selected={selectedSlug === item.slug}
                templateName={templateMap[item.templateId]?.name || item.template?.name || item.templateKey}
                onSelect={() => handleSelect(item)}
              />
            ))}
          </div>
        </Section>
      </div>

      <div className="space-y-6">
        {!isSupabaseConfigured ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Supabase er ikke konfigurert. Lister og lagring er deaktivert til miljøvariablene er satt.
          </div>
        ) : null}

        {templatesError ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Kunne ikke laste maler: {templatesError.message}
          </div>
        ) : null}

        {entityType === 'news' && !templatesLoading && !templatesError && availableTemplates.length !== 2 ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Nyhetsstudio forventer to aktive maler: Kommunikasjon og Suksesshistorie. Sjekk template-oppsettet i CMS om en av dem mangler.
          </div>
        ) : null}

        {saveState.kind !== 'idle' ? (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm ${
              saveState.kind === 'error'
                ? 'border-red-200 bg-red-50 text-red-700'
                : saveState.kind === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-slate-50 text-slate-700'
            }`}
          >
            {saveState.message}
          </div>
        ) : null}

        {contentWorkspace}
      </div>
    </div>
  )
}
