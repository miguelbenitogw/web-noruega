# Admin Visual Editor Migration Plan

## Goal
Mover la edición visual completa a `/admin` para Landing, Noticias (listado + artículo) y Helse, eliminando el admin legacy de formularios/JSON como camino principal.

## Architecture
- `/admin` pasa a ser un **visual shell** con 3 áreas:
  - **Topbar**: guardar, publicar, salir
  - **Canvas central**: render real de la página seleccionada
  - **Panel derecho**: tabs de secciones, campos y estado
- Reutilización obligatoria:
  - `src/lib/visualEditSession.js`
  - `src/components/editable/EditableText.jsx`
  - `src/components/editable/EditableRichText.jsx`
  - `src/lib/contentOverrides.js`
  - `src/lib/contentRemote.js`
  - `src/lib/contentServices.js`
- El admin legacy queda como **fallback temporal** detrás de flag hasta validar paridad.

## Phases
- [ ] **Phase 1 — `/admin` shell visual**
  - Reemplazar `AdminPage` por un contenedor visual con topbar, canvas y panel derecho.
  - Verify: `/admin` abre la shell visual y muestra la ruta seleccionada sin tocar footer/portal.

- [ ] **Phase 2 — Section registry**
  - Crear un registry por ruta para mapear secciones editables:
    - Home: hero, servicios, stats, contacto
    - Nyheter: hero, cards, article body
    - Helse: hero, fases, partnership
  - Verify: seleccionar una sección en el panel derecho resalta el bloque correcto en el canvas.

- [ ] **Phase 3 — Inline editing in admin**
  - Enlazar `EditableText` y `EditableRichText` dentro del canvas.
  - Reutilizar overrides por path para cambios inmediatos.
  - Verify: editar un texto en canvas actualiza la vista sin salir de `/admin`.

- [ ] **Phase 4 — Save/Publish integration**
  - Conectar el topbar a `saveContentSnapshot`, `publishDraftSnapshot` y `upsertNews`.
  - Verify: guardar/publicar persiste cambios y recarga el estado correcto al volver a abrir `/admin`.

- [ ] **Phase 5 — Remove legacy as primary path**
  - Dejar el editor legacy solo como fallback temporal por flag.
  - Eliminar navegación/entrypoints del admin viejo cuando la paridad esté validada.
  - Verify: `/admin` ya no depende del formulario legacy para el flujo normal.

- [ ] **Phase 6 — Verification**
  - QA manual + regresión básica de rutas públicas.
  - Verify: Home, Nyheter y Helse siguen funcionando fuera de `/admin`.

## Files by phase
- **Routing / shell**
  - `src/App.jsx`
  - `src/pages/AdminPage.jsx`
  - `src/components/admin/VisualEditToolbar.jsx`
  - `src/lib/visualEditSession.js`

- **Editable canvas**
  - `src/components/editable/EditableText.jsx`
  - `src/components/editable/EditableRichText.jsx`
  - `src/pages/HomePage.jsx`
  - `src/pages/NyheterPage.jsx`
  - `src/pages/NewsArticlePage.jsx`
  - `src/pages/HelsePage.jsx`
  - `src/components/Hero.jsx`
  - `src/components/Nyheter.jsx`
  - `src/components/Helsesektor.jsx`
  - `src/components/MarkdownArticle.jsx`

- **Registry / admin UI**
  - `src/lib/adminSectionRegistry.js`
  - `src/components/admin/AdminVisualShell.jsx`
  - `src/components/admin/AdminSectionPanel.jsx`
  - `src/components/admin/AdminCanvasHost.jsx`
  - `src/components/admin/AdminTopbar.jsx`

- **Persistence**
  - `src/lib/contentOverrides.js`
  - `src/lib/contentRemote.js`
  - `src/lib/contentServices.js`

## Risks
- **Canvas/panel desync**: resolver with one source of truth in `visualEditSession`.
- **Mixed persistence paths**: news and snapshot content must use explicit persistors.
- **Over-editing scope**: lock the registry to Home/Nyheter/Helse only.
- **Markdown/body editing**: keep rich text simple first; avoid full WYSIWYG until parity is proven.

## Rollback
- Keep legacy admin behind a feature flag until parity is confirmed.
- If visual shell regresses, route `/admin` back to the legacy page without touching public routes.
- Preserve `contentOverrides` so edits aren’t lost during the transition.

## QA Checklist
- [ ] `/admin` loads the visual shell.
- [ ] Home, Nyheter and Helse can be selected from the panel.
- [ ] Section selection highlights the correct block in the canvas.
- [ ] Text edits save to local overrides immediately.
- [ ] Save draft persists the expected payload.
- [ ] Publish updates the active content.
- [ ] Footer and portal remain untouched.
- [ ] Public routes still render correctly without `?edit=1`.

## Definition of Done
- `/admin` is the primary editing experience.
- The legacy form/JSON admin is no longer the default path.
- Landing, Noticias and Helse can be edited visually from the same page experience.
- Save/Publish works end-to-end.
- Public site behavior is unchanged outside `/admin`.

## Notes
- Priority is **simplicity**: first reach parity, then remove legacy pieces.
- Prefer schema/path-based editing over generic JSON editors for all supported sections.
