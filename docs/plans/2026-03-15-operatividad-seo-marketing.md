# Plan Integral de Implementación (Operatividad + SEO + Marketing)

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Dejar la web plenamente operativa en producción y preparada para captación de leads con base SEO sólida.

**Architecture:** Mantener el stack actual React + Vite + Tailwind, corregir bloqueantes técnicos primero (build/lint/tracking/form), después cerrar UX/SEO on-page y finalmente activar palancas de marketing y medición.

**Tech Stack:** React 19, Vite 8, Tailwind CSS, EmailJS (o alternativa), GA4/GTM.

---

## Fase 0 (P0) - Estabilidad de producción

### Task 1: Corregir bloqueo de build en Tailwind
**Files:**
- Modify: `tailwind.config.js`

**Step 1: Corregir estructura duplicada `colors`**
Acción: eliminar la clave `colors` anidada duplicada.

**Step 2: Validar sintaxis**
Run: `cmd /c npm run build`  
Expected: build sin error de parser.

**Step 3: Commit**
Run: `git commit -am "fix: resolve tailwind config parse error"`

### Task 2: Corregir errores de lint críticos
**Files:**
- Modify: `src/components/AnimateIn.jsx`
- Modify: `src/components/Hero.jsx`
- Modify: `src/components/HvaGjor.jsx`
- Modify: `src/components/Partners.jsx`
- Modify: `src/hooks/useCounter.js`
- Modify: `src/hooks/useInView.js`

**Step 1: Resolver `react-hooks/rules-of-hooks` en Hero**
Acción: evitar llamada condicional de `useCounter`.

**Step 2: Eliminar imports/variables no usados**
Acción: limpiar `Tag`, `img`, `textPartners`, `start`.

**Step 3: Resolver warning de dependencias en `useInView`**
Acción: ajustar dependencias o memoizar `options`.

**Step 4: Verificar lint**
Run: `cmd /c npm run lint`  
Expected: 0 errores.

**Step 5: Commit**
Run: `git commit -am "fix: clean lint errors and hook ordering"`

### Task 3: Validación técnica de baseline
**Files:**
- None

**Step 1: Verificar build**
Run: `cmd /c npm run build`  
Expected: `dist/` generado.

**Step 2: Verificar preview local**
Run: `cmd /c npm run preview`  
Expected: sitio navegable sin fallos críticos de consola.

**Step 3: Commit de estado estable**
Run: `git commit --allow-empty -m "chore: baseline stable build and lint"`

---

## Fase 1 (P0) - Funcionalidad real de negocio

### Task 4: Activar formulario de contacto real y seguro
**Files:**
- Modify: `src/components/Kontakt.jsx`
- Create: `.env.example`
- Modify: `.gitignore` (si aplica)

**Step 1: Mover credenciales a variables de entorno**
Acción: sustituir `YOUR_*` por `import.meta.env`.

**Step 2: Añadir validación de configuración**
Acción: mostrar error claro si faltan variables.

**Step 3: Crear `.env.example`**
Acción: documentar claves requeridas sin secretos.

**Step 4: Probar envío end-to-end**
Run: `cmd /c npm run dev`  
Expected: envío exitoso y estado `sent`.

**Step 5: Commit**
Run: `git commit -am "feat: configure contact form with env-based EmailJS"`

### Task 5: Activar analítica real (GA4 o GTM) con consentimiento
**Files:**
- Modify: `index.html`
- Modify: `src/components/CookieConsent.jsx`

**Step 1: Sustituir `G-XXXXXXXXXX` por variable configurable**
Acción: usar enfoque con `VITE_GA_MEASUREMENT_ID`.

**Step 2: Bloquear tracking hasta consentimiento**
Acción: no disparar `gtag('config')` antes de aceptar.

**Step 3: Registrar eventos clave**
Acción: `cta_click`, `contact_submit`, `contact_error`.

**Step 4: Verificar en DebugView**
Expected: eventos visibles solo tras aceptación.

**Step 5: Commit**
Run: `git commit -am "feat: consent-aware analytics and conversion events"`

### Task 6: Sustituir enlaces placeholder por destinos reales
**Files:**
- Modify: `src/components/Footer.jsx`
- Modify: `src/components/Nyheter.jsx`
- Modify: `src/components/Talentportalen.jsx`
- Modify: `src/components/Navbar.jsx` (logo home link)

**Step 1: Reemplazar todos los `href=\"#\"`**
Acción: usar rutas/anchors válidos.

**Step 2: Corregir contacto y redes sociales**
Acción: email, teléfono, Instagram/LinkedIn reales.

**Step 3: Validar accesibilidad de enlaces**
Acción: todos navegables por teclado.

**Step 4: Verificar sin links muertos**
Expected: 0 placeholders en búsqueda.

**Step 5: Commit**
Run: `git commit -am "fix: replace placeholder links with valid destinations"`

---

## Fase 2 (P1) - SEO técnico y on-page

### Task 7: Completar páginas legales mínimas para confianza SEO/E-E-A-T
**Files:**
- Create: `src/pages/Personvern.jsx` (o equivalente)
- Create: `src/pages/Vilkar.jsx`
- Create: `src/pages/Cookies.jsx`
- Modify: navegación/footer para enlazarlas

**Step 1: Crear contenido legal básico real**
Acción: políticas coherentes con cookies/analytics/formulario.

**Step 2: Enlazar desde footer y banner de cookies**
Expected: navegación funcional hacia legal.

**Step 3: Verificar rastreabilidad**
Acción: enlaces internos visibles para crawler.

**Step 4: Commit**
Run: `git commit -am "feat: add legal pages and internal links"`

### Task 8: Mejorar metadatos y datos estructurados
**Files:**
- Modify: `index.html`

**Step 1: Revisar `title` y `description` contra intención comercial**
Acción: incluir propuesta de valor y sector principal.

**Step 2: Ampliar JSON-LD**
Acción: Organization + ContactPoint + sameAs válidos.

**Step 3: Verificar OG/Twitter y canonical**
Expected: preview social correcta.

**Step 4: Commit**
Run: `git commit -am "seo: enhance metadata and structured data"`

### Task 9: Preparar estrategia de indexación para contenido
**Files:**
- Modify: `public/sitemap.xml`
- Modify: `public/robots.txt`

**Step 1: Mantener sitemap consistente con URLs reales**
Acción: incluir nuevas páginas publicadas.

**Step 2: Comprobar canonical y sitemap coherentes**
Expected: URLs finales solo indexables.

**Step 3: Commit**
Run: `git commit -am "seo: update sitemap and robots consistency"`

---

## Fase 3 (P1) - Marketing y conversión

### Task 10: Definir y publicar CTAs orientadas a lead
**Files:**
- Modify: `src/components/Hero.jsx`
- Modify: `src/components/CTABanner.jsx`
- Modify: `src/components/HvaGjor.jsx`
- Modify: `src/components/Helsesektor.jsx`

**Step 1: Unificar propuesta de valor por ICP**
Acción: copy para empleadores (primario) y candidatos (secundario).

**Step 2: Reducir fricción en CTA**
Acción: 1 CTA principal + 1 secundaria por bloque.

**Step 3: Instrumentar clics por CTA**
Expected: evento por cada CTA crítica.

**Step 4: Commit**
Run: `git commit -am "marketing: optimize CTAs and conversion copy"`

### Task 11: Coherencia de pruebas sociales y claims
**Files:**
- Modify: `src/components/Hero.jsx`
- Modify: `src/components/OmOss.jsx`
- Modify: `src/components/Helsesektor.jsx`
- Modify: `src/components/GodeGrunner.jsx`

**Step 1: Unificar cifras (500+/2000+/95%/100+)**
Acción: definir fuente única y no contradictoria.

**Step 2: Añadir contexto verificable**
Acción: periodo temporal y alcance de cada métrica.

**Step 3: Commit**
Run: `git commit -am "marketing: normalize social proof metrics and claims"`

### Task 12: Añadir loop de contenido comercial (noticias/casos)
**Files:**
- Modify: `src/components/Nyheter.jsx`
- Create: estructura para posts/casos (según arquitectura elegida)

**Step 1: Convertir cards en URLs reales**
Acción: artículos/casos con slug.

**Step 2: Añadir CTA contextual por artículo**
Acción: “Solicitar llamada” / “Ver candidatos”.

**Step 3: Commit**
Run: `git commit -am "feat: convert news section into real lead-oriented content hub"`

---

## QA y cierre (P0 obligatorio antes de publicar)

### Task 13: QA funcional, SEO y accesibilidad
**Files:**
- None

**Step 1: Smoke test funcional**
Checklist: formulario, anchors, enlaces, legal, mobile.

**Step 2: Validación técnica**
Run: `cmd /c npm run lint`  
Run: `cmd /c npm run build`

**Step 3: Validación SEO**
Checklist: title/description, sitemap, robots, canonical, schema.

**Step 4: Validación tracking**
Checklist: consentimiento, eventos, conversiones.

### Task 14: Release y monitoreo de primera semana
**Files:**
- None

**Step 1: Deploy**
Acción: publicar build estable.

**Step 2: Configurar dashboard mínimo**
Métricas: sesiones, CVR formulario, CTR CTAs, error rate formulario.

**Step 3: Revisión a 7 días**
Acción: priorizar quick wins según datos reales.

---

## Criterios de “Done” global

- Build y lint en verde.
- Formulario operativo con envío real.
- Analítica activa con consentimiento y eventos de conversión.
- 0 enlaces placeholder.
- Páginas legales publicadas y enlazadas.
- Sitemap/robots/canonical consistentes con URLs finales.
- CTAs medibles y claims de confianza coherentes.

---

## Prioridad de ejecución recomendada (camino crítico)

1. Task 1
2. Task 2
3. Task 3
4. Task 4
5. Task 5
6. Task 6
7. Task 13 (pasada rápida)
8. Task 7
9. Task 8
10. Task 9
11. Task 10
12. Task 11
13. Task 12
14. Task 13 (pasada final)
15. Task 14
