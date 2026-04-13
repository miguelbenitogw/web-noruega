import { getContentLocale, getSupabaseClient, isSupabaseConfigured } from './supabaseClient.js'
import {
  cloneValue,
  isPlainObject,
  normalizeTemplateBlueprint,
  validateTemplateShape,
} from './contentMappers.js'
import { syncContentAssetUsage } from './contentAssetsService.js'

const TEMPLATES_TABLE = 'content_templates'
const PAGES_TABLE = 'content_pages'
const NEWS_TABLE = 'news_posts'

const TEMPLATE_FIELDS = [
  'id',
  'template_key',
  'name',
  'description',
  'content_type',
  'locale',
  'frontmatter_schema',
  'frontmatter_example',
  'body_template',
  'is_starter',
  'is_active',
  'sort_order',
  'created_at',
  'updated_at',
]

const PAGE_FIELDS = [
  'id',
  'template_id',
  'locale',
  'slug',
  'title',
  'excerpt',
  'body',
  'status',
  'publish_at',
  'published_at',
  'published_by',
  'seo_title',
  'seo_description',
  'cover_image',
  'metadata',
  'created_at',
  'updated_at',
]

const NEWS_FIELDS = [
  'id',
  'template_id',
  'locale',
  'slug',
  'title',
  'excerpt',
  'body',
  'tag',
  'read_time',
  'author',
  'cover_image',
  'status',
  'publish_at',
  'published_at',
  'published_by',
  'seo_title',
  'seo_description',
  'metadata',
  'created_at',
  'updated_at',
]

const normalizeStatus = (status) => (String(status || '').trim().toLowerCase() === 'published' ? 'published' : 'draft')

const normalizeContentType = (contentType) => {
  const value = String(contentType || '').trim().toLowerCase()
  if (!value) return null
  if (value === 'page' || value === 'pages' || value === 'content_page') return 'content_page'
  if (value === 'news' || value === 'news_post' || value === 'post' || value === 'article') return 'news_post'
  if (value === 'content_template') return 'content_template'
  return value
}

const buildSelect = (fields) => fields.join(', ')

const parseDateValue = (value) => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date
}

const isTruthyFeatured = (value) => {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value === 1
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    return normalized === 'true' || normalized === '1' || normalized === 'yes'
  }
  return false
}

const resolveFeaturedFlag = (row) => {
  if (!row) return false

  const metadata = isPlainObject(row.metadata) ? row.metadata : {}
  const content = isPlainObject(metadata.content) ? metadata.content : {}

  return isTruthyFeatured(row.featured) || isTruthyFeatured(metadata.featured) || isTruthyFeatured(content.featured)
}

const isPublishableNow = (row) => {
  const publishDate = parseDateValue(row?.publish_at)
  if (!publishDate) return true
  return publishDate.getTime() <= Date.now()
}

const getNewsTimestamp = (item) => {
  const candidates = [item.publishAt, item.publishedAt, item.updatedAt, item.createdAt]
  for (const candidate of candidates) {
    const date = parseDateValue(candidate)
    if (date) return date.getTime()
  }
  return 0
}

const sortNewsItems = (items) => items.slice().sort((left, right) => {
  if (left.featured !== right.featured) {
    return Number(right.featured) - Number(left.featured)
  }

  const timeDiff = getNewsTimestamp(right) - getNewsTimestamp(left)
  if (timeDiff !== 0) return timeDiff

  return String(left.slug || '').localeCompare(String(right.slug || ''))
})

const validateNewsPayload = (payload) => {
  if (normalizeStatus(payload.status) !== 'published') return

  if (!String(payload.seoTitle ?? payload.seo_title ?? '').trim()) {
    throw new Error('SEO-tittel er påkrevd for å publisere en nyhet.')
  }

  if (!String(payload.seoDescription ?? payload.seo_description ?? '').trim()) {
    throw new Error('SEO-beskrivelse er påkrevd for å publisere en nyhet.')
  }
}

const normalizeTemplate = (row) => {
  if (!row) return null

  const { schema, defaults } = normalizeTemplateBlueprint(row)

  return {
    id: row.id,
    key: row.template_key,
    templateKey: row.template_key,
    name: row.name,
    description: row.description || '',
    contentType: row.content_type,
    locale: row.locale,
    schema,
    defaults,
    bodyTemplate: row.body_template || '',
    isStarter: Boolean(row.is_starter),
    isActive: row.is_active !== false,
    sortOrder: Number.isFinite(Number(row.sort_order)) ? Number(row.sort_order) : 0,
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null,
    validation: validateTemplateShape(row),
  }
}

const normalizeMetadataContent = (metadata) => {
  if (!isPlainObject(metadata)) return {}
  const content = metadata.content
  return isPlainObject(content) || Array.isArray(content) ? cloneValue(content) : {}
}

const logContentAssetUsageSync = (level, message, context = {}) => {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
  }

  const logger = level === 'error' ? console.error : console.warn
  logger(JSON.stringify(entry))
}

const CONTENT_ASSET_FIELD_PATHS = ['coverImageAssetId', 'heroImageAssetId']

const getContentLevelAssetId = (value, fieldPath = 'coverImageAssetId') => {
  if (!isPlainObject(value) || Array.isArray(value)) return ''

  const assetId = value[fieldPath]
  return typeof assetId === 'string' ? assetId.trim() : ''
}

const resolvePayloadAssetId = (payload = {}, fieldPath = 'coverImageAssetId') => {
  const topLevel = typeof payload[fieldPath] === 'string' ? payload[fieldPath].trim() : ''
  if (topLevel) return topLevel

  const contentAssetId = getContentLevelAssetId(payload.content, fieldPath)
  if (contentAssetId) return contentAssetId

  const metadata = isPlainObject(payload.metadata) ? payload.metadata : {}
  return getContentLevelAssetId(normalizeMetadataContent(metadata), fieldPath)
}

const normalizeAssetAssociations = (payload = {}) => {
  const associationMap = new Map()

  for (const fieldPath of CONTENT_ASSET_FIELD_PATHS) {
    associationMap.set(fieldPath, resolvePayloadAssetId(payload, fieldPath) || null)
  }

  const providedAssociations = Array.isArray(payload.assetAssociations) ? payload.assetAssociations : []

  for (const association of providedAssociations) {
    if (!isPlainObject(association)) continue

    const fieldPath = typeof association.fieldPath === 'string' ? association.fieldPath.trim() : ''
    if (!fieldPath) continue

    const assetId = typeof association.assetId === 'string'
      ? association.assetId.trim() || null
      : association.assetId == null
        ? null
        : String(association.assetId).trim() || null

    associationMap.set(fieldPath, assetId)
  }

  if (associationMap.size === 0) {
    const assetId = resolvePayloadAssetId(payload, 'coverImageAssetId') || null
    if (assetId !== null) {
      associationMap.set('coverImageAssetId', assetId)
    }
  }

  return Array.from(associationMap.entries()).map(([fieldPath, assetId]) => ({ fieldPath, assetId }))
}

const normalizePage = (row) => {
  if (!row) return null

  const metadata = isPlainObject(row.metadata) ? cloneValue(row.metadata) : {}
  const content = normalizeMetadataContent(metadata)

  return {
    id: row.id,
    templateId: row.template_id || null,
    locale: row.locale,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt || '',
    body: row.body || '',
    status: normalizeStatus(row.status),
    publishAt: row.publish_at || null,
    publishedAt: row.published_at || null,
    publishedBy: row.published_by || null,
    seoTitle: row.seo_title || '',
    seoDescription: row.seo_description || '',
    coverImage: row.cover_image || '',
    coverImageAssetId: getContentLevelAssetId(content),
    heroImageAssetId: getContentLevelAssetId(content, 'heroImageAssetId'),
    metadata,
    content,
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null,
  }
}

const normalizeNews = (row) => {
  if (!row) return null

  const metadata = isPlainObject(row.metadata) ? cloneValue(row.metadata) : {}
  const content = normalizeMetadataContent(metadata)

  return {
    id: row.id,
    templateId: row.template_id || null,
    locale: row.locale,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt || '',
    body: row.body || '',
    tag: row.tag || 'Nyhet',
    readTime: row.read_time || '3 min',
    author: row.author || 'Global Working',
    coverImage: row.cover_image || '',
    status: normalizeStatus(row.status),
    publishAt: row.publish_at || null,
    publishedAt: row.published_at || null,
    publishedBy: row.published_by || null,
    seoTitle: row.seo_title || '',
    seoDescription: row.seo_description || '',
    coverImageAssetId: getContentLevelAssetId(content),
    heroImageAssetId: getContentLevelAssetId(content, 'heroImageAssetId'),
    metadata,
    content,
    featured: resolveFeaturedFlag(row),
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null,
  }
}

const hydrateTemplateById = async (client, templateId) => {
  if (!client || !templateId) return null

  const { data, error } = await client
    .from(TEMPLATES_TABLE)
    .select(buildSelect(TEMPLATE_FIELDS))
    .eq('id', templateId)
    .maybeSingle()

  if (error || !data) return null
  return normalizeTemplate(data)
}

const resolveTemplateId = async (payload) => {
  if (payload.templateId || payload.template_id) return payload.templateId || payload.template_id
  if (!payload.templateKey && !payload.template_key) return null

  const template = await getTemplateByKey(payload.templateKey || payload.template_key)
  return template?.id || null
}

const prepareMetadata = (payload) => {
  const metadata = isPlainObject(payload.metadata) ? cloneValue(payload.metadata) : {}
  const metadataContent = isPlainObject(metadata.content) ? cloneValue(metadata.content) : {}
  const providedContent = payload.content !== undefined ? cloneValue(payload.content) : metadataContent
  const content = isPlainObject(providedContent) ? providedContent : metadataContent
  const assetAssociations = normalizeAssetAssociations(payload)

  if (content !== undefined) {
    metadata.content = content
  }

  if (assetAssociations.length > 0) {
    metadata.content = {
      ...(isPlainObject(metadata.content) ? metadata.content : {}),
      ...Object.fromEntries(assetAssociations.map(({ fieldPath, assetId }) => [fieldPath, assetId])),
    }
  }

  if (payload.featured !== undefined) {
    const featured = Boolean(payload.featured)
    metadata.featured = featured
    metadata.content = {
      ...(isPlainObject(metadata.content) ? metadata.content : {}),
      featured,
    }
  }

  return metadata
}

const syncCoverImageUsage = async (entityType, row, payload) => {
  if (!row?.id) return

  const associations = normalizeAssetAssociations(payload)
  const resolvedLocale = row.locale || getContentLocale(payload.locale)

  if (associations.length === 0) {
    try {
      await syncContentAssetUsage({
        assetId: null,
        entityType,
        entityId: String(row.id),
        fieldPath: 'coverImageAssetId',
        locale: resolvedLocale,
        notes: `${entityType}:coverImageAssetId`,
      })
    } catch (error) {
      logContentAssetUsageSync('error', 'content_asset_usages sync failed after save', {
        entityType,
        entityId: String(row.id),
        fieldPath: 'coverImageAssetId',
        locale: resolvedLocale,
        assetId: null,
        message: error instanceof Error ? error.message : String(error),
      })
    }

    return
  }

  for (const association of associations) {
    try {
      await syncContentAssetUsage({
        assetId: association.assetId || null,
        entityType,
        entityId: String(row.id),
        fieldPath: association.fieldPath,
        locale: resolvedLocale,
        notes: `${entityType}:${association.fieldPath}`,
      })
    } catch (error) {
      logContentAssetUsageSync('error', 'content_asset_usages sync failed after save', {
        entityType,
        entityId: String(row.id),
        fieldPath: association.fieldPath,
        locale: resolvedLocale,
        assetId: association.assetId || null,
        message: error instanceof Error ? error.message : String(error),
      })
    }
  }
}

const prepareUpsertPayload = async (client, payload, entityType) => {
  const locale = getContentLocale(payload.locale)
  const status = normalizeStatus(payload.status)
  const templateId = await resolveTemplateId(payload)
  const coverImageAssetId = resolvePayloadAssetId(payload, 'coverImageAssetId')
  const common = {
    template_id: templateId,
    locale,
    slug: String(payload.slug || '').trim(),
    title: String(payload.title || '').trim(),
    excerpt: String(payload.excerpt || ''),
    body: String(payload.body || ''),
    status,
    publish_at: payload.publishAt ?? payload.publish_at ?? (status === 'published' ? new Date().toISOString() : null),
    seo_title: payload.seoTitle ?? payload.seo_title ?? null,
    seo_description: payload.seoDescription ?? payload.seo_description ?? null,
    cover_image: coverImageAssetId
      ? ''
      : (payload.coverImage ?? payload.cover_image ?? null),
    metadata: prepareMetadata(payload),
  }

  if (entityType === 'page') {
    return common
  }

  return {
    ...common,
    tag: String(payload.tag || 'Nyhet').trim() || 'Nyhet',
    read_time: String(payload.readTime || payload.read_time || '3 min').trim() || '3 min',
    author: String(payload.author || 'Global Working').trim() || 'Global Working',
  }
}

const queryBySlug = async (table, fields, slug, locale) => {
  const client = getSupabaseClient()
  if (!client) return null

  const resolvedLocale = getContentLocale(locale)
  const { data, error } = await client
    .from(table)
    .select(buildSelect(fields))
    .eq('locale', resolvedLocale)
    .eq('slug', slug)
    .maybeSingle()

  if (error || !data) return null
  return data
}

const queryList = async (table, fields, locale) => {
  const client = getSupabaseClient()
  if (!client) return []

  const resolvedLocale = getContentLocale(locale)
  const { data, error } = await client
    .from(table)
    .select(buildSelect(fields))
    .eq('locale', resolvedLocale)
    .order('updated_at', { ascending: false })

  if (error || !data) return []
  return data
}

const queryPublishedBySlug = async (table, fields, slug, locale) => {
  const client = getSupabaseClient()
  if (!client || !slug) return null

  const resolvedLocale = getContentLocale(locale)
  const { data, error } = await client
    .from(table)
    .select(buildSelect(fields))
    .eq('locale', resolvedLocale)
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (error || !data) return null
  return data
}

const queryPublishedList = async (table, fields, locale) => {
  const client = getSupabaseClient()
  if (!client) return []

  const resolvedLocale = getContentLocale(locale)
  const { data, error } = await client
    .from(table)
    .select(buildSelect(fields))
    .eq('locale', resolvedLocale)
    .eq('status', 'published')
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('updated_at', { ascending: false })

  if (error || !data) return []
  return data
}

export const __newsMvpTestables = {
  normalizeStatus,
  resolveFeaturedFlag,
  sortNewsItems,
  validateNewsPayload,
  prepareMetadata,
  prepareUpsertPayload,
}

export { isSupabaseConfigured }

export async function listTemplates(contentType) {
  const client = getSupabaseClient()
  if (!client) return []

  const resolvedContentType = normalizeContentType(contentType)
  let query = client
    .from(TEMPLATES_TABLE)
    .select(buildSelect(TEMPLATE_FIELDS))
    .eq('locale', getContentLocale())
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('template_key', { ascending: true })

  if (resolvedContentType && resolvedContentType !== 'content_template') {
    query = query.eq('content_type', resolvedContentType)
  }

  const { data, error } = await query
  if (error) {
    throw new Error(`No se pudieron cargar templates: ${error.message}`)
  }
  if (!data) return []

  return data.map(normalizeTemplate).filter(Boolean)
}

export async function getTemplateByKey(key) {
  const client = getSupabaseClient()
  if (!client || !key) return null

  const { data, error } = await client
    .from(TEMPLATES_TABLE)
    .select(buildSelect(TEMPLATE_FIELDS))
    .eq('locale', getContentLocale())
    .eq('template_key', String(key).trim())
    .maybeSingle()

  if (error || !data) return null
  return normalizeTemplate(data)
}

export async function listPages() {
  const rows = await queryList(PAGES_TABLE, PAGE_FIELDS)
  return rows.map(normalizePage).filter(Boolean)
}

export async function getPageBySlug(slug) {
  if (!slug) return null

  const client = getSupabaseClient()
  if (!client) return null

  const data = await queryBySlug(PAGES_TABLE, PAGE_FIELDS, slug, getContentLocale())
  if (!data) return null

  const page = normalizePage(data)
  if (page.templateId) {
    page.template = await hydrateTemplateById(client, page.templateId)
  }
  return page
}

export async function upsertPage(payload = {}) {
  const client = getSupabaseClient()
  if (!client) return null

  const body = await prepareUpsertPayload(client, payload, 'page')
  const query = payload.id
    ? client.from(PAGES_TABLE).update(body).eq('id', payload.id)
    : client.from(PAGES_TABLE).upsert(body, { onConflict: 'locale,slug' })

  const { data, error } = await query.select(buildSelect(PAGE_FIELDS)).maybeSingle()

  if (error || !data) return null

  const page = normalizePage(data)
  if (page.templateId) {
    page.template = await hydrateTemplateById(client, page.templateId)
  }
  await syncCoverImageUsage('page', page, payload)
  return page
}

export async function listNews() {
  const rows = await queryList(NEWS_TABLE, NEWS_FIELDS)
  return rows.map(normalizeNews).filter(Boolean)
}

export async function getNewsBySlug(slug) {
  if (!slug) return null

  const client = getSupabaseClient()
  if (!client) return null

  const data = await queryBySlug(NEWS_TABLE, NEWS_FIELDS, slug, getContentLocale())
  if (!data) return null

  const news = normalizeNews(data)
  if (news.templateId) {
    news.template = await hydrateTemplateById(client, news.templateId)
  }
  return news
}

export async function upsertNews(payload = {}) {
  const client = getSupabaseClient()
  if (!client) return null

  validateNewsPayload(payload)
  const body = await prepareUpsertPayload(client, payload, 'news')
  const query = payload.id
    ? client.from(NEWS_TABLE).update(body).eq('id', payload.id)
    : client.from(NEWS_TABLE).upsert(body, { onConflict: 'locale,slug' })

  const { data, error } = await query.select(buildSelect(NEWS_FIELDS)).maybeSingle()

  if (error || !data) return null

  const news = normalizeNews(data)
  if (news.templateId) {
    news.template = await hydrateTemplateById(client, news.templateId)
  }
  await syncCoverImageUsage('news', news, payload)
  return news
}

export async function listPublishedPages(locale) {
  const rows = await queryPublishedList(PAGES_TABLE, PAGE_FIELDS, locale)
  return rows.filter(isPublishableNow).map(normalizePage).filter(Boolean)
}

export async function getPublishedPageBySlug(slug, locale) {
  if (!slug) return null

  const data = await queryPublishedBySlug(PAGES_TABLE, PAGE_FIELDS, slug, locale)
  if (!data) return null

  if (!isPublishableNow(data)) return null
  return normalizePage(data)
}

export async function listPublishedNews(locale) {
  const rows = await queryPublishedList(NEWS_TABLE, NEWS_FIELDS, locale)
  return sortNewsItems(rows.filter(isPublishableNow).map(normalizeNews).filter(Boolean))
}

export async function getPublishedNewsBySlug(slug, locale) {
  if (!slug) return null

  const data = await queryPublishedBySlug(NEWS_TABLE, NEWS_FIELDS, slug, locale)
  if (!data) return null

  if (!isPublishableNow(data)) return null
  return normalizeNews(data)
}
