const STORAGE_KEY = 'gw_content_overrides_v1'
const UPDATE_EVENT = 'gw-content-updated'

const isBrowser = () => typeof window !== 'undefined'

const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value)

const clone = (value) => {
  if (Array.isArray(value)) return value.map(clone)
  if (isObject(value)) {
    const output = {}
    Object.entries(value).forEach(([k, v]) => {
      output[k] = clone(v)
    })
    return output
  }
  return value
}

const parsePath = (path) => path.split('.').filter(Boolean)

export const getByPath = (source, path) => {
  const parts = parsePath(path)
  let cursor = source
  for (const part of parts) {
    if (!isObject(cursor) && !Array.isArray(cursor)) return undefined
    cursor = cursor[part]
    if (cursor === undefined) return undefined
  }
  return cursor
}

export const setByPath = (source, path, value) => {
  const parts = parsePath(path)
  if (!parts.length) return source

  let cursor = source
  for (let i = 0; i < parts.length - 1; i += 1) {
    const part = parts[i]
    if (!isObject(cursor[part])) cursor[part] = {}
    cursor = cursor[part]
  }
  cursor[parts[parts.length - 1]] = value
  return source
}

export const deleteByPath = (source, path) => {
  const parts = parsePath(path)
  if (!parts.length) return

  const stack = []
  let cursor = source
  for (let i = 0; i < parts.length - 1; i += 1) {
    const part = parts[i]
    if (!isObject(cursor[part])) return
    stack.push([cursor, part])
    cursor = cursor[part]
  }

  delete cursor[parts[parts.length - 1]]

  for (let i = stack.length - 1; i >= 0; i -= 1) {
    const [parent, key] = stack[i]
    if (isObject(parent[key]) && Object.keys(parent[key]).length === 0) {
      delete parent[key]
    }
  }
}

export const readContentOverrides = () => {
  if (!isBrowser()) return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return isObject(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

export const writeContentOverrides = (overrides) => {
  if (!isBrowser()) return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides))
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT))
  } catch {
    // Ignore persistence errors.
  }
}

export const clearContentOverrides = () => {
  if (!isBrowser()) return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT))
  } catch {
    // Ignore persistence errors.
  }
}

export const getContentOverride = (path, fallbackValue) => {
  const overrides = readContentOverrides()
  const value = getByPath(overrides, path)
  return value === undefined ? fallbackValue : value
}

export const exportContentOverrides = () => JSON.stringify(readContentOverrides(), null, 2)

export const importContentOverrides = (jsonString) => {
  if (!jsonString) return false
  try {
    const parsed = JSON.parse(jsonString)
    if (!isObject(parsed)) return false
    writeContentOverrides(clone(parsed))
    return true
  } catch {
    return false
  }
}

// Patterns that indicate encoding corruption: a lone '?' replacing a Norwegian
// special character (ø, å, æ) in the middle of a word.  We look for '?' that
// is preceded and followed by alphanumeric characters, which is never valid in
// normal Norwegian prose (question marks only appear at the end of sentences).
const CORRUPTION_RE = /[a-zA-Z]\?[a-zA-Z]/

export const hasCorruptedOverrides = () => {
  if (!isBrowser()) return false
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return false
    return CORRUPTION_RE.test(raw)
  } catch {
    return false
  }
}

export const sanitizeContentOverrides = () => {
  if (!isBrowser()) return false
  if (!hasCorruptedOverrides()) return false
  clearContentOverrides()
  return true
}

export const CONTENT_OVERRIDE_EVENT = UPDATE_EVENT

export const loadDraftIntoOverrides = async () => {
  const { fetchDraftContentSnapshot } = await import('./contentRemote')
  const draft = await fetchDraftContentSnapshot()
  if (!draft?.content || Object.keys(draft.content).length === 0) return false
  writeContentOverrides(draft.content)
  return true
}
