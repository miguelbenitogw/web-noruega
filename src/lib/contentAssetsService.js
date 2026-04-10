import { getSupabaseClient } from './supabaseClient.js'

const CONTENT_ASSETS_TABLE = 'content_assets'
const CONTENT_MEDIA_BUCKET = 'content-media'
const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 20
const MAX_PAGE_SIZE = 100

export const CONTENT_ASSET_MAX_SIZE_BYTES = 8 * 1024 * 1024
export const CONTENT_ASSET_ALLOWED_MIME_TYPES = Object.freeze(['image/jpeg', 'image/png', 'image/webp'])

const CONTENT_ASSET_SELECT = [
  'id',
  'bucket',
  'storage_path',
  'public_url',
  'mime_type',
  'size_bytes',
  'width',
  'height',
  'alt',
  'caption',
  'usage_type',
  'status',
  'created_by',
  'created_at',
  'updated_at',
].join(', ')

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const MIME_EXTENSION_MAP = Object.freeze({
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
})

let clientResolver = () => getSupabaseClient()

const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key)

const collapseWhitespace = (value) => String(value ?? '').replace(/\s+/g, ' ').trim()

const nullIfBlank = (value) => {
  const normalized = collapseWhitespace(value)
  return normalized ? normalized : null
}

const createFallbackId = () => `asset-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`

const createUuid = () => globalThis.crypto?.randomUUID?.() || createFallbackId()

const sanitizeFileStem = (filename) => {
  const rawStem = String(filename || '').replace(/\.[^.]+$/, '')
  const normalizedStem = rawStem.normalize?.('NFKD') || rawStem

  const sanitized = normalizedStem
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return sanitized || 'asset'
}

const normalizeUsageValue = (value, { label = 'usage' } = {}) => {
  const collapsed = collapseWhitespace(value)
  if (!collapsed) return null

  const normalized = collapsed
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  if (!normalized) {
    throw new Error(`El campo ${label} no tiene un formato válido.`)
  }

  if (normalized.length > 80) {
    throw new Error(`El campo ${label} no puede superar los 80 caracteres.`)
  }

  return normalized
}

const normalizeDimension = (value, { label } = {}) => {
  if (value == null || value === '') return null

  const numericValue = Number(value)
  if (!Number.isInteger(numericValue) || numericValue <= 0) {
    throw new Error(`El campo ${label} debe ser un entero positivo.`)
  }

  return numericValue
}

const normalizeStatus = (value, { allowArchived = true } = {}) => {
  if (value == null || value === '') return null

  const normalized = collapseWhitespace(value).toLowerCase()
  const allowedStatuses = allowArchived ? ['active', 'inactive', 'archived'] : ['active', 'inactive']

  if (!allowedStatuses.includes(normalized)) {
    throw new Error(`Estado inválido. Valores permitidos: ${allowedStatuses.join(', ')}.`)
  }

  return normalized
}

const normalizeSearchToken = (value) => collapseWhitespace(value).slice(0, 100).replace(/[(),]/g, ' ')

const normalizePagination = (page, pageSize) => {
  const resolvedPage = Number.parseInt(page ?? DEFAULT_PAGE, 10)
  const resolvedPageSize = Number.parseInt(pageSize ?? DEFAULT_PAGE_SIZE, 10)

  if (!Number.isInteger(resolvedPage) || resolvedPage <= 0) {
    throw new Error('La página debe ser un entero positivo.')
  }

  if (!Number.isInteger(resolvedPageSize) || resolvedPageSize <= 0 || resolvedPageSize > MAX_PAGE_SIZE) {
    throw new Error(`pageSize debe estar entre 1 y ${MAX_PAGE_SIZE}.`)
  }

  return { page: resolvedPage, pageSize: resolvedPageSize }
}

const validateAssetId = (id) => {
  const normalized = collapseWhitespace(id)
  if (!normalized) {
    throw new Error('El id del asset es obligatorio.')
  }

  if (!UUID_PATTERN.test(normalized)) {
    throw new Error('El id del asset debe ser un UUID válido.')
  }

  return normalized
}

const validateUploadFile = (file) => {
  if (!file || typeof file !== 'object') {
    throw new Error('Tenés que enviar un archivo válido para subir.')
  }

  const filename = collapseWhitespace(file.name)
  if (!filename) {
    throw new Error('El archivo debe incluir un nombre.')
  }

  const mimeType = collapseWhitespace(file.type).toLowerCase()
  if (!CONTENT_ASSET_ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new Error(`Tipo de archivo no soportado. Permitidos: ${CONTENT_ASSET_ALLOWED_MIME_TYPES.join(', ')}.`)
  }

  const sizeBytes = Number(file.size)
  if (!Number.isFinite(sizeBytes) || sizeBytes < 0) {
    throw new Error('No se pudo determinar el tamaño del archivo.')
  }

  if (sizeBytes > CONTENT_ASSET_MAX_SIZE_BYTES) {
    throw new Error(`El archivo supera el máximo permitido de ${CONTENT_ASSET_MAX_SIZE_BYTES} bytes.`)
  }

  return {
    filename,
    mimeType,
    sizeBytes,
  }
}

const sanitizeUploadMetadata = (metadata = {}) => {
  if (metadata == null) return { alt: null, caption: null, usageType: null, width: null, height: null }

  if (typeof metadata !== 'object' || Array.isArray(metadata)) {
    throw new Error('La metadata del asset debe ser un objeto.')
  }

  return {
    alt: nullIfBlank(metadata.alt),
    caption: nullIfBlank(metadata.caption),
    usageType: normalizeUsageValue(metadata.usageType ?? metadata.usage_type ?? metadata.usage),
    width: normalizeDimension(metadata.width, { label: 'width' }),
    height: normalizeDimension(metadata.height, { label: 'height' }),
  }
}

const sanitizeMetaPatch = (patch = {}) => {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) {
    throw new Error('El patch del asset debe ser un objeto.')
  }

  const payload = {}

  if (hasOwn(patch, 'alt')) {
    payload.alt = nullIfBlank(patch.alt)
  }

  if (hasOwn(patch, 'caption')) {
    payload.caption = nullIfBlank(patch.caption)
  }

  if (hasOwn(patch, 'usage') || hasOwn(patch, 'usageType') || hasOwn(patch, 'usage_type')) {
    payload.usage_type = normalizeUsageValue(patch.usageType ?? patch.usage_type ?? patch.usage)
  }

  if (hasOwn(patch, 'status')) {
    payload.status = normalizeStatus(patch.status, { allowArchived: false })
  }

  if (hasOwn(patch, 'width')) {
    payload.width = normalizeDimension(patch.width, { label: 'width' })
  }

  if (hasOwn(patch, 'height')) {
    payload.height = normalizeDimension(patch.height, { label: 'height' })
  }

  if (Object.keys(payload).length === 0) {
    throw new Error('No hay cambios válidos para actualizar en el asset.')
  }

  return payload
}

const getExtensionForUpload = (filename, mimeType) => {
  const rawExtension = String(filename || '').split('.').pop()?.toLowerCase() || ''
  const validExtension = rawExtension.replace(/[^a-z0-9]/g, '')
  if (validExtension) return validExtension
  return MIME_EXTENSION_MAP[mimeType] || 'bin'
}

const buildStoragePath = ({ filename, mimeType, now = new Date() }) => {
  const year = String(now.getUTCFullYear())
  const month = String(now.getUTCMonth() + 1).padStart(2, '0')
  const day = String(now.getUTCDate()).padStart(2, '0')
  const slug = sanitizeFileStem(filename)
  const extension = getExtensionForUpload(filename, mimeType)
  const uuid = createUuid()

  return `${year}/${month}/${day}/${uuid}-${slug}.${extension}`
}

const toNullableString = (value) => {
  if (value == null || value === '') return null
  return String(value)
}

const toNullableInteger = (value) => {
  if (value == null || value === '') return null
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue : null
}

const normalizeAsset = (row) => {
  if (!row) return null

  return {
    id: row.id,
    bucket: row.bucket,
    storagePath: row.storage_path,
    publicUrl: row.public_url ?? null,
    mimeType: row.mime_type ?? null,
    sizeBytes: toNullableInteger(row.size_bytes),
    width: toNullableInteger(row.width),
    height: toNullableInteger(row.height),
    alt: toNullableString(row.alt),
    caption: toNullableString(row.caption),
    usageType: toNullableString(row.usage_type),
    status: row.status ?? 'active',
    createdBy: row.created_by ?? null,
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
  }
}

const getSupabaseErrorMessage = (error) => {
  if (!error) return 'Error desconocido de Supabase.'
  if (typeof error === 'string') return error
  return error.message || error.error_description || error.details || error.hint || 'Error desconocido de Supabase.'
}

const createSupabaseActionError = (message, error) => new Error(`${message}: ${getSupabaseErrorMessage(error)}`)

const getClientOrThrow = () => {
  const client = clientResolver()
  if (!client) {
    throw new Error('Supabase no está configurado para gestionar assets.')
  }

  return client
}

const removeUploadedFileSafely = async (client, storagePath) => {
  if (!client || !storagePath) return

  try {
    await client.storage.from(CONTENT_MEDIA_BUCKET).remove([storagePath])
  } catch {
    // Best effort cleanup.
  }
}

export const __setContentAssetsServiceClientResolver = (resolver) => {
  clientResolver = typeof resolver === 'function' ? resolver : () => null
}

export const __resetContentAssetsServiceClientResolver = () => {
  clientResolver = () => getSupabaseClient()
}

export async function uploadAsset(file, metadata = {}) {
  const client = getClientOrThrow()
  const validatedFile = validateUploadFile(file)
  const sanitizedMetadata = sanitizeUploadMetadata(metadata)
  const plannedStoragePath = buildStoragePath(validatedFile)

  const { data: uploadData, error: uploadError } = await client.storage.from(CONTENT_MEDIA_BUCKET).upload(plannedStoragePath, file, {
    cacheControl: '3600',
    contentType: validatedFile.mimeType,
    upsert: false,
  })

  if (uploadError) {
    throw createSupabaseActionError(`No se pudo subir el archivo al bucket ${CONTENT_MEDIA_BUCKET}`, uploadError)
  }

  const storagePath = uploadData?.path || plannedStoragePath

  const insertPayload = {
    bucket: CONTENT_MEDIA_BUCKET,
    storage_path: storagePath,
    mime_type: validatedFile.mimeType,
    size_bytes: validatedFile.sizeBytes,
    width: sanitizedMetadata.width,
    height: sanitizedMetadata.height,
    alt: sanitizedMetadata.alt,
    caption: sanitizedMetadata.caption,
    usage_type: sanitizedMetadata.usageType,
    status: 'active',
  }

  const { data, error } = await client
    .from(CONTENT_ASSETS_TABLE)
    .insert(insertPayload)
    .select(CONTENT_ASSET_SELECT)
    .single()

  if (error) {
    await removeUploadedFileSafely(client, storagePath)
    throw createSupabaseActionError('El archivo se subió pero falló la creación del registro del asset', error)
  }

  return normalizeAsset(data)
}

export async function listAssets({ search, usageType, status, page, pageSize } = {}) {
  const client = getClientOrThrow()
  const pagination = normalizePagination(page, pageSize)
  const normalizedSearch = normalizeSearchToken(search)
  const normalizedUsageType = usageType == null || usageType === '' ? null : normalizeUsageValue(usageType)
  const normalizedStatus = normalizeStatus(status)
  const from = (pagination.page - 1) * pagination.pageSize
  const to = from + pagination.pageSize - 1

  let query = client
    .from(CONTENT_ASSETS_TABLE)
    .select(CONTENT_ASSET_SELECT, { count: 'exact' })
    .order('created_at', { ascending: false })

  if (normalizedUsageType) {
    query = query.eq('usage_type', normalizedUsageType)
  }

  if (normalizedStatus) {
    query = query.eq('status', normalizedStatus)
  }

  if (normalizedSearch) {
    const pattern = `%${normalizedSearch}%`
    query = query.or([
      `alt.ilike.${pattern}`,
      `caption.ilike.${pattern}`,
      `storage_path.ilike.${pattern}`,
      `usage_type.ilike.${pattern}`,
    ].join(','))
  }

  const { data, error, count } = await query.range(from, to)

  if (error) {
    throw createSupabaseActionError('No se pudo listar los assets', error)
  }

  const total = Number(count || 0)

  return {
    items: Array.isArray(data) ? data.map(normalizeAsset) : [],
    page: pagination.page,
    pageSize: pagination.pageSize,
    total,
    totalPages: total > 0 ? Math.ceil(total / pagination.pageSize) : 0,
  }
}

export async function getAssetById(id) {
  const client = getClientOrThrow()
  const assetId = validateAssetId(id)

  const { data, error } = await client
    .from(CONTENT_ASSETS_TABLE)
    .select(CONTENT_ASSET_SELECT)
    .eq('id', assetId)
    .maybeSingle()

  if (error) {
    throw createSupabaseActionError(`No se pudo obtener el asset ${assetId}`, error)
  }

  return normalizeAsset(data)
}

export async function updateAssetMeta(id, patch) {
  const client = getClientOrThrow()
  const assetId = validateAssetId(id)
  const updatePayload = sanitizeMetaPatch(patch)

  const { data, error } = await client
    .from(CONTENT_ASSETS_TABLE)
    .update(updatePayload)
    .eq('id', assetId)
    .select(CONTENT_ASSET_SELECT)
    .maybeSingle()

  if (error) {
    throw createSupabaseActionError(`No se pudo actualizar el asset ${assetId}`, error)
  }

  if (!data) {
    throw new Error(`No existe un asset con id ${assetId}.`)
  }

  return normalizeAsset(data)
}

export async function archiveAsset(id) {
  const client = getClientOrThrow()
  const assetId = validateAssetId(id)

  const { data, error } = await client
    .from(CONTENT_ASSETS_TABLE)
    .update({ status: 'archived' })
    .eq('id', assetId)
    .select(CONTENT_ASSET_SELECT)
    .maybeSingle()

  if (error) {
    throw createSupabaseActionError(`No se pudo archivar el asset ${assetId}`, error)
  }

  if (!data) {
    throw new Error(`No existe un asset con id ${assetId}.`)
  }

  return normalizeAsset(data)
}
