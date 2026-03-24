import { getContentLocale, getSupabaseClient, isSupabaseConfigured } from './supabaseClient'
import {
  cloneValue,
  isPlainObject,
  normalizeTemplateBlueprint,
  validateTemplateShape,
} from './contentMappers'

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

const normalizePage = (row) => {
  if (!row) return null

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
    metadata: isPlainObject(row.metadata) ? cloneValue(row.metadata) : {},
    content: normalizeMetadataContent(row.metadata),
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null,
  }
}

const normalizeNews = (row) => {
  if (!row) return null

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
    metadata: isPlainObject(row.metadata) ? cloneValue(row.metadata) : {},
    content: normalizeMetadataContent(row.metadata),
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
  const content = payload.content !== undefined ? cloneValue(payload.content) : metadata.content

  if (content !== undefined) {
    metadata.content = content
  }

  return metadata
}

const prepareUpsertPayload = async (client, payload, entityType) => {
  const locale = getContentLocale(payload.locale)
  const status = normalizeStatus(payload.status)
  const templateId = await resolveTemplateId(payload)
  const common = {
    template_id: templateId,
    locale,
    slug: String(payload.slug || '').trim(),
    title: String(payload.title || '').trim(),
    excerpt: String(payload.excerpt || ''),
    body: String(payload.body || ''),
    status,
    publish_at: payload.publishAt ?? payload.publish_at ?? null,
    seo_title: payload.seoTitle ?? payload.seo_title ?? null,
    seo_description: payload.seoDescription ?? payload.seo_description ?? null,
    cover_image: payload.coverImage ?? payload.cover_image ?? null,
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
  return news
}

export async function listPublishedPages(locale) {
  const rows = await queryPublishedList(PAGES_TABLE, PAGE_FIELDS, locale)
  return rows.map(normalizePage).filter(Boolean)
}

export async function getPublishedPageBySlug(slug, locale) {
  if (!slug) return null

  const data = await queryPublishedBySlug(PAGES_TABLE, PAGE_FIELDS, slug, locale)
  if (!data) return null

  return normalizePage(data)
}

export async function listPublishedNews(locale) {
  const rows = await queryPublishedList(NEWS_TABLE, NEWS_FIELDS, locale)
  return rows.map(normalizeNews).filter(Boolean)
}

export async function getPublishedNewsBySlug(slug, locale) {
  if (!slug) return null

  const data = await queryPublishedBySlug(NEWS_TABLE, NEWS_FIELDS, slug, locale)
  if (!data) return null

  return normalizeNews(data)
}
