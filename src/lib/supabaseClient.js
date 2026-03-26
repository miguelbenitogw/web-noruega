import { createClient } from '@supabase/supabase-js'

const ENV = import.meta?.env ?? {}

const SUPABASE_URL = ENV.VITE_SUPABASE_URL?.trim() || ''
const SUPABASE_ANON_KEY = ENV.VITE_SUPABASE_ANON_KEY?.trim() || ''
const DEFAULT_CONTENT_LOCALE = ENV.VITE_SUPABASE_CONTENT_LOCALE?.trim() || 'nb'
const EDITOR_EMAILS = ENV.VITE_SUPABASE_CONTENT_EDITORS?.split(',') || []

const normalizeContentSource = (value) => {
  const raw = String(value || 'auto').trim().toLowerCase()
  return ['local', 'supabase', 'auto'].includes(raw) ? raw : 'auto'
}

const CONTENT_SOURCE = normalizeContentSource(ENV.VITE_CONTENT_SOURCE)

let client = null

const isBrowser = () => typeof window !== 'undefined'

const normalizeLocale = (locale) => {
  const raw = String(locale || '').trim().toLowerCase().replace(/_/g, '-')
  if (!raw) return DEFAULT_CONTENT_LOCALE
  if (raw.startsWith('nb') || raw.startsWith('no')) return 'nb'
  return raw
}

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

export const getContentSource = () => CONTENT_SOURCE

export const shouldUseSupabaseContent = () => CONTENT_SOURCE !== 'local' && isSupabaseConfigured

export const getSupabaseClient = () => {
  if (!isSupabaseConfigured) return null
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  }
  return client
}

export const getContentLocale = (locale) => {
  if (locale) return normalizeLocale(locale)
  if (isBrowser()) {
    const browserLocale = document.documentElement.lang || DEFAULT_CONTENT_LOCALE
    return normalizeLocale(browserLocale)
  }
  return normalizeLocale(DEFAULT_CONTENT_LOCALE)
}

export const getAllowedEditorEmails = () =>
  EDITOR_EMAILS.map((email) => email.trim().toLowerCase()).filter(Boolean)
