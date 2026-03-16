# Plan de Implementación: Sistema de Actualización de Noticias

Fecha: 2026-03-16  
Proyecto: `prueba-web-noruega`

## 1. Contexto actual

Estado detectado:
1. El bloque de noticias está hardcodeado en [Nyheter.jsx](c:\Users\PC\Desktop\prueba-web-noruega\src\components\Nyheter.jsx).
2. Para publicar una noticia nueva hoy hay que editar código y redeployar.
3. No existe flujo editorial formal, estado de publicación, ni validación SEO por noticia.

Problema a resolver:
1. Permitir actualizar noticias de forma rápida y segura.
2. Mantener calidad SEO y consistencia de marca.
3. Evitar dependencia técnica para cambios editoriales simples.

## 2. Objetivo del sistema

Construir una forma de gestionar noticias que permita:
1. Crear, editar, programar y publicar noticias.
2. Mostrar automáticamente “últimas noticias” en portada.
3. Tener página de detalle por noticia (`/nyheter/:slug`).
4. Mejorar indexación SEO (metadata, schema, sitemap).

## 3. Opciones técnicas posibles

## Opción A (Recomendada): Markdown + Git + Build (sin backend nuevo)

Descripción:
1. Guardar cada noticia como archivo Markdown/MDX en `content/news/`.
2. Leer contenido en build con Vite (o generador de contenido simple).
3. Renderizar lista y detalle desde esos archivos.

Pros:
1. Muy barato y estable.
2. Versionado automático con Git.
3. Fácil QA y rollback.

Contras:
1. Requiere commit/deploy para publicar.
2. Menos cómodo para perfiles no técnicos (si no hay CMS visual).

## Opción B: Headless CMS (Sanity/Contentful/Strapi/Notion API)

Descripción:
1. Editor actualiza noticias en CMS.
2. Web consume API en build o runtime.

Pros:
1. Flujo editorial no técnico.
2. Programación de publicaciones, borradores y roles.

Contras:
1. Más complejidad.
2. Coste y dependencia externa.

## Opción C: Fuente externa/RSS automática

Descripción:
1. Ingesta de feed externo y render automático.

Pros:
1. Automatiza volumen alto.

Contras:
1. Menor control de calidad y tono.
2. Riesgo SEO de contenido duplicado.

## Decisión recomendada

Implementar **Opción A + panel editorial ligero en fase 2**:
1. Fase 1: Markdown versionado + rutas de detalle + SEO técnico.
2. Fase 2: UI interna simple o integración Decap/Notion para edición sin código.

## 4. Requisitos funcionales

1. Crear noticia con campos obligatorios:
   - `slug`, `title`, `excerpt`, `date`, `tag`, `readTime`, `coverImage`, `content`.
2. Listado de noticias ordenado por fecha descendente.
3. Destacar la última noticia en formato “featured”.
4. Página de detalle por `slug`.
5. Noticias relacionadas por `tag`.
6. Estado editorial:
   - `draft` | `published`.
7. Programación opcional:
   - `publishAt`.
8. Búsqueda/filtro por tag (fase 2).
9. Eventos analytics:
   - `news_open`, `news_read_more_click`, `news_filter_tag`.

## 5. Requisitos no funcionales

1. SEO:
   - `<title>` y meta description por noticia.
   - Open Graph/Twitter tags.
   - Schema `NewsArticle`.
   - Inclusión en `sitemap.xml`.
2. Performance:
   - Imagen optimizada y lazy loading.
   - No bloquear render principal.
3. Calidad:
   - Lint/validación de frontmatter en CI.
4. Seguridad:
   - Sanitizar contenido renderizado (si acepta HTML).
5. Accesibilidad:
   - Jerarquía de headings y alt text obligatorio.

## 6. Modelo de contenido propuesto

Ejemplo frontmatter:

```md
---
slug: "kandidatportal-lansert"
title: "Ny kandidatportal lansert"
excerpt: "Vi lanserer en ny digital plattform..."
date: "2026-03-10"
tag: "Plattform"
readTime: "3 min"
coverImage: "/images/news/kandidatportal.jpg"
status: "published"
publishAt: "2026-03-10T08:00:00Z"
author: "Global Working"
seoTitle: "Ny kandidatportal lansert | Global Working"
seoDescription: "Alt om den nye kandidatportalen..."
---
Contenido completo de la noticia...
```

## 7. Arquitectura técnica propuesta

Estructura:
1. `content/news/*.md` (fuente editorial).
2. `src/lib/news.ts|js` (loader + parser + validación).
3. `src/pages/news/NewsList.jsx` (opcional, si se separa de home).
4. `src/pages/news/NewsDetail.jsx`.
5. `src/components/Nyheter.jsx` consumiendo datos dinámicos, no hardcoded.

Flujo:
1. Editor crea archivo markdown.
2. CI valida frontmatter.
3. Build genera páginas y metadata.
4. Deploy publica automáticamente.

## 8. Plan por fases

## Fase 1: Base dinámica (MVP)

1. Extraer array hardcoded de `Nyheter.jsx`.
2. Crear colección `content/news`.
3. Implementar parser/loader de noticias.
4. Renderizar home desde colección.
5. Agregar ruta detalle `/nyheter/:slug`.
6. Tracking básico de eventos de noticias.

Entregables:
1. Home con noticias dinámicas.
2. Página de detalle funcional.
3. Documentación de alta de noticia.

## Fase 2: SEO y operativa editorial

1. Metadata dinámica por noticia.
2. JSON-LD `NewsArticle`.
3. Actualización de sitemap.
4. Checklist editorial pre-publicación.
5. QA automatizada de campos SEO.

Entregables:
1. Plantilla SEO por noticia.
2. Cobertura sitemap y schema.

## Fase 3: Escalado de edición (opcional)

1. Integrar CMS liviano (Decap/Notion/Sanity).
2. Roles editor/reviewer.
3. Programación de publicación.

Entregables:
1. Flujo sin tocar código para negocio.

## 9. Skills recomendadas (según tipo de trabajo)

Producto y contenido:
1. `content-creator` -> calendario editorial y tono.
2. `seo-content-writer` -> redacción optimizada por intención.
3. `seo-meta-optimizer` -> titles/descriptions por noticia.
4. `seo-structure-architect` -> headings e internal linking.
5. `schema-markup` -> JSON-LD validable.

Frontend y arquitectura:
1. `frontend-developer` -> componentes y rutas.
2. `react-patterns` -> separación de capa de datos y UI.
3. `web-performance-optimization` -> imágenes y carga eficiente.

Calidad, seguridad y delivery:
1. `testing-patterns` -> tests de parser y render.
2. `security-review` -> sanitización de contenido.
3. `github-actions-templates` -> validación CI.
4. `readme` -> documentación operativa de publicación.

Medición:
1. `analytics-tracking` -> eventos de lectura y CTR.
2. `seo-audit` -> revisión final post-lanzamiento.

## 10. Criterios de aceptación

1. Se puede publicar una noticia nueva sin editar `Nyheter.jsx`.
2. La home muestra automáticamente la última noticia destacada.
3. Cada noticia tiene URL única indexable.
4. Metadata y schema válidos en al menos 3 noticias de prueba.
5. Evento `news_open` llega a GA4 con status OK.

## 11. Riesgos y mitigación

1. Riesgo: inconsistencia de frontmatter.
   - Mitigación: validación estricta en CI.
2. Riesgo: degradación SEO por títulos duplicados.
   - Mitigación: reglas y checklist editorial.
3. Riesgo: contenido largo rompe layout.
   - Mitigación: estilos tipográficos para contenido rico.
4. Riesgo: dependencia de una persona para publicar.
   - Mitigación: documentación + flujo de revisión.

## 12. Backlog inicial (orden sugerido)

1. Crear `content/news` + 4 noticias actuales migradas.
2. Implementar loader y reemplazar hardcoded en home.
3. Crear plantilla de detalle por slug.
4. Añadir metadata dinámica y schema.
5. Añadir tracking de eventos de noticias.
6. CI con validación de contenido y lint.
7. Manual editorial en `docs/`.

## 13. Estimación de esfuerzo

1. Fase 1: 1-2 días.
2. Fase 2: 1 día.
3. Fase 3 (CMS opcional): 2-5 días según herramienta.

Total recomendado para primera versión sólida: **2-3 días**.

