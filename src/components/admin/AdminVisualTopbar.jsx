const formatTimestamp = (value) => {
  if (!value) return null

  try {
    return new Intl.DateTimeFormat('nb-NO', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
    }).format(new Date(value))
  } catch {
    return null
  }
}

export default function AdminVisualTopbar({
  activeArticleSlug,
  activePreviewMode,
  articleOptions,
  headerDescription,
  headerTitle,
  onChangeArticle,
  onChangePreviewMode,
  onExit,
  onPublish,
  onSave,
  onSignOut,
  previewModes,
  session,
  showSessionActions,
  statusText,
}) {
  const isBusy = session.isSaving || session.isPublishing
  const savedAt = formatTimestamp(session.lastSavedAt)
  const publishedAt = formatTimestamp(session.lastPublishedAt)

  const statusLabel = showSessionActions
    ? session.error
      ? session.error
      : session.isPublishing
        ? 'Publiserer endringer…'
        : session.isSaving
          ? 'Lagrer kladd…'
          : session.hasPendingChanges
            ? 'Du har lokale endringer som ikke er lagret ennå'
            : publishedAt
              ? `Publisert ${publishedAt}`
              : savedAt
                ? `Kladd lagret ${savedAt}`
                : 'Alt er synkronisert'
    : statusText || 'Administrer innholdet i skjemaet under.'

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/90 backdrop-blur-xl">
      <div className="flex flex-col gap-4 px-4 py-4 lg:px-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-primary-400/30 bg-primary-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary-100">
                /admin
              </span>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                session.error && showSessionActions
                  ? 'border border-red-400/20 bg-red-500/10 text-red-100'
                  : session.hasPendingChanges && showSessionActions
                    ? 'border border-amber-400/20 bg-amber-500/10 text-amber-100'
                    : 'border border-emerald-400/20 bg-emerald-500/10 text-emerald-100'
              }`}>
                {statusLabel}
              </span>
            </div>

            <h1 className="mt-3 font-heading text-2xl font-bold text-white">
              {headerTitle}
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              {headerDescription}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 xl:justify-end">
            {showSessionActions ? (
              <>
                <button
                  type="button"
                  onClick={onSave}
                  disabled={isBusy}
                  className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Lagre kladd
                </button>
                <button
                  type="button"
                  onClick={onPublish}
                  disabled={isBusy}
                  className="inline-flex items-center justify-center rounded-2xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Publiser
                </button>
              </>
            ) : null}

            <button
              type="button"
              onClick={onExit}
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
            >
              Åpne siden
            </button>
            <button
              type="button"
              onClick={onSignOut}
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-red-400/30 hover:text-red-100"
            >
              Logg ut
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {previewModes.map((mode) => {
              const isActive = mode.id === activePreviewMode

              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => onChangePreviewMode(mode.id)}
                  className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-white text-slate-950 shadow-lg'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {mode.label}
                </button>
              )
            })}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {activePreviewMode === 'article' && (
              <select
                value={activeArticleSlug}
                onChange={(event) => onChangeArticle(event.target.value)}
                className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none transition focus:border-primary-400/60 focus:ring-2 focus:ring-primary-500/20"
              >
                {articleOptions.length === 0 && (
                  <option value="">Ingen artikler</option>
                )}

                {articleOptions.map((article) => (
                  <option key={article.slug} value={article.slug}>
                    {article.title}
                  </option>
                ))}
              </select>
            )}

            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-300">
              {showSessionActions
                ? 'Rediger direkte i forhåndsvisningen og bruk høyrepanelet for å holde oversikt over seksjoner og felter.'
                : 'Nyhetsstudio bruker skjema og forhåndsvisning i stedet for visuell inline-redigering.'}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
