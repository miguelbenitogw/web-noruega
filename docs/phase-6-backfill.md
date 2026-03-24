# Phase 6 Backfill

Date: 2026-03-24  
Scope: `content_snapshots` seed for locale `nb`

## Purpose

Backfill the CMS snapshot table with the current site content from `src/data/siteContent.js` so the database has both the published and draft rows before cutover.

## Generated artifact

Run the generator from the repo root:

```bash
node scripts/generate-content-backfill-sql.mjs
```

That writes:

```text
docs/sql/content-backfill.sql
```

The SQL is deterministic for a given `src/data/siteContent.js` input and upserts:

- `locale = 'nb'`, `status = 'published'`
- `locale = 'nb'`, `status = 'draft'`

Both rows carry the full JSON snapshot.

## Verification

After running the SQL in Supabase, verify both rows exist with:

```sql
select
  locale,
  status,
  updated_at,
  published_at,
  jsonb_object_length(content) as top_level_sections
from public.content_snapshots
where locale = 'nb'
order by status;
```

Expected result:

- Two rows returned
- One row with `status = 'draft'`
- One row with `status = 'published'`
- `top_level_sections` matches the current top-level keys in `src/data/siteContent.js`
