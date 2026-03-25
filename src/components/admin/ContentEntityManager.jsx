import { useCallback, useEffect, useMemo, useState } from 'react'
import AdminEntityEditorShell from './AdminEntityEditorShell'
import ContentLivePreview from './ContentLivePreview'
import TemplateFieldRenderer from './TemplateFieldRenderer'
import useTemplates from '../../hooks/useTemplates'
import useTemplateContent from '../../hooks/useTemplateContent'
import { cloneValue, deepMergeContent } from '../../lib/contentMappers'
import { isStructuredAdminEditorEnabled } from './fields/helpers'
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

const baseInputClass = 'w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
const baseTextareaClass = `${baseInputClass} min-h-[110px] resize-y`
const adminDateFormatter = new Intl.DateTimeFormat('no-NO', { dateStyle: 'medium', timeStyle: 'short' })

const entityConfig = {
  page: {
    title: 'Sider',
    createLabel: 'Ny side',
    emptyLabel: 'Ingen sider ennå.',
    singular: 'page',
    titleFieldLabel: 'Tittel',
    loadList: listPages,
    loadBySlug: getPageBySlug,
    save: upsertPage,
    templateType: 'page',
    extraFields: [],
  },
  news: {
    title: 'Nyheter',
    createLabel: 'Ny nyhet',
    emptyLabel: 'Ingen nyheter ennå.',
    singular: 'news item',
    titleFieldLabel: 'Overskrift',
    loadList: listNews,
    loadBySlug: getNewsBySlug,
    save: upsertNews,
    templateType: 'news',
    extraFields: [
      { key: 'tag', label: 'Tag', placeholder: 'Plattform' },
      { key: 'readTime', label: 'Lesetid', placeholder: '3 min' },
      { key: 'author', label: 'Forfatter', placeholder: 'Global Working' },
    ],
  },
}

const getNowIso = () => new Date().toISOString()

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

const createInitialDraft = (entityType, template, existing = {}) => {
  const defaults = template?.defaults ?? template?.frontmatter_example ?? {}
  const resolvedContent = deepMergeContent(defaults, existing.content ?? {})

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
    templateId: template?.id ?? existing.templateId ?? '',
    templateKey: template?.key ?? existing.templateKey ?? '',
    content: cloneValue(resolvedContent),
    tag: entityType === 'news' ? existing.tag ?? 'Plattform' : undefined,
    readTime: entityType === 'news' ? existing.readTime ?? '3 min' : undefined,
    author: entityType === 'news' ? existing.author ?? 'Global Working' : undefined,
    updatedAt: existing.updatedAt ?? null,
    publishedAt: existing.publishedAt ?? null,
  }
}

const normalizeEntityFromRow = (entityType, row) => {
  if (!row) return null

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
    templateId: row.templateId ?? row.template?.id ?? '',
    templateKey: row.template?.key ?? '',
    template: row.template ?? null,
    content: row.content ?? {},
    tag: entityType === 'news' ? row.tag ?? 'Plattform' : undefined,
    readTime: entityType === 'news' ? row.readTime ?? '3 min' : undefined,
    author: entityType === 'news' ? row.author ?? 'Global Working' : undefined,
    updatedAt: row.updatedAt ?? null,
    publishedAt: row.publishedAt ?? null,
  }
}

const getTemplateOptions = (templates) => templates.map((template) => ({
  value: template.id,
  label: `${template.name} (${template.key})`,
}))

function Field({ label, children, hint, required = false }) {
  return (
    <label className="block space-y-2">
      <span className="block text-xs font-semibold uppercase tracking-wide text-gray-600">
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
        {hint ? <span className="ml-1 font-normal text-gray-400">({hint})</span> : null}
      </span>
      {children}
    </label>
  )
}

function Section({ title, children, description }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="border-b border-gray-100 bg-gray-50 px-5 py-4">
        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-base font-bold text-ink">{title}</h3>
          {description ? <p className="text-xs text-gray-500">{description}</p> : null}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </section>
  )
}

function StatusBadge({ status }) {
  const tone = status === 'published'
    ? 'border-green-200 bg-green-50 text-green-700'
    : 'border-amber-200 bg-amber-50 text-amber-700'

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${tone}`}>
      {status}
    </span>
  )
}

function ListItem({ item, selected, templateName, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-2xl border px-4 py-3 text-left transition-colors ${
        selected ? 'border-primary-200 bg-primary-50' : 'border-gray-200 bg-white hover:bg-gray-50'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">{item.title || item.slug}</p>
          <p className="mt-0.5 truncate text-[11px] font-mono text-gray-400">{item.slug}</p>
        </div>
        <StatusBadge status={item.status} />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
        <span>{templateName || 'No template'}</span>
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
  const [formLoading, setFormLoading] = useState(false)
  const [refreshTick, setRefreshTick] = useState(0)
  const [selectedSlug, setSelectedSlug] = useState('')
  const [draft, setDraft] = useState(() => createInitialDraft(entityType, null))
  const [saveState, setSaveState] = useState({ kind: 'idle', message: '' })
  const [fieldErrors, setFieldErrors] = useState({})

  const templateMap = useMemo(() => Object.fromEntries(templates.map((template) => [template.id, template])), [templates])
  const activeTemplate = useMemo(() => templateMap[draft.templateId] || templates[0] || null, [draft.templateId, templateMap, templates])
  const templateValue = draft.templateId || activeTemplate?.id || ''

  const { resolvedContent, issues: templateIssues } = useTemplateContent({
    template: activeTemplate,
    content: draft.content,
  })

  const templateFieldEntries = useMemo(() => Object.entries(resolvedContent || {}), [resolvedContent])
  const currentItem = useMemo(() => items.find((item) => item.slug === selectedSlug) || null, [items, selectedSlug])
  const hasTemplateIssues = templateIssues.length > 0
  const structuredEditorEnabled = isStructuredAdminEditorEnabled()
  const statusBusy = saving || formLoading || templatesLoading || listLoading

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
    templateId: draft.templateId || activeTemplate?.id || '',
    templateKey: draft.templateKey || activeTemplate?.key || '',
    content: resolvedContent,
    ...(entityType === 'news'
      ? {
          tag: draft.tag,
          readTime: draft.readTime,
          author: draft.author,
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
        if (!cancelled) setItems(rows)
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
  }, [config, refreshTick])

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
          setDraft(createInitialDraft(entityType, row.template || templateMap[row.templateId] || null, normalizeEntityFromRow(entityType, row)))
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
    if (selectedSlug || !draft.templateId || !activeTemplate) return
    setDraft((current) => ({
      ...current,
      templateId: activeTemplate.id,
      templateKey: activeTemplate.key,
    }))
  }, [activeTemplate, draft.templateId, selectedSlug])

  const handleTemplateChange = useCallback((templateId) => {
    const nextTemplate = templateMap[templateId] || null
    setDraft((current) => ({
      ...current,
      templateId,
      templateKey: nextTemplate?.key || '',
      content: nextTemplate ? deepMergeContent(nextTemplate.defaults ?? nextTemplate.frontmatter_example ?? {}, current.content || {}) : {},
    }))
    setFieldErrors({})
    setSaveState({ kind: 'idle', message: '' })
  }, [templateMap])

  const updateDraft = useCallback((key, value) => {
    setDraft((current) => ({ ...current, [key]: value }))
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
      errors.push('Velg en template før du lagrer.')
    }

    if (!nextDraft.slug?.trim()) {
      errors.push('Slug er påkrevd.')
    } else if (!slugPattern.test(nextDraft.slug.trim())) {
      errors.push('Slug kan bare inneholde små bokstaver, tall og bindestreker.')
    }

    if (!nextDraft.title?.trim()) {
      errors.push(`${config.titleFieldLabel} er påkrevd.`)
    }

    if (Object.values(fieldErrors).length > 0) {
      errors.push('Fiks ugyldige JSON-felt før lagring.')
    }

    return errors
  }, [activeTemplate?.id, config.titleFieldLabel, fieldErrors])

  const handleSave = useCallback(async () => {
    const publishAt = draft.publishAt.trim()
    const nextDraft = {
      ...draft,
      slug: draft.slug.trim(),
      title: draft.title.trim(),
      excerpt: draft.excerpt.trim(),
      body: draft.body,
      seoTitle: draft.seoTitle.trim(),
      seoDescription: draft.seoDescription.trim(),
      coverImage: draft.coverImage.trim(),
      publishAt,
      templateId: draft.templateId || activeTemplate?.id || '',
      templateKey: draft.templateKey || activeTemplate?.key || '',
      content: cloneValue(draft.content || {}),
      tag: entityType === 'news' ? (draft.tag || '').trim() : undefined,
      readTime: entityType === 'news' ? (draft.readTime || '').trim() : undefined,
      author: entityType === 'news' ? (draft.author || '').trim() : undefined,
    }

    const validationErrors = validateDraft(nextDraft)
    if (validationErrors.length > 0) {
      setSaveState({ kind: 'error', message: validationErrors[0] })
      return
    }

    setSaving(true)
    setSaveState({ kind: 'saving', message: 'Lagrer...' })

    try {
      const payload = {
        ...nextDraft,
        status: nextDraft.status,
        publishAt: nextDraft.publishAt || (nextDraft.status === 'published' ? getNowIso() : null),
        templateId: nextDraft.templateId || activeTemplate?.id || '',
        templateKey: nextDraft.templateKey || activeTemplate?.key || '',
      }

      const saved = await config.save(payload)
      if (!saved) {
        throw new Error('Supabase avviste lagringen.')
      }

      setDraft(createInitialDraft(entityType, saved.template || activeTemplate, normalizeEntityFromRow(entityType, saved)))
      setSelectedSlug(saved.slug)
      reloadItems()
      setSaveState({ kind: 'success', message: `${config.singular} lagret.` })
    } catch (error) {
      setSaveState({
        kind: 'error',
        message: error instanceof Error ? error.message : `Kunne ikke lagre ${config.singular}.`,
      })
    } finally {
      setSaving(false)
    }
  }, [activeTemplate, config, draft, entityType, reloadItems, validateDraft])

  const handleSelect = useCallback((item) => {
    setSelectedSlug(item.slug)
    setSaveState({ kind: 'idle', message: '' })
  }, [])

  const editor = (
    <Section
      title={selectedSlug ? `Rediger ${config.singular}` : `Opprett ${config.singular}`}
      description={activeTemplate ? `Template: ${activeTemplate.name}` : 'Velg en template for å starte.'}
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Field label="Template" required>
          <select
            className={baseInputClass}
            value={templateValue}
            onChange={(event) => handleTemplateChange(event.target.value)}
            disabled={templatesLoading || templates.length === 0}
          >
            {getTemplateOptions(templates).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Status" required>
          <select
            className={baseInputClass}
            value={draft.status}
            onChange={(event) => updateDraft('status', event.target.value)}
          >
            <option value="draft">draft</option>
            <option value="published">published</option>
          </select>
        </Field>

        <Field label="Slug" required>
          <input
            className={baseInputClass}
            value={draft.slug}
            onChange={(event) => updateDraft('slug', event.target.value.toLowerCase().replace(/\s+/g, '-'))}
            placeholder="my-page-or-news-item"
          />
        </Field>

        <Field label={config.titleFieldLabel} required>
          <input
            className={baseInputClass}
            value={draft.title}
            onChange={(event) => updateDraft('title', event.target.value)}
            placeholder={config.titleFieldLabel}
          />
        </Field>

        <Field label="SEO title">
          <input
            className={baseInputClass}
            value={draft.seoTitle}
            onChange={(event) => updateDraft('seoTitle', event.target.value)}
          />
        </Field>

        <Field label="Cover image">
          <input
            className={baseInputClass}
            value={draft.coverImage}
            onChange={(event) => updateDraft('coverImage', event.target.value)}
            placeholder="https://..."
          />
        </Field>

        <div className="lg:col-span-2">
          <Field label="Excerpt">
            <textarea
              className={baseTextareaClass}
              value={draft.excerpt}
              onChange={(event) => updateDraft('excerpt', event.target.value)}
              rows={3}
            />
          </Field>
        </div>

        <div className="lg:col-span-2">
          <Field label="Body">
            <textarea
              className={`${baseTextareaClass} min-h-[180px] font-sans text-sm`}
              value={draft.body}
              onChange={(event) => updateDraft('body', event.target.value)}
              rows={8}
            />
          </Field>
        </div>

        <Field label="Publish at" hint="ISO string">
          <input
            className={baseInputClass}
            value={draft.publishAt}
            onChange={(event) => updateDraft('publishAt', event.target.value)}
            placeholder="2026-03-16T08:00:00Z"
          />
        </Field>

        <Field label="SEO description">
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
      </div>

      <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-semibold text-ink">Template fields</h4>
            <p className="text-xs text-gray-500">Verdiene kommer fra defaults slått sammen med gjeldende content.</p>
          </div>
          {hasTemplateIssues ? <StatusBadge status="draft" /> : null}
        </div>

        {hasTemplateIssues ? (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <p className="font-semibold">Template-valideringsfeil</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {templateIssues.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {templateFieldEntries.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">Denne templaten eksponerer ikke redigerbare content-felt ennå.</p>
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
        <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-4 text-xs text-gray-500">
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <span>ID: {currentItem.id}</span>
            {currentItem.updatedAt ? <span>Updated: {adminDateFormatter.format(new Date(currentItem.updatedAt))}</span> : null}
            {currentItem.publishedAt ? <span>Published: {adminDateFormatter.format(new Date(currentItem.publishedAt))}</span> : null}
          </div>
        </div>
      ) : null}

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={statusBusy || !templates.length}
          className="inline-flex items-center justify-center rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save'}
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
    />
  )

  const contentWorkspace = structuredEditorEnabled ? (
    <AdminEntityEditorShell editor={editor} preview={previewPane} />
  ) : (
    <div className="space-y-6">
      {editor}
      <div className="rounded-[28px] border border-gray-200 bg-white p-4 shadow-[0_12px_48px_-24px_rgba(15,23,42,0.35)]">
        {previewPane}
      </div>
    </div>
  )

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
      <div className="space-y-4">
        <Section title={config.title} description={`Create, edit and publish ${config.singular}s.`}>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={startCreate}
              className="inline-flex items-center justify-center rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700"
            >
              {config.createLabel}
            </button>
            <span className="text-xs text-gray-500">{items.length} total</span>
          </div>
        </Section>

        <Section title="Entries">
          {listLoading ? <p className="text-sm text-gray-500">Loading...</p> : null}
          {listError ? <p className="text-sm text-red-600">{listError.message}</p> : null}
          {!listLoading && !listError && items.length === 0 ? (
            <p className="text-sm text-gray-500">{config.emptyLabel}</p>
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
            Supabase er ikke konfigurert. Listing og lagring er deaktivert til miljøvariablene er satt.
          </div>
        ) : null}

        {templatesError ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Kunne ikke laste templates: {templatesError.message}
          </div>
        ) : null}

        {saveState.kind !== 'idle' ? (
          <div className={`rounded-2xl border px-4 py-3 text-sm ${
            saveState.kind === 'error'
              ? 'border-red-200 bg-red-50 text-red-700'
              : saveState.kind === 'success'
                ? 'border-green-200 bg-green-50 text-green-700'
                : 'border-gray-200 bg-gray-50 text-gray-700'
          }`}>
            {saveState.message}
          </div>
        ) : null}

        {contentWorkspace}
      </div>
    </div>
  )
}
