import { clearContentOverrides, readContentOverrides } from './contentOverrides'
import { publishDraftSnapshot, saveContentSnapshot } from './contentRemote'

const listeners = new Set()
const persistors = new Map()
const VISUAL_EDIT_EVENTS = ['gw-visual-edit-change', 'gw-visual-edit-state']

const baseState = {
  requested: false,
  enabled: false,
  canEdit: false,
  isEditableRoute: false,
  routeKey: null,
  routeLabel: null,
  isSaving: false,
  isPublishing: false,
  lastSavedAt: null,
  lastPublishedAt: null,
  error: null,
}

let state = { ...baseState }

const cloneValue = (value) => {
  if (Array.isArray(value)) return value.map(cloneValue)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, cloneValue(entry)]))
  }
  return value
}

const syncBrowserVisualEditState = (snapshot) => {
  if (typeof window === 'undefined') return

  const enabled = Boolean(snapshot.enabled)
  const root = window.document?.documentElement
  const body = window.document?.body

  window.__GW_VISUAL_EDIT__ = {
    ...cloneValue(snapshot),
    enabled,
  }

  if (root) {
    root.dataset.visualEditMode = enabled ? 'true' : 'false'
    root.dataset.visualEdit = enabled ? 'true' : 'false'
  }

  if (body) {
    body.dataset.visualEditMode = enabled ? 'true' : 'false'
    body.dataset.visualEdit = enabled ? 'true' : 'false'
  }

  VISUAL_EDIT_EVENTS.forEach((eventName) => {
    window.dispatchEvent(new CustomEvent(eventName, { detail: window.__GW_VISUAL_EDIT__ }))
  })
}

const emit = () => {
  const snapshot = getVisualEditState()
  syncBrowserVisualEditState(snapshot)
  listeners.forEach((listener) => listener(snapshot))
}

const setState = (patch) => {
  state = { ...state, ...patch }
  emit()
  return state
}

const hasObjectValues = (value) => value && typeof value === 'object' && Object.keys(value).length > 0

const collectPersistorResults = async (methodName) => {
  const results = []

  for (const [id, persistor] of persistors.entries()) {
    const handler = persistor?.[methodName]
    if (typeof handler !== 'function') continue

    const result = await handler()
    results.push({ id, result: result ?? null })
  }

  return results
}

const buildDefaultSnapshotResult = async (mode) => {
  const overrides = readContentOverrides()
  const hasLocal = hasObjectValues(overrides)

  if (mode === 'publish') {
    if (hasLocal) {
      const savedDraft = await saveContentSnapshot(cloneValue(overrides), { status: 'draft' })
      if (!savedDraft) throw new Error('Kunne ikke lagre kladd til Supabase før publisering. Sjekk tilkobling og tilgang.')
    }
    const published = await publishDraftSnapshot()
    if (!published) throw new Error('Publisering til Supabase mislyktes. Sjekk tilkobling og tilgang.')
    return { type: 'snapshot', status: 'published', snapshot: published }
  }

  if (!hasLocal) return null

  const draft = await saveContentSnapshot(cloneValue(overrides), { status: 'draft' })
  if (!draft) throw new Error('Kunne ikke lagre kladd til Supabase. Sjekk tilkobling og tilgang.')
  return { type: 'snapshot', status: 'draft', snapshot: draft }
}

export const getVisualEditState = () => {
  const snapshot = { ...state }
  snapshot.hasPendingChanges = hasVisualEditChanges()
  snapshot.persistorCount = persistors.size
  return snapshot
}

export const subscribeVisualEditSession = (listener) => {
  listeners.add(listener)
  listener(getVisualEditState())
  return () => listeners.delete(listener)
}

export const updateVisualEditState = (patch) => setState(patch)

export const resetVisualEditState = () => {
  state = { ...baseState }
  emit()
}

export const registerVisualEditPersistor = (id, persistor) => {
  if (!id) {
    throw new Error('registerVisualEditPersistor requires a stable id')
  }

  persistors.set(id, persistor || {})
  emit()

  return () => {
    persistors.delete(id)
    emit()
  }
}

export const hasVisualEditChanges = () => {
  const overrideChanges = hasObjectValues(readContentOverrides())
  const persistorChanges = Array.from(persistors.values()).some((persistor) => {
    if (typeof persistor?.hasChanges !== 'function') return false
    try {
      return Boolean(persistor.hasChanges())
    } catch {
      return false
    }
  })

  return overrideChanges || persistorChanges
}

export const clearVisualEditLocalChanges = () => {
  clearContentOverrides()
  emit()
}

export const saveVisualEditDraft = async () => {
  setState({ isSaving: true, error: null })

  try {
    const results = await collectPersistorResults('saveDraft')
    const snapshotResult = await buildDefaultSnapshotResult('draft')
    if (snapshotResult) results.unshift({ id: 'snapshot', result: snapshotResult })

    clearContentOverrides()

    setState({
      isSaving: false,
      lastSavedAt: new Date().toISOString(),
      error: null,
    })

    return results
  } catch (error) {
    setState({
      isSaving: false,
      error: error instanceof Error ? error.message : 'Kunne ikke lagre kladden.',
    })
    throw error
  }
}

export const publishVisualEditChanges = async () => {
  setState({ isPublishing: true, error: null })

  try {
    const results = await collectPersistorResults('publish')
    const snapshotResult = await buildDefaultSnapshotResult('publish')
    if (snapshotResult) results.unshift({ id: 'snapshot', result: snapshotResult })

    clearContentOverrides()

    setState({
      isPublishing: false,
      lastPublishedAt: new Date().toISOString(),
      error: null,
    })

    return results
  } catch (error) {
    setState({
      isPublishing: false,
      error: error instanceof Error ? error.message : 'Kunne ikke publisere innholdet.',
    })
    throw error
  }
}
