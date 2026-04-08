# Auditoría de texto noruego y esquema Supabase

**Estado:** auditoría estática sobre el esquema local + código fuente.  
**Limitación importante:** el conector MCP de Supabase falló por autenticación en este entorno, así que no pude leer la BBDD live. Sí pude inspeccionar el esquema versionado en el repo y rastrear referencias de tablas/columnas en el código.

## 1) Cómo me conecté

- Intenté usar el MCP declarado en `C:\Users\PC\Desktop\prueba-web-noruega\.mcp.json` para el proyecto `hahqimviirkkzkvmusga`.
- Resultado: fallo de auth/OAuth al inicializar el servidor MCP de Supabase.
- Fallback usado: inspección local del SQL de migración y de los archivos del frontend que leen/escriben contenido.

## 2) Tablas y columnas inspeccionadas

### Esquema visible en `supabase/migrations/20260324_000001_cms_schema.sql`

#### `public.content_editors`
- `email` (text)
- `display_name` (text)

#### `public.content_templates`
- `template_key` (text)
- `name` (text)
- `description` (text)
- `locale` (text)
- `body_template` (text)
- `frontmatter_schema` (jsonb)
- `frontmatter_example` (jsonb)

#### `public.content_pages`
- `locale` (text)
- `slug` (text)
- `title` (text)
- `excerpt` (text)
- `body` (text)
- `seo_title` (text)
- `seo_description` (text)
- `cover_image` (text)
- `metadata` (jsonb)

#### `public.news_posts`
- `locale` (text)
- `slug` (text)
- `title` (text)
- `excerpt` (text)
- `body` (text)
- `tag` (text)
- `read_time` (text)
- `author` (text)
- `seo_title` (text)
- `seo_description` (text)
- `cover_image` (text)
- `metadata` (jsonb)

#### `public.content_revisions`
- `content_slug` (text)
- `content_locale` (text)
- `old_data` (jsonb)
- `new_data` (jsonb)
- `changed_fields` (text[])

### Tabla adicional referenciada por el código

#### `public.content_snapshots`
- Referenciada en `src/lib/contentRemote.js`
- No aparece en la migración local, así que su esquema no quedó auditado aquí.
- Campos usados por el código: `id`, `locale`, `status`, `content` (json/jsonb), `updated_at`, `published_at`

## 3) Top hallazgos con ejemplos

### Hallazgo 1 — Mojibake real en el frontend

**Archivo:** `C:\Users\PC\Desktop\prueba-web-noruega\src\App.jsx:216`

Texto actual:
- `Kontroller adressen eller gÃ¥ tilbake til forsiden.`

Texto correcto:
- `Kontroller adressen eller gå tilbake til forsiden.`

Impacto:
- Es una cadena visible al usuario final.
- Es una corrupción de codificación clara, no una variación de estilo.

---

### Hallazgo 2 — El seed local de la migración se ve correcto

En la migración local, las cadenas noruegas inspeccionadas aparecen bien codificadas cuando se leen como UTF-8 desde Node.

Ejemplo verificado:
- `forhåndsgodkjente kandidater`
- `Språknivå`
- `Målet`

Conclusión:
- El aparente texto roto que mostró PowerShell era un problema de consola/encoding de salida, no un daño real del archivo.
- No encontré mojibake en la migración local.

---

### Hallazgo 3 — La app usa una tabla que no está en la migración local

**Archivo:** `C:\Users\PC\Desktop\prueba-web-noruega\src\lib\contentRemote.js`

- La app lee/escribe `content_snapshots`.
- Esa tabla no aparece en `supabase/migrations/20260324_000001_cms_schema.sql`.

Impacto:
- Puede existir en la BBDD live y contener texto que no pude auditar.
- También puede significar que la migración local está incompleta respecto del esquema real.

## 4) Riesgos

- **Sin acceso live a Supabase**, no pude verificar filas reales, PKs ni valores concretos de la BBDD.
- **Campos JSON/array** como `metadata`, `old_data`, `new_data` y `changed_fields` pueden esconder texto corrupto dentro de estructuras anidadas.
- **Corrección ciega** de caracteres puede romper texto válido si hay contenido transliterado a propósito o mezcla de idiomas.
- **`content_snapshots`** necesita revisión aparte porque no está modelada en la migración local.

## 5) Recomendación para corrección masiva segura

### Paso 1 — Reintentar lectura de la BBDD live

Cuando Supabase MCP esté disponible, ejecutar un scan read-only de todas las columnas textuales y de JSON/texto anidado.

### Paso 2 — Dry-run de detección

Usar una consulta que devuelva:
- tabla
- columna
- PK
- valor actual
- coincidencia detectada

Patrones mínimos a buscar:
- `Ã`
- `Â`
- `�`
- combinaciones típicas de mojibake en noruego (`gÃ¥`, `sÃ¸`, `forhÃ¥nd`, etc.)

### Paso 3 — Backup antes de tocar datos

Crear una tabla de respaldo por cada tabla afectada o un dump lógico antes del update.

### Paso 4 — Update transaccional

Aplicar correcciones en una transacción y registrar:
- fila original
- valor nuevo
- campo modificado
- timestamp de cambio

### Paso 5 — Verificación posterior

Re-ejecutar el scan y confirmar:
- 0 coincidencias mojibake en las columnas tocadas
- no se modificaron filas fuera del conjunto esperado

## SQL de referencia para el dry-run

```sql
-- Ejemplo de inspección para columnas textuales.
-- Requiere adaptar por tabla/columna y por la BBDD live.
select
  'public.news_posts' as table_name,
  id,
  'title' as column_name,
  title as current_value
from public.news_posts
where title ~ '[ÃÂ�]'
union all
select
  'public.content_pages',
  id,
  'body',
  body
from public.content_pages
where body ~ '[ÃÂ�]';
```

## Conclusión

- Hay **un error real y concreto** para corregir ya: `src/App.jsx:216`.
- La migración local no muestra corrupción en las cadenas noruegas inspeccionadas.
- Falta el paso crítico: **leer la BBDD live** para confirmar si hay filas con mojibake o caracteres raros en `content_snapshots`, `content_pages`, `news_posts`, `content_templates` y `content_revisions`.
