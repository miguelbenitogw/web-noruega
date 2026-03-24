# Supabase CMS migration

This folder contains the SQL migration for the CMS schema.

## Apply

Option 1: Supabase SQL Editor
1. Open the SQL Editor in Supabase.
2. Paste the migration from `supabase/migrations/20260324_000001_cms_schema.sql`.
3. Run it once.

Option 2: Supabase CLI
1. Add your project connection.
2. Run `supabase db push`.

## What this migration creates

- Enums for content status, entity type, and revision action.
- Helper functions for editor detection and audit handling.
- Tables: `content_editors`, `content_templates`, `content_pages`, `news_posts`, `content_revisions`.
- Updated-at and audit triggers.
- Revision capture trigger for pages and news posts.
- RLS policies, grants, and indexes.
- Starter templates for the four editorial news patterns.

## Post-migration smoke tests

Run these in the Supabase SQL Editor.

### 1) Verify tables and enums exist

```sql
select typname
from pg_type
where typname in (
  'content_status',
  'content_entity_type',
  'content_revision_action'
)
order by typname;

select tablename
from pg_tables
where schemaname = 'public'
  and tablename in (
    'content_editors',
    'content_templates',
    'content_pages',
    'news_posts',
    'content_revisions'
  )
order by tablename;
```

### 2) Verify RLS is enabled

```sql
select c.relname as table_name, c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in (
    'content_editors',
    'content_templates',
    'content_pages',
    'news_posts',
    'content_revisions'
  )
order by c.relname;
```

### 3) Verify starter templates

```sql
select template_key, name, locale, is_starter, is_active
from public.content_templates
order by sort_order, template_key;
```

### 4) Verify policy and grant wiring

```sql
select tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
  and tablename in (
    'content_editors',
    'content_templates',
    'content_pages',
    'news_posts',
    'content_revisions'
  )
order by tablename, policyname;
```

### 5) Insert your first editor row

Replace the values below with your real Supabase auth user id and email.

```sql
insert into public.content_editors (user_id, email, display_name)
values ('00000000-0000-0000-0000-000000000000', 'you@example.com', 'Your Name')
on conflict (user_id) do update
set email = excluded.email,
    display_name = excluded.display_name,
    is_active = true,
    updated_at = now();
```

### 6) Create a draft page and verify audit fields

```sql
insert into public.content_pages (slug, title, excerpt, body, status)
values (
  'test-page',
  'Test page',
  'Short test excerpt.',
  '# Hello\n\nThis is a smoke test.',
  'draft'
)
returning id, slug, status, created_by, updated_by, created_at, updated_at;
```

### 7) Publish the page and verify published_at

```sql
update public.content_pages
set status = 'published'
where slug = 'test-page'
returning id, slug, status, published_at, published_by, updated_by, updated_at;
```

### 8) Verify revision capture

```sql
select content_type, content_id, content_slug, revision_action, version, changed_fields, changed_at
from public.content_revisions
where content_slug = 'test-page'
order by version;
```

### 9) Check public visibility rule

```sql
select slug, status
from public.content_pages
where slug = 'test-page';
```

Expected behavior:
- anonymous users can read only rows with `status = 'published'`.
- authenticated editors can read and manage the CMS tables.
- `content_revisions` is readable only to authenticated editors.
