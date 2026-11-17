# Qué perdimos al desconectar Supabase (y qué hace falta de verdad)

Informe de solo lectura. Fecha de la medición: 2026-11-17. Repo `prueba-web-noruega`, rama `main`.
Nota de método: `bat`, `eza` y `fd` no están instalados en esta máquina; usé `rg` y las herramientas de lectura. Los tamaños de imagen salen de `curl -I` contra las URLs reales. Lo que no pude verificar lo marco como tal.

## 0. Respuesta corta a la intuición del cliente

**Perdimos algo, pero no es lo que él cree.** No se rompió la maquetación ni el desarrollo: el sitio renderiza igual y, de hecho, es más rápido (se fueron dos `fetch` por visita y el repintado). Lo que se perdió es **un editor para no-programadores**: poder cambiar un texto, publicar una noticia o subir una foto sin pasar por un commit. Eso es real y duele, pero:

- La frecuencia de uso era baja. El snapshot de texto se tocó por última vez el 2026-09-09; el último artículo es del 2026-05-26; `content_pages` tenía 0 filas (la capa por página nunca se usó).
- Parte de lo que él cree perdido no existía: el historial de versiones del texto del sitio nunca existió (`content_snapshots` tiene un índice único por `(locale, status)`, o sea una fila publicada que se pisaba), y «varias personas editando» era una contraseña compartida (`docs/admin-operational-checklist.md` línea 14), no cuentas individuales.
- Lo grave que sí hay no es una pérdida de capacidad sino **deuda de dependencia**: 31 imágenes (no 18) cuelgan de un proyecto Supabase que ya nadie mantiene, y hay un bucket de CVs públicos que sigue vivo (sección 5).

Veredicto: **«menos de lo que él cree» en capacidad de editar; «más de lo que se ve» en riesgo residual.**

## 1. Los componentes «editable»: ¿escriben algo?

No. Ninguno tiene camino de escritura.

- `src/components/editable/EditableText.jsx` (116 líneas, antes 466): solo renderiza texto, enlaces en línea y saltos de párrafo. Emite `data-content-path` y tira `inputClassName`, `placeholder`, `onCommit`, `disabled` (líneas 81-87).
- `EditableImage.jsx` (28 líneas): es un `<img>` con `data-content-path`.
- `InlineRichText.jsx` (44 líneas): parsea enlaces `[texto](url)` y pinta. Nunca fue editor.

**Peso que paga el visitante.** El chunk `dist/assets/EditableText-B8eFs6tX.js` pesa 66.748 bytes (19.293 gzip), pero **no es el componente**: Rolldown le puso el nombre del primer módulo, y dentro lleva el contenido (`siteContent.js` 46 KB + `publishedContent.js` 23 KB de fuente, ambos, más `deepMergeContent`). El componente en sí son ~3,8 KB de fuente, del orden de 1 KB minificado (estimación, no medida por separado). Conclusión: **la capacidad muerta no cuesta casi nada**; lo que sí pesa es que el texto de las 25 secciones viaja entero a cada página, y que `siteContent.js` y `publishedContent.js` se solapan (se envían las dos capas para fusionarlas en cliente).

Segundo chunk a vigilar: `useNews-L5TfkPbP.js`, 65.011 bytes (21.416 gzip). Son los 10 `.md` incrustados con `import.meta.glob(..., eager: true)` en `src/lib/news.js:19`. **Crece linealmente**: a 10 artículos son 65 KB; a 100, ~650 KB para todo el que abra `/nyheter` o la Home. Hoy no importa; con ritmo de 2-3 artículos al mes, en 3 años sí.

## 2. Inventario de la pérdida

| Capacidad | Existía | Existe hoy | A quién le importa | Qué duele de verdad |
|---|---|---|---|---|
| Editar texto del sitio sin tocar código | Sí (editor visual en línea + `/admin`, guardaba en `content_snapshots`) | No. Hay que editar `publishedContent.js` o `siteContent.js` y hacer commit | Cliente que edita | Medio. Frecuencia observada: 1 edición del snapshot en meses. Pero un error de sintaxis en un `.js` rompe el build |
| Publicar una noticia sin deploy | Sí (`news_posts`, publicación inmediata) | No. Un `.md` en `src/content/news/` + commit + build de Vercel | Cliente que edita | **Alto**: es lo más frecuente (10 artículos en ~4 meses) |
| Subir una foto sin deploy | Sí (`AssetUploader`, bucket `content-media`, límite 8 MB, solo jpeg/png/webp) | No | Cliente que edita | **Alto** junto con la noticia: sin foto no hay noticia |
| Biblioteca de imágenes (buscar, alt, caption, archivar) | Sí (`AssetLibraryPanel`, `content_assets`) | No | Cliente | Bajo-medio. Con ~30 imágenes un catálogo en el repo alcanza |
| Previsualizar antes de publicar | Sí (`ContentLivePreview` + estado draft/published) | No, salvo previews de Vercel por rama/PR (gratis, pero hay que usar ramas) | Cliente, desarrollador | Medio. Recuperable sin construir nada |
| Historial de versiones | Solo para noticias (trigger `content_revisions`). Texto del sitio: **nunca** | Sí, y mejor: `git log` de todo | Desarrollador, cliente | Nada. Ganamos |
| Varias personas editando | Nominalmente (`content_editors`), en la práctica contraseña compartida | Con GitHub, cuentas individuales y revisión por PR | Cliente | Nada. Ganamos |
| Programar publicación (`publishAt`) | **No**: la política RLS solo mira `status = 'published'` (migración línea 535) | No. `news.js` tampoco filtra por fecha futura | Cliente | Nada que reponer, pero el frontmatter sigue pidiendo `publishAt` y no hace lo que sugiere |
| **Subir CV desde el formulario de candidatos** | Sí (bucket `cv-uploads`, el correo llevaba el enlace) | **No**: el candidato debe enviar el CV por correo (`KandidatKontakt.jsx:10-14`, `CV_EMAIL` línea 31) | **Visitante (candidato)** | **Medio-alto**: es la única pérdida que toca al usuario final, y es fricción en una conversión de reclutamiento |
| Login de admin | Sí, con `VITE_ADMIN_HASH/SALT/PASSWORD` en el bundle | No | Nadie | Cero. Era un agujero, no una pérdida |
| Imágenes servidas con caché | No: Supabase responde `Cache-Control: private, no-cache` (medido en las 31 URLs) | Las críticas ya son locales con `immutable` | Visitante | Las 31 restantes siguen revalidándose en cada visita |
| Contenido en el servidor (DB) | Sí | No; todo en el bundle | Desarrollador | Nada, es estático a propósito |

Lo que **no** se perdió: los formularios (EmailJS, independiente de Supabase), analítica, SEO/prerender de meta, sitemap.

## 3. Qué hace falta de verdad: opciones y recomendación

Solo duelen tres cosas: **publicar noticia, subir foto, y (menos) previsualizar**. El texto estructurado del sitio cambia casi nunca.

| Opción | Montaje | Qué aprende el cliente | Qué se rompe o complica |
|---|---|---|---|
| A. GitHub web + Pull Request + preview de Vercel | 3-5 h (guía, plantilla de PR, check de CI, arreglar plantilla y workflow) | Cuenta de GitHub; crear fichero, pegar markdown, subir imagen arrastrando, abrir PR, mirar el preview, aprobar | Un frontmatter mal escrito rompe el artículo (se mitiga con CI). Latencia = build de Vercel (no la medí). Las fotos hay que optimizarlas antes de subirlas |
| B. Decap CMS (backend GitHub) | 1-2 días | Un panel tipo CMS, pero igualmente cuenta de GitHub | Sobre Vercel no hay git-gateway: hace falta una función serverless de OAuth + app OAuth de GitHub = **un backend propio y un `/admin` abierto de nuevo**, justo lo que se acaba de cerrar |
| C. TinaCMS | 2-4 días | Edición visual con login en Tina Cloud | Dependencia de un servicio externo, cambia cómo se leen los datos |
| D. Sanity / Contentful | 4-7 días (modelar 25 secciones, reescribir `news.js`, `prerender-meta.mjs`, sitemap y hook de deploy) | Un CMS de verdad, sin GitHub | Es traer otra vez un proveedor externo para ~2,5 artículos al mes. Mayor coste, mayor superficie |
| E. Volver a Supabase solo para imágenes | Horas | Usar el dashboard de Supabase | Mantiene exactamente la dependencia que se acaba de cortar, y su riesgo de pausa |
| F. Solo commits del desarrollador | 0 | Nada | El cliente depende de ti para cada foto y cada noticia |

### Recomendación única: **A, con tres refuerzos**

**Que la noticia y la foto entren por Pull Request desde la web de GitHub, con preview de Vercel, y que el texto estructurado lo siga cambiando el desarrollador.** Por qué:

1. El volumen real (≈2-3 artículos/mes, 1 edición de texto por trimestre) no justifica un CMS con autenticación. B, C y D cuestan más de lo que ahorran.
2. Repone las tres cosas que dolían: publicar sin ti (el cliente abre el PR), previsualizar (Vercel crea la URL del preview gratis) y versionar (git), y mejora lo de «varias personas»: cuentas individuales y revisión, en vez de una contraseña compartida.
3. No agrega backend, ni secretos en el bundle, ni superficie de ataque. Es coherente con el stack (Vite + Vercel, sin servidor).

Los tres refuerzos (sin ellos A falla en silencio):
- **Un check de CI para los `.md`** que valide frontmatter (los 12 campos, fecha ISO, slug único, `coverImage` existente). Hoy un artículo mal formado se pierde sin avisar: ya pasó (`1b6cfd8`).
- **Arreglar la plantilla y el manual**: `src/content/news/_template.md:8` y `docs/ops/chatgpt-news-markdown-workflow.md` mandan `coverImage: "/images/news/default.jpg"`, y esa carpeta **no existe** en `public/`. Quien siga el manual publica con portada rota. El manual también dice `content/news/` (líneas 8, 152, 166) cuando la ruta real es `src/content/news/`.
- **Imágenes dentro del repo** (sección 4), con una carpeta y una regla de peso (≤300 KB, webp) para que el cliente suba sin optimizar a mano.

**Contrapartida dicha en voz alta:** el cliente tiene que aprender GitHub (un día de adaptación) y la publicación deja de ser instantánea: depende del build de Vercel. Si el cliente no acepta ni cuenta de GitHub ni esperar un build, A no sirve y la siguiente mejor es **B (Decap)**, asumiendo la función OAuth. **Cuándo cambiar de A a B**: si más de una persona no técnica publica cada semana, o si pasan de ~5 artículos al mes. Con los datos de hoy, no.

Segunda decisión barata: pasar `publishedContent.js` a JSON. Editar un `.js` desde la web de GitHub y equivocarse con una coma rompe el build entero; un JSON inválido también, pero un linter de CI lo avisa antes y el formato es el estándar de cualquier CMS futuro.

## 4. Las imágenes que cuelgan de Supabase

**La cuenta real no es 18: son 31 URLs distintas.** `images.js` tiene 17 entradas (línea 1 es la constante, 17 son `${SB}/...`); a eso se suman `publishedContent.js` (~14 URLs), 6 `.md` de noticias (`coverImage`), `siteContent.js` (4: líneas 132, 134, 182, 457) y `og-image.jpg` en `index.html` (19, 27, 106, 107, 170), `src/lib/seo.js:6` y `scripts/prerender-meta.mjs:9`. Suma: **45,5 MB** de originales, todos con `Cache-Control: private, no-cache`.

**El día que el proyecto se pause o se borre:**
- Las 31 URLs dejan de responder → imagen rota (sin fallback) en Home (equipo, CEO), Om oss, Spansk i Alicante, Helse, y 6 de las 10 portadas de noticias.
- **El `og-image.jpg` es el más grave en negocio**: está en `og:image`, `twitter:image` y en el JSON-LD (`logo`, `image`) de cada página. Se rompen las vistas previas al compartir en LinkedIn/WhatsApp y el logo del grafo de datos estructurados.
- `vercel.json:47` (CSP `img-src`) y `index.html:40-41` (preconnect) apuntan a un host muerto: no rompe nada, pero pagan un handshake inútil.
- Plan Free de Supabase: según lo que recuerdo de su política, pausa a los 7 días de inactividad y permite restaurar durante una ventana limitada (~90 días); **no verifiqué qué plan tiene este proyecto ni si las lecturas de storage cuentan como actividad**. Eso hay que mirarlo hoy en el dashboard.

**Costo real de traerlas al repo (medido por tamaño):**
- **15 de las 31 ya están en `src/assets/` byte a byte** (mismo tamaño exacto): `castle-arch.jpeg`, `city-view.jpeg`, `beach-palms.jpeg`, `metrics-team.jpg`, `team-hero.jpg`, `team/*`, `office/*`, `helse/nurses.webp`, `clase-noruego.webp`, `people-team.png`, y `og-image.jpg` = `logo-color.jpg` (14.984 B). Solo hay que apuntarlas ahí y publicarlas (varias ya tienen `.webp` al lado). Coincidencia por tamaño, no por hash.
- **Faltan 16**, que suman **24,3 MB (23,2 MiB)**: las 9 subidas del admin de 2026 (`2026/04/...`, `2026/05/...`), `cdn/helsesektor.png`, `cdn/people-hero.jpg` y `cdn/people-cta.jpg` (son el mismo fichero, 84.482 B, duplicado), `hvagjor/classroom-rekruttering.jpg`, `spansk-alicante/{beach-collage,group-office,testimonial-oliver}`.
- Repo hoy: `.git` pack de 39,8 MiB, `src/assets` 40 MB (casi todo sin referenciar), `public` 1,5 MB, `dist` 2,7 MB. Meter los 24,3 MB originales casi suma +60 % al pack. **Meter solo variantes webp optimizadas** (estimo 2,5-3,5 MB; estimación, no medida) apenas lo mueve.
- Vercel: sirven desde `public/assets/media/` con `immutable` 1 año ya configurado (`vercel.json:6-12`). Los límites de despliegue y de ancho de banda de Vercel están muy por encima de 3 MB; no verifiqué las cifras exactas de tu plan. Ganancia medida: se acaba el `no-cache` (hoy cada visita recuerda 31 revalidaciones posibles) y se acaban los 3-5 MB servidos crudos (`castle-arch` 4,87 MB, `beach-collage` 4,26 MB, `metrics-team` 3,35 MB).
- Contrapartida: con caché inmutable y nombres estables, **cambiar el contenido de una imagen exige renombrarla** (`-v2`); ya está documentado en `images.js`.
- Mismo tipo de riesgo, menor: 7 imágenes en `images.squarespace-cdn.com` y `globalworking.net` (`images.js` líneas 126-132).

## 5. Deuda que quedó de la salida

**Seguridad / datos (prioridad):**
- `supabase/migrations/20260506_000001_cv_uploads_bucket.sql:2-16`: bucket `cv-uploads` **público** con política de lectura para `anon`. Si sigue aplicado en el proyecto vivo, todos los CVs de candidatos (datos personales) son legibles con la anon key, que estuvo en bundles antiguos. **Exportar y borrar el bucket.** No verifiqué el estado vivo.
- Variables de Vercel `VITE_ADMIN_HASH/SALT/PASSWORD` y `VITE_SUPABASE_*`: no pude ver el panel; hay que borrarlas. Los despliegues antiguos de Vercel siguen sirviendo bundles con el hash expuesto; si esa contraseña se reutilizó en otro sitio, rotarla.
- `.mcp.json:3,5`: conector MCP de Supabase atado al proyecto `hahqimviirkkzkvmusga`.

**Código y configuración:**
- `.env.example:6-16`: bloque entero de `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SUPABASE_CONTENT_LOCALE`, `VITE_SUPABASE_CONTENT_EDITORS` y `VITE_ADMIN_AUTH_MODE`. Ningún fichero de `src/` ni `scripts/` los lee ya (solo `VITE_EMAILJS_*` y `VITE_GA_MEASUREMENT_ID`). (El lector de ficheros me bloqueó este archivo; lo vi por búsqueda.)
- `package.json:24`: **`react-ga4` sin ningún import** en `src/` ni `scripts/` (la analítica usa `gtag` directo, `src/lib/analytics.js`).
- `package.json:36` `playwright` solo lo usa `scripts/prerender-body.mjs`, y ese script **no está en ningún `scripts` de package.json**: huérfano. Línea 145 aún dice «Allow Supabase fetches». (Relacionado con la nota de memoria de que el prerender no inyecta cuerpo.)
- `src/lib/news.js:114-127`: exports muertos `getFeaturedNews`, `getSecondaryNews`, `loadPublishedNews`, `loadPublishedNewsBySlug`, `__newsTestables` (nadie los importa; `useNews.js` solo usa `getAllNews`). `source: 'local'` (línea 93) ya no distingue nada.
- `src/lib/contentMappers.js:49-81`: `validateTemplateShape` y `normalizeTemplateBlueprint` sin consumidores (eran del sistema de plantillas del admin).
- `src/lib/contentRuntime.js:68`: `getKnownRoutes` sin consumidores.
- `src/components/editable/EditableText.jsx:81-87`: props `inputClassName/placeholder/onCommit/disabled` descartadas, pero siguen pasándose en `Hero.jsx:36`, `Hero.jsx:86`, `Rekruttering.jsx:120`, `RekrutteringPage.jsx:167`.
- `index.html:78-98`: script que protege `/admin` de traductores; `/admin` es un 404. `index.html:40-41`: preconnect/dns-prefetch a Supabase.
- `vercel.json:47` (`img-src` con el host Supabase) y `vercel.json:51-59` (cabecera para `/admin`). `public/robots.txt:13` `Disallow: /admin` (más el comentario de la línea 6).
- Comentarios que mienten: `src/data/siteContent.js:3` «Edita desde /admin»; `src/components/Hero.jsx:108` «editable desde el admin»; `scripts/prerender-body.mjs:145`.
- `scripts/generate-content-backfill-sql.mjs` entero (línea 43 inserta en `content_snapshots`) y `scripts/db-clean/*.sql` (3 ficheros).
- Documentación de un sistema que ya no existe: `docs/admin-assets-workflow.md`, `admin-editor-qa.md`, `admin-inline-links.md`, `admin-operational-checklist.md`, `admin-visual-implementation-plan.md`, `cms-phase-agents.md`, `phase-6-backfill.md`, `phase-6-cutover-runbook.md`, `phase-6-rollback.md`, `supabase-content-setup.sql`, `docs/sql/content-backfill.sql`, `reports/norwegian_*.md` (3), y el directorio `supabase/` (README + 3 migraciones). El README del repo no explica cómo se edita ahora el contenido (no menciona noticias ni `publishedContent.js`).
- `publishAt` sigue en `_template.md:10` y en el manual aunque no programa nada (ver tabla).
- El código borrado del admin sigue recuperable en el commit `33a2945` (2026-11-16, ~9.200 líneas eliminadas en `components/admin`, `lib`, `hooks`, `editable`).

## 6. Resumen operativo (orden sugerido)

1. Hoy: revisar plan y estado del proyecto Supabase; exportar y vaciar `cv-uploads`; borrar variables huérfanas en Vercel.
2. Esta semana: mover las 31 imágenes al repo (15 ya están; optimizar las 16 que faltan), cambiar `og-image` primero.
3. Después: check de CI para `.md`, arreglar `_template.md` y el manual, escribir la guía de «cómo publicar una noticia por PR».
4. Limpieza: la lista de la sección 5.
