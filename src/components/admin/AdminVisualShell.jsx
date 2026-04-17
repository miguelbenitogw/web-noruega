import { useEffect, useMemo, useState } from 'react'
import { useNewsCollection } from '../../hooks/useNews'
import { ADMIN_PREVIEW_MODES, getAdminPreviewConfig } from '../../lib/adminSectionRegistry'
import {
  clearVisualEditLocalChanges,
  getVisualEditState,
  publishVisualEditChanges,
  resetVisualEditState,
  saveVisualEditDraft,
  subscribeVisualEditSession,
  updateVisualEditState,
} from '../../lib/visualEditSession'
import AdminVisualCanvas from './AdminVisualCanvas'
import AdminVisualSectionPanel from './AdminVisualSectionPanel'
import AdminVisualTopbar from './AdminVisualTopbar'

export default function AdminVisualShell({ onSignOut }) {
  const { articles, loading: articlesLoading } = useNewsCollection()
  const [visualSession, setVisualSession] = useState(() => getVisualEditState())
  const [activePreviewMode, setActivePreviewMode] = useState('landing')
  const [selectedArticleSlug, setSelectedArticleSlug] = useState('')
  const [activeTab, setActiveTab] = useState('sections')
  const [selectedSectionId, setSelectedSectionId] = useState(null)

  useEffect(() => subscribeVisualEditSession(setVisualSession), [])

  const activeArticleSlug = useMemo(() => {
    if (selectedArticleSlug && articles.some((entry) => entry.slug === selectedArticleSlug)) {
      return selectedArticleSlug
    }

    return articles[0]?.slug || ''
  }, [articles, selectedArticleSlug])

  const activeArticle = useMemo(
    () => articles.find((entry) => entry.slug === activeArticleSlug) || null,
    [activeArticleSlug, articles],
  )

  const articleOptions = useMemo(
    () => articles.map((entry) => ({ slug: entry.slug, title: entry.title })),
    [articles],
  )

  const previewConfig = useMemo(
    () => getAdminPreviewConfig({ viewId: activePreviewMode, article: activeArticle, articles }),
    [activeArticle, activePreviewMode, articles],
  )

  const activeSectionId = useMemo(() => {
    if (previewConfig.sections.some((entry) => entry.id === selectedSectionId)) {
      return selectedSectionId
    }

    return previewConfig.sections[0]?.id || null
  }, [previewConfig.sections, selectedSectionId])

  const activeSection = previewConfig.sections.find((entry) => entry.id === activeSectionId) || previewConfig.sections[0] || null
  const showSessionActions = previewConfig.usesVisualSession !== false

  useEffect(() => {
    updateVisualEditState({
      requested: showSessionActions,
      enabled: showSessionActions,
      canEdit: showSessionActions,
      isEditableRoute: showSessionActions,
      routeKey: previewConfig.routeKey,
      routeLabel: previewConfig.label,
    })
  }, [previewConfig.label, previewConfig.routeKey, showSessionActions])

  useEffect(() => () => resetVisualEditState(), [])

  // When EditableImage dispatches gw-image-field-focus, switch the right panel
  // to the "Felter" tab and activate the section that owns that field path.
  useEffect(() => {
    const handler = (event) => {
      const { path } = event.detail || {}
      if (!path) return
      const ownerSection = previewConfig.sections.find((section) =>
        section.fields.some((field) => field.path === path),
      )
      if (ownerSection) {
        setSelectedSectionId(ownerSection.id)
        setActiveTab('fields')
      }
    }
    window.addEventListener('gw-image-field-focus', handler)
    return () => window.removeEventListener('gw-image-field-focus', handler)
  }, [previewConfig.sections])

  const handleExit = () => {
    window.location.assign(previewConfig.path || '/')
  }

  const handleSave = async () => {
    try {
      await saveVisualEditDraft()
    } catch {
      // Error state is already managed by visualEditSession.
    }
  }

  const handlePublish = async () => {
    try {
      await publishVisualEditChanges()
    } catch {
      // Error state is already managed by visualEditSession.
    }
  }

  const handleClearCache = () => {
    clearVisualEditLocalChanges()
  }

  const handleChangePreviewMode = (modeId) => {
    setActivePreviewMode(modeId)
    setActiveTab('sections')
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-white">
      <AdminVisualTopbar
        activeArticleSlug={activeArticleSlug}
        activePreviewMode={activePreviewMode}
        articleOptions={articleOptions}
        headerDescription={previewConfig.topbarDescription}
        headerTitle={previewConfig.topbarTitle}
        onChangeArticle={setSelectedArticleSlug}
        onChangePreviewMode={handleChangePreviewMode}
        onClearCache={handleClearCache}
        onExit={handleExit}
        onPublish={handlePublish}
        onSave={handleSave}
        onSignOut={onSignOut}
        previewModes={ADMIN_PREVIEW_MODES}
        session={visualSession}
        showSessionActions={showSessionActions}
        statusText={showSessionActions ? null : 'Bruk skjemaet i nyhetsstudioet for å lagre og publisere.'}
      />

      <div className="flex min-h-0 flex-1 flex-col xl:flex-row">
        <AdminVisualCanvas
          activeSection={activeSection}
          article={activeArticle}
          previewConfig={previewConfig}
        />
        <AdminVisualSectionPanel
          activeSectionId={activeSectionId}
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          onSelectSection={setSelectedSectionId}
          previewConfig={previewConfig}
        />
      </div>

      {articlesLoading && activePreviewMode === 'article' && !activeArticle && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-slate-900/90 px-4 py-2 text-sm text-slate-200 shadow-lg backdrop-blur">
          Laster artikler til velgeren…
        </div>
      )}
    </div>
  )
}
