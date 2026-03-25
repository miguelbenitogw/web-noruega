export default function AdminEntityEditorShell({ editor, preview }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
      <div className="min-w-0">{editor}</div>
      <aside className="min-w-0 xl:sticky xl:top-24 xl:self-start">
        {preview}
      </aside>
    </div>
  )
}
