# Auditoría de normalización lingüística noruega

## Contexto

Se pidió limpiar la base del proyecto Supabase corrigiendo texto en noruego mal codificado, caracteres raros y posibles errores de escritura.

### Estado real de la verificación

- La conexión al MCP de Supabase falló por autenticación/OAuth, así que **no pude leer la base viva** desde este entorno.
- Sí pude inspeccionar el esquema local del proyecto en `supabase/migrations/20260324_000001_cms_schema.sql`.
- Ese archivo ya muestra texto noruego con mojibake claro, así que el problema existe al menos en el seed/migración.

---

## 1) Reglas lingüísticas propuestas

### A. Corregir mojibake UTF-8 ↔ Latin-1

Patrones típicos detectados:

- `Ã¥` → `å`
- `Ã¸` → `ø`
- `Ã¦` → `æ`
- `Ã…` → `Å`
- `Ã˜` → `Ø`
- `Ã†` → `Æ`
- `Ã©` → `é`
- `Ã¤` / `Ã¶` / `Ã¼` cuando aparezcan en contenido que debería ser noruego

Esto no es “estilo”: es codificación rota. Hay que corregirlo siempre que el texto sea claramente noruego.

### B. Corregir letras perdidas en palabras noruegas

Patrones observados en el seed:

- `sprÃ¥k` → `språk`
- `forhÃ¥ndsgodkjente` → `forhåndsgodkjente`
- `sÃ¸ke` → `søke`
- `MÃ¥let` → `Målet`
- `vÃ¥re` → `våre`
- `stÃ¸tte` → `støtte`
- `fÃ¸r` → `før`
- `mÃ¥` → `må`
- `bÃ¦rekraftige` → `bærekraftige`

### C. Normalización ortográfica noruega

Además del encoding, hay texto que está “bien codificado pero mal escrito”:

- `Innkjopsgrensen` → `Innkjøpsgrensen`
- `gjor` → `gjør`
- `faar` → `får`
- `bor` → `bør`
- `ma` → `må`
- `loses` → `løses`
- `forste` → `første`
- `sprak` → `språk`
- `niva` → `nivå`
- `nivaa` → `nivå`
- `arbeidsmiljo` → `arbeidsmiljø`

### D. Mantener la variante lingüística consistente

En este proyecto el contenido parece apuntar a **noruego bokmål**:

- `arbeidsgiver`, `kandidat`, `språk`, `nivå`, `løsning`, `oppfølging`

No conviene mezclarlo con formas de nynorsk o con formas “neutralizadas” sin revisar:

- Si aparecen formas como `høyrer`, `ikkje`, `morgon`, `veke`, `frå`, hay que revisar caso por caso.

---

## 2) Diccionario / patrones de reemplazo recomendados

### Reemplazos seguros de encoding

| Antes | Después |
|---|---|
| `Ã¥` | `å` |
| `Ã¸` | `ø` |
| `Ã¦` | `æ` |
| `Ã…` | `Å` |
| `Ã˜` | `Ø` |
| `Ã†` | `Æ` |

### Reemplazos léxicos frecuentes en noruego

| Antes | Después |
|---|---|
| `sprak` | `språk` |
| `spraknivaa` | `språknivå` |
| `niva` | `nivå` |
| `nivaa` | `nivå` |
| `gjor` | `gjør` |
| `forste` | `første` |
| `faar` | `får` |
| `bor` | `bør` |
| `loses` | `løses` |
| `arbeidsmiljo` | `arbeidsmiljø` |
| `innkjopsgrense` | `innkjøpsgrense` |
| `innkjopsgrensen` | `innkjøpsgrensen` |

### Reemplazos de frases observadas en el seed

| Antes | Después |
|---|---|
| `sÃ¸ke gjennom forhÃ¥ndsgodkjente kandidater` | `søke gjennom forhåndsgodkjente kandidater` |
| `MÃ¥let er a` | `Målet er å` |
| `a redusere` | `å redusere` |
| `raskere beslutningslop` | `raskere beslutningsløp` |
| `sprÃ¥k- og kvalitetskrav` | `språk- og kvalitetskrav` |

### Regla técnica recomendada

No aplicar reemplazos ciegos sobre todo el texto sin contexto. Mejor:

1. Detectar texto sospechoso.
2. Clasificar por tabla/columna/fila.
3. Generar `before/after` candidate list.
4. Aprobar manualmente los casos ambiguos.

---

## 3) Qué requiere revisión humana sí o sí

Hay tres grupos que no deberían tocarse automáticamente:

### A. Nombres propios

- `Global Working`
- `Sor-Fron kommune`
- nombres de personas, empresas, ciudades, marcas

### B. Texto con posible intención estilística

- títulos de marketing
- claims
- frases que podrían estar “correctas” desde el punto de vista comercial aunque no sean la variante más purista

### C. Casos ambiguos de traducción

- `langsiktige` vs sinónimos aceptables
- `kvalitetskrav` en contexto legal o editorial
- palabras que pueden estar en bokmål pero sonar raras si se corrigen de más

Regla práctica: si una corrección cambia el significado, el tono o la marca, **la mira una persona**.

---

## 4) SQL / estrategia de dry-run para estimar impacto

### A. Inventario de columnas de texto

Primero identificar columnas candidatas:

```sql
select table_schema, table_name, column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and data_type in ('text', 'character varying', 'character')
order by table_name, ordinal_position;
```

### B. Detección de mojibake y texto noruego sospechoso

Buscar secuencias típicas:

```sql
select 'content_pages' as table_name, id, slug, title as sample
from public.content_pages
where title ~ 'Ã|sprak|niva|gjor|faar|bor|loses|arbeidsmiljo'
   or excerpt ~ 'Ã|sprak|niva|gjor|faar|bor|loses|arbeidsmiljo'
   or body ~ 'Ã|sprak|niva|gjor|faar|bor|loses|arbeidsmiljo'
union all
select 'news_posts', id, slug, title
from public.news_posts
where title ~ 'Ã|sprak|niva|gjor|faar|bor|loses|arbeidsmiljo'
   or excerpt ~ 'Ã|sprak|niva|gjor|faar|bor|loses|arbeidsmiljo'
   or body ~ 'Ã|sprak|niva|gjor|faar|bor|loses|arbeidsmiljo';
```

### C. Dry-run de reemplazos por columna

Ejemplo con `content_pages`:

```sql
with candidate_rows as (
  select
    id,
    slug,
    title,
    excerpt,
    body,
    regexp_replace(body, 'Ã¥', 'å', 'g') as body_fix_1,
    regexp_replace(body, 'Ã¸', 'ø', 'g') as body_fix_2
  from public.content_pages
  where body ~ 'Ã|sprak|niva|gjor|faar|bor|loses|arbeidsmiljo'
)
select *
from candidate_rows
order by slug;
```

### D. Estimación de impacto

Antes de hacer UPDATE:

```sql
select
  count(*) as affected_rows
from public.news_posts
where title ~ 'Ã|sprak|niva|gjor|faar|bor|loses|arbeidsmiljo'
   or excerpt ~ 'Ã|sprak|niva|gjor|faar|bor|loses|arbeidsmiljo'
   or body ~ 'Ã|sprak|niva|gjor|faar|bor|loses|arbeidsmiljo';
```

### E. Patrón de update seguro

Usar una transacción y guardar un backup lógico previo:

```sql
begin;

create table if not exists public._cleanup_backup_news_posts as
select *
from public.news_posts
where false;

insert into public._cleanup_backup_news_posts
select *
from public.news_posts
where title ~ 'Ã|sprak|niva|gjor|faar|bor|loses|arbeidsmiljo'
   or excerpt ~ 'Ã|sprak|niva|gjor|faar|bor|loses|arbeidsmiljo'
   or body ~ 'Ã|sprak|niva|gjor|faar|bor|loses|arbeidsmiljo';

-- aplicar updates aquí, siempre columna por columna

commit;
```

### F. Rollback

Rollback lógico por tabla:

```sql
begin;

update public.news_posts n
set
  title = b.title,
  excerpt = b.excerpt,
  body = b.body
from public._cleanup_backup_news_posts b
where n.id = b.id;

commit;
```

---

## Recomendación final

La limpieza correcta no es “buscar y reemplazar a ciegas”. Primero hay que:

1. detectar columnas de texto,
2. identificar mojibake real,
3. separar corrección ortográfica de corrección de encoding,
4. hacer dry-run con conteo de filas,
5. aplicar en transacción,
6. validar con diff antes/después.

El seed de la migración ya confirma que hay material para corregir. Falta la conexión viva a Supabase para convertir esto en un plan de updates real.

