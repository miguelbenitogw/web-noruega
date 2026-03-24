import { getAllowedEditorEmails, getContentLocale, getSupabaseClient, isSupabaseConfigured } from './supabaseClient'

const CONTENT_TABLE = 'content_snapshots'
const EDITORS_TABLE = 'content_editors'

const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value)

const clone = (value) => {
  if (Array.isArray(value)) return value.map(clone)
  if (isObject(value)) {
    const output = {}
    Object.entries(value).forEach(([key, entry]) => {
      output[key] = clone(entry)
    })
    return output
  }
  return value
}

const normalizeStatus = (status) => (status === 'published' ? 'published' : 'draft')

const normalizeRole = (role) => String(role || '').trim().toLowerCase()

const isAllowedEditorRole = (role) => ['admin', 'editor'].includes(normalizeRole(role))

const normalizeSnapshot = (row) => {
  if (!row) return null
  return {
    id: row.id,
    locale: row.locale,
    status: normalizeStatus(row.status),
    content: clone(row.content || {}),
    updatedAt: row.updated_at || null,
    publishedAt: row.published_at || null,
  }
}

const querySnapshot = async (status, locale) => {
  const client = getSupabaseClient()
  if (!client) return null

  const resolvedLocale = getContentLocale(locale)
  const { data, error } = await client
    .from(CONTENT_TABLE)
    .select('id, locale, status, content, updated_at, published_at')
    .eq('locale', resolvedLocale)
    .eq('status', normalizeStatus(status))
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !data) return null
  return normalizeSnapshot(data)
}

const upsertSnapshot = async (content, status, locale) => {
  const client = getSupabaseClient()
  if (!client) return null

  const resolvedLocale = getContentLocale(locale)
  const resolvedStatus = normalizeStatus(status)
  const payload = {
    locale: resolvedLocale,
    status: resolvedStatus,
    content: clone(content || {}),
    updated_at: new Date().toISOString(),
    published_at: resolvedStatus === 'published' ? new Date().toISOString() : null,
  }

  const { data, error } = await client
    .from(CONTENT_TABLE)
    .upsert(payload, { onConflict: 'locale,status' })
    .select('id, locale, status, content, updated_at, published_at')
    .maybeSingle()

  if (error || !data) return null
  return normalizeSnapshot(data)
}

export { isSupabaseConfigured }

export async function fetchPublishedContentSnapshot(locale) {
  return querySnapshot('published', locale)
}

export async function fetchDraftContentSnapshot(locale) {
  return querySnapshot('draft', locale)
}

export async function saveContentSnapshot(content, { status = 'draft', locale } = {}) {
  return upsertSnapshot(content, status, locale)
}

export async function publishDraftSnapshot(locale) {
  const draftSnapshot = await fetchDraftContentSnapshot(locale)
  if (!draftSnapshot) return null
  return upsertSnapshot(draftSnapshot.content, 'published', draftSnapshot.locale)
}

export async function canCurrentUserEditContent() {
  if (!isSupabaseConfigured) return false

  const client = getSupabaseClient()
  if (!client) return false

  const { data: userData, error } = await client.auth.getUser()
  if (error || !userData?.user) return false

  const email = userData.user.email?.trim().toLowerCase() || ''

  const { data: userMatch, error: userError } = await client
    .from(EDITORS_TABLE)
    .select('id, role, user_id, email')
    .eq('user_id', userData.user.id)
    .limit(1)
    .maybeSingle()

  if (!userError && userMatch) {
    return isAllowedEditorRole(userMatch.role)
  }

  if (!email) return false

  const { data: emailMatch, error: emailError } = await client
    .from(EDITORS_TABLE)
    .select('id, role, user_id, email')
    .eq('email', email)
    .limit(1)
    .maybeSingle()

  if (emailError || !emailMatch) {
    const allowedEmails = getAllowedEditorEmails()
    return allowedEmails.length > 0 && allowedEmails.includes(email)
  }

  return isAllowedEditorRole(emailMatch.role)
}
