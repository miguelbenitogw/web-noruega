# Documento operativo para subagentes por fases del CMS

Fecha: 2026-03-24  
Proyecto: `prueba-web-noruega`

## 1. Propósito

Este documento define cómo ejecutar el trabajo del CMS por fases con subagentes especializados. No implementa código: solo ordena el trabajo, los entregables y los criterios para validar cada fase.

Úsalo como base para lanzar un subagente por fase, con alcance acotado y salida verificable.

## 2. Orden recomendado y dependencias

Orden recomendado:
1. DB
2. Auth
3. Templates
4. Admin UI
5. Content Runtime
6. Revisions UI
7. Hardening
8. Migration/Cutover

Dependencias clave:
- DB habilita persistencia, versionado y consultas del resto del sistema.
- Auth depende de DB para usuarios, sesiones y permisos.
- Templates depende de DB y Auth para guardar/leer plantillas con control de acceso.
- Admin UI depende de Auth y Templates para editar contenido con seguridad.
- Content Runtime depende de DB y Templates para renderizar contenido publicado.
- Revisions UI depende de DB y del modelo de contenido para historial, diff y restore.
- Hardening cruza todas las capas y debe ejecutarse cuando ya existe el flujo principal.
- Migration/Cutover depende de todo lo anterior y valida el paso de la fuente vieja a la nueva.

## 3. Cómo usar este documento con subagentes

Para cada fase:
1. Copiá el prompt de la fase.
2. Pegalo en un subagente nuevo.
3. Limitá el subagente a esa fase y a sus archivos relevantes.
4. Pedile que devuelva solo el entregable definido.
5. No mezcles fases en una sola ejecución salvo que el bloqueo sea estrictamente compartido.

Archivos del repo que suelen ser relevantes como contexto:
- `src/lib/supabaseClient.js`
- `src/lib/contentRemote.js`
- `src/lib/contentOverrides.js`
- `src/data/siteContent.js`
- `src/pages/AdminPage.jsx`
- `docs/admin-operational-checklist.md`
- `docs/supabase-content-setup.sql`

## 4. Fases

### Fase 1 — DB

**Objetivo**
- Definir el modelo de datos del CMS: contenido, templates, revisiones, permisos y metadatos operativos.

**Entradas**
- Contexto del contenido actual del repo.
- `docs/supabase-content-setup.sql`.
- `src/lib/contentRemote.js` y `src/lib/contentOverrides.js`.
- Reglas de negocio sobre qué contenido debe ser editable y versionable.

**Tareas exactas**
1. Identificar entidades mínimas del CMS.
2. Definir claves primarias, relaciones y campos obligatorios.
3. Separar estado publicado, borrador y revisión.
4. Definir campos de auditoría: autor, timestamps, origen y versión.
5. Definir índices y restricciones para consultas frecuentes.
6. Definir estrategia de migración inicial y semilla de datos.
7. Documentar supuestos y huecos pendientes.

**Salida esperada**
- Esquema de datos claro y usable para implementar.
- Lista de tablas/colecciones, campos, relaciones e índices.
- Reglas de integridad y de acceso sugeridas.

**Criterios de aceptación**
- El modelo soporta publicación, borrador y revisión.
- El modelo permite recuperar una versión publicada sin ambigüedad.
- Los campos obligatorios están explícitos.
- El diseño evita duplicación innecesaria.

**Riesgos**
- Modelo demasiado acoplado al UI.
- Falta de versionado real.
- Campos insuficientes para auditoría.
- Índices mal elegidos y consultas lentas.

**Rollback**
- Conservar el esquema anterior intacto hasta validar el nuevo.
- Mantener script de reversión de migración.
- Si el modelo nuevo no cierra, volver al contrato de datos anterior sin tocar UI.

**Prompt para subagente**
```txt
SKILL: Load the relevant repo/documentation skill before starting.

Necesito que trabajes SOLO la fase DB del CMS para este repo.

Contexto:
- Repo: prueba-web-noruega
- Objetivo: definir el modelo de datos del CMS sin implementar código todavía.
- Archivos de referencia: docs/supabase-content-setup.sql, src/lib/contentRemote.js, src/lib/contentOverrides.js.

Tu misión:
1) Proponer el modelo de datos mínimo y completo.
2) Separar publicado, borrador y revisiones.
3) Definir entidades, relaciones, campos, índices y restricciones.
4) Listar supuestos, riesgos y decisiones abiertas.

Entregable requerido:
- Resumen ejecutivo
- Esquema propuesto
- Reglas de integridad
- Riesgos
- Recomendación de siguiente paso

No escribas implementación de código. No pases a otras fases.
```

### Fase 2 — Auth

**Objetivo**
- Definir autenticación y autorización del CMS para separar admin, editor y lectura pública.

**Entradas**
- Esquema definido en DB.
- `src/pages/AdminPage.jsx`.
- `docs/admin-operational-checklist.md`.
- Reglas de acceso del negocio.

**Tareas exactas**
1. Definir roles y capacidades.
2. Definir cómo se autentica un usuario admin/editor.
3. Definir sesiones, expiración y reautenticación.
4. Definir protecciones para rutas privadas y acciones sensibles.
5. Definir qué puede ver/editar cada rol.
6. Documentar bloqueo, rate limit y recuperación de acceso.
7. Definir el criterio para accesos de emergencia.

**Salida esperada**
- Matriz de roles/permisos.
- Flujo de login y sesión.
- Reglas para proteger acciones del CMS.

**Criterios de aceptación**
- Un usuario sin sesión no puede operar el CMS.
- Cada rol tiene permisos explícitos y mínimos.
- Las acciones sensibles están protegidas.
- El esquema de auth no expone secretos en el cliente.

**Riesgos**
- Permisos demasiado amplios.
- Sesiones largas sin control.
- Manejo débil de recuperación de acceso.
- Mezclar auth de contenido público con auth de administración.

**Rollback**
- Mantener el flujo actual de acceso si el nuevo auth falla.
- No bloquear el admin existente hasta validar la nueva capa.
- Si un rol nuevo complica la operación, volver a un único rol temporal controlado.

**Prompt para subagente**
```txt
SKILL: Load the relevant repo/documentation skill before starting.

Trabajá SOLO la fase Auth del CMS para este repo.

Contexto:
- Repo: prueba-web-noruega
- Objetivo: definir autenticación y autorización del CMS, sin implementar código todavía.
- Archivos de referencia: src/pages/AdminPage.jsx, docs/admin-operational-checklist.md, el esquema DB ya definido.

Tu misión:
1) Definir roles y permisos.
2) Proponer flujo de login/sesión.
3) Definir reglas de acceso por acción y por ruta.
4) Enumerar riesgos, controles y rollback.

Entregable requerido:
- Matriz de roles/permisos
- Flujo de auth
- Controles de seguridad
- Riesgos y rollback

No implementes código. No cambies otras fases.
```

### Fase 3 — Templates

**Objetivo**
- Diseñar el sistema de templates de contenido para estandarizar páginas, bloques y variantes.

**Entradas**
- Esquema de DB.
- Reglas de contenido existentes en `src/data/siteContent.js`.
- Reglas de render en `src/lib/contentRemote.js`.

**Tareas exactas**
1. Identificar tipos de template necesarios.
2. Definir campos configurables por template.
3. Definir validaciones por tipo de contenido.
4. Definir preview y publicación de templates.
5. Definir herencia o composición entre templates.
6. Definir versionado de templates.
7. Documentar ejemplos de uso y límites.

**Salida esperada**
- Catálogo de templates.
- Contrato de campos por template.
- Reglas de validación y versionado.

**Criterios de aceptación**
- Cada template tiene propósito claro.
- Los campos editables están acotados.
- No hay templates duplicados sin razón.
- El sistema permite evolucionar sin romper contenido existente.

**Riesgos**
- Plantillas demasiado rígidas.
- Campos demasiado libres y difíciles de mantener.
- Mezclar lógica editorial con lógica visual.
- Versiones incompatibles de template.

**Rollback**
- Mantener una versión base estable de template.
- Si una plantilla nueva falla, volver a la anterior sin perder contenido.
- Conservar migraciones reversibles para cambios de contrato.

**Prompt para subagente**
```txt
SKILL: Load the relevant repo/documentation skill before starting.

Trabajá SOLO la fase Templates del CMS para este repo.

Contexto:
- Repo: prueba-web-noruega
- Objetivo: definir el sistema de templates sin implementar código todavía.
- Archivos de referencia: src/data/siteContent.js, src/lib/contentRemote.js, esquema DB y contrato de auth.

Tu misión:
1) Proponer los templates necesarios.
2) Definir campos, validaciones y versionado.
3) Explicar cómo se usan y cómo se extienden.
4) Marcar riesgos, dependencias y rollback.

Entregable requerido:
- Catálogo de templates
- Contrato de cada template
- Reglas de validación
- Riesgos y rollback

No implementes código. No pases a otras fases.
```

### Fase 4 — Admin UI

**Objetivo**
- Diseñar la interfaz operativa para crear, editar, publicar y revisar contenido desde `/admin`.

**Entradas**
- Auth definido.
- Templates definidos.
- `src/pages/AdminPage.jsx`.
- `docs/admin-operational-checklist.md`.

**Tareas exactas**
1. Definir layout de administración y navegación interna.
2. Definir vistas para listado, edición, preview y publicación.
3. Definir estados vacíos, error y carga.
4. Definir acciones principales y secundarias.
5. Definir feedback de guardado, publicación y validación.
6. Definir accesibilidad básica y atajos operativos.
7. Definir qué datos ve el editor y cuáles no.

**Salida esperada**
- Flujo de UI de administración claro.
- Mapa de pantallas y acciones.
- Reglas UX para edición segura y rápida.

**Criterios de aceptación**
- Un editor puede encontrar, editar y publicar contenido sin perderse.
- Los estados críticos están visibles.
- La UI no expone operaciones ambiguas.
- Los errores se entienden y se pueden corregir.

**Riesgos**
- UI sobrecargada.
- Guardados ambiguos o peligrosos.
- Mezclar edición con publicación sin confirmación.
- Accesibilidad pobre en una herramienta interna.

**Rollback**
- Mantener el admin actual hasta validar el nuevo flujo.
- Si una pantalla rompe operación, volver al flujo anterior por ruta o feature flag.
- Si el preview falla, preservar edición básica y desactivar solo el preview.

**Prompt para subagente**
```txt
SKILL: Load the relevant repo/documentation skill before starting.

Trabajá SOLO la fase Admin UI del CMS para este repo.

Contexto:
- Repo: prueba-web-noruega
- Objetivo: diseñar la experiencia de administración, sin implementar código todavía.
- Archivos de referencia: src/pages/AdminPage.jsx, docs/admin-operational-checklist.md, templates y auth ya definidos.

Tu misión:
1) Diseñar flujos de listado/edición/publicación.
2) Definir estados, acciones y feedback.
3) Marcar accesibilidad, errores y edge cases.
4) Incluir riesgos, dependencias y rollback.

Entregable requerido:
- Mapa de pantallas
- Flujo operativo
- Estados y validaciones de UI
- Riesgos y rollback

No implementes código. No cambies otras fases.
```

### Fase 5 — Content Runtime

**Objetivo**
- Definir cómo el contenido publicado se resuelve, se renderiza y se sirve al usuario final.

**Entradas**
- DB, Auth y Templates definidos.
- `src/lib/contentRemote.js`.
- `src/lib/contentOverrides.js`.
- Páginas públicas del repo.

**Tareas exactas**
1. Definir fuente de verdad del contenido publicado.
2. Definir resolución de overrides y fallback.
3. Definir estrategia de cache o invalidez conceptual.
4. Definir cómo se comporta ante contenido faltante o inválido.
5. Definir contrato entre runtime y templates.
6. Definir reglas para SEO, canonical y estado público.
7. Documentar escenarios de falla y recuperación.

**Salida esperada**
- Contrato de runtime de contenido.
- Reglas de resolución de contenido.
- Comportamiento frente a errores y faltantes.

**Criterios de aceptación**
- El contenido publicado tiene una resolución determinista.
- Los overrides no rompen el contenido base.
- El runtime soporta fallback claro.
- Las páginas públicas no dependen del admin.

**Riesgos**
- Fallbacks ocultos que enmascaran errores.
- Desacople entre template y render.
- Cache incoherente.
- Publicar contenido inválido.

**Rollback**
- Mantener el runtime anterior disponible.
- Si el nuevo resolver falla, volver al origen previo o a un fallback estático.
- Desactivar overrides nuevos antes de tocar contenido base.

**Prompt para subagente**
```txt
SKILL: Load the relevant repo/documentation skill before starting.

Trabajá SOLO la fase Content Runtime del CMS para este repo.

Contexto:
- Repo: prueba-web-noruega
- Objetivo: definir cómo se resuelve y renderiza el contenido publicado, sin implementar código todavía.
- Archivos de referencia: src/lib/contentRemote.js, src/lib/contentOverrides.js, páginas públicas del repo, schema DB y templates.

Tu misión:
1) Definir la fuente de verdad del contenido publicado.
2) Proponer reglas de fallback y overrides.
3) Definir contratos de render y escenarios de error.
4) Incluir riesgos, dependencias y rollback.

Entregable requerido:
- Contrato de runtime
- Reglas de resolución
- Escenarios de falla/fallback
- Riesgos y rollback

No implementes código. No mezcles otras fases.
```

### Fase 6 — Revisions UI

**Objetivo**
- Diseñar la interfaz para ver historial, comparar versiones, restaurar revisiones y auditar cambios.

**Entradas**
- DB con versionado.
- Content Runtime definido.
- Admin UI definido.

**Tareas exactas**
1. Definir cómo se lista el historial de un contenido.
2. Definir cómo se muestran diffs entre versiones.
3. Definir acciones de restore, clone y promote.
4. Definir controles de confirmación para cambios sensibles.
5. Definir metadatos visibles por revisión.
6. Definir permisos por acción en historial.
7. Definir estados vacíos y errores.

**Salida esperada**
- UX de revisiones clara y segura.
- Reglas de comparación y restauración.
- Criterios de auditoría visibles.

**Criterios de aceptación**
- Un usuario puede entender qué cambió y cuándo.
- Restaurar una revisión tiene confirmación explícita.
- La UI no oculta metadatos críticos.
- El historial es usable incluso con muchas versiones.

**Riesgos**
- Diff poco legible.
- Restauración accidental.
- Exceso de datos en pantalla.
- Pérdida de trazabilidad.

**Rollback**
- Si el visor de diffs falla, mantener el historial simple listado.
- Si restore genera riesgo, desactivarlo temporalmente y dejar solo lectura.
- Conservar la API/contrato anterior de revisiones mientras se valida la nueva UI.

**Prompt para subagente**
```txt
SKILL: Load the relevant repo/documentation skill before starting.

Trabajá SOLO la fase Revisions UI del CMS para este repo.

Contexto:
- Repo: prueba-web-noruega
- Objetivo: diseñar la UI de historial, diff y restore, sin implementar código todavía.
- Dependencias: DB con versionado, Admin UI y Content Runtime ya definidos.

Tu misión:
1) Diseñar historial, diff y restore.
2) Definir metadatos visibles y permisos.
3) Cubrir errores, vacíos y confirmaciones.
4) Incluir riesgos, dependencias y rollback.

Entregable requerido:
- Flujo de revisiones
- Diseño de diff/restore
- Reglas de permisos
- Riesgos y rollback

No implementes código. No pases a otras fases.
```

### Fase 7 — Hardening

**Objetivo**
- Cerrar riesgos de seguridad, consistencia, observabilidad y operación en todo el CMS.

**Entradas**
- Todas las fases funcionales anteriores.
- `docs/admin-operational-checklist.md`.
- Contratos de DB, Auth, Admin UI y Runtime.

**Tareas exactas**
1. Revisar controles de acceso y exposición de datos.
2. Revisar validación de entrada y sanitización.
3. Revisar rate limiting, bloqueo y auditoría.
4. Revisar protección contra estados inconsistentes.
5. Revisar logs, alertas y señales operativas mínimas.
6. Revisar no-index, canonical y superficies públicas.
7. Documentar checklist de release y operación.

**Salida esperada**
- Lista priorizada de hardening.
- Controles mínimos obligatorios.
- Checklist operativa para release y soporte.

**Criterios de aceptación**
- No quedan superficies críticas sin control explícito.
- El admin no expone contenido o acciones innecesarias.
- Hay señales mínimas para detectar problemas.
- La documentación operativa permite operar sin adivinar.

**Riesgos**
- Falsa sensación de seguridad.
- Controles parciales que rompen UX.
- Falta de observabilidad real.
- Hardening que bloquee operación legítima.

**Rollback**
- Hacer el hardening de forma incremental y reversible.
- Si una medida rompe el flujo, desactivarla puntualmente y dejar registro.
- Mantener un camino de operación mínima segura.

**Prompt para subagente**
```txt
SKILL: Load the relevant repo/documentation skill before starting.

Trabajá SOLO la fase Hardening del CMS para este repo.

Contexto:
- Repo: prueba-web-noruega
- Objetivo: revisar seguridad, consistencia y operación del CMS sin implementar código todavía.
- Archivos de referencia: docs/admin-operational-checklist.md, esquema DB, auth, templates, admin UI y runtime.

Tu misión:
1) Detectar riesgos y controles faltantes.
2) Proponer hardening priorizado.
3) Definir checklist de release y operación.
4) Incluir riesgos, dependencias y rollback.

Entregable requerido:
- Lista priorizada de hardening
- Checklist operativa
- Señales de monitoreo mínimas
- Riesgos y rollback

No implementes código. No cambies otras fases.
```

### Fase 8 — Migration/Cutover

**Objetivo**
- Planificar y validar el paso del sistema actual al CMS nuevo con el menor riesgo posible.

**Entradas**
- Todas las fases previas completadas.
- Estado actual del contenido del repo.
- Reglas de publicación, SEO y operación.

**Tareas exactas**
1. Definir estrategia de coexistencia entre sistema viejo y nuevo.
2. Definir orden de migración de contenido, templates y revisiones.
3. Definir validaciones previas al corte.
4. Definir ventana de corte y criterios de go/no-go.
5. Definir plan de backout si algo falla.
6. Definir validación post-cutover.
7. Definir quién confirma el cierre operativo.

**Salida esperada**
- Plan de migración y cutover paso a paso.
- Lista de validaciones previas y posteriores.
- Plan de rollback de alto nivel.

**Criterios de aceptación**
- Existe un orden claro de corte.
- Hay criterios de go/no-go medibles.
- El rollback está definido antes del corte.
- La validación post-cutover confirma contenido, auth y operación.

**Riesgos**
- Corte incompleto.
- Pérdida de contenido o de versiones.
- SEO o rutas rotas.
- Falta de coordinación entre responsables.

**Rollback**
- Mantener el sistema anterior listo hasta validar el nuevo.
- Definir un punto único de reversión.
- Si falla la validación, volver a la fuente anterior y pausar publicación nueva.

**Prompt para subagente**
```txt
SKILL: Load the relevant repo/documentation skill before starting.

Trabajá SOLO la fase Migration/Cutover del CMS para este repo.

Contexto:
- Repo: prueba-web-noruega
- Objetivo: planificar el corte del CMS nuevo con validaciones y rollback, sin implementar código todavía.
- Dependencias: DB, auth, templates, admin UI, runtime, revisiones y hardening ya definidos.

Tu misión:
1) Diseñar el plan de coexistencia y migración.
2) Definir pasos de corte, validaciones y go/no-go.
3) Proponer rollback operativo.
4) Incluir riesgos y responsables.

Entregable requerido:
- Plan de cutover
- Lista de validaciones
- Criterios go/no-go
- Rollback y riesgos

No implementes código. No cambies otras fases.
```

## 5. Resumen de dependencias

- DB es la base de todas las demás fases.
- Auth depende de DB.
- Templates depende de DB y Auth.
- Admin UI depende de Auth y Templates.
- Content Runtime depende de DB y Templates.
- Revisions UI depende de DB y del modelo de contenido.
- Hardening depende del flujo funcional completo.
- Migration/Cutover depende de todas las fases anteriores.

## 6. Regla operativa final

Si una fase encuentra huecos de otra fase, no la implementes por su cuenta: documenta el bloqueo, cierra el alcance de esa fase y escala el faltante a la fase correcta.
