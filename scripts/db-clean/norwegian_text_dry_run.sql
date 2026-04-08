-- Dry-run: detectar y previsualizar texto noruego mal codificado o mal escrito.
-- Pensado para Supabase SQL Editor o psql conectado al proyecto.

begin;

create or replace function public._cleanup_table_exists(p_table_name text)
returns boolean
language sql
stable
as $$
  select to_regclass(p_table_name) is not null;
$$;

create or replace function public._cleanup_column_exists(p_table_name text, p_column_name text)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from information_schema.columns c
    where c.table_schema = split_part(p_table_name, '.', 1)
      and c.table_name = split_part(p_table_name, '.', 2)
      and c.column_name = p_column_name
  );
$$;

create or replace function public._cleanup_normalize_norwegian_text(p_input text)
returns text
language plpgsql
immutable
as $$
declare
  v text;
begin
  if p_input is null then
    return null;
  end if;

  v := p_input;

  -- Common mojibake / punctuation fixes.
  v := replace(v, 'Ã¥', 'å');
  v := replace(v, 'Ã¸', 'ø');
  v := replace(v, 'Ã¦', 'æ');
  v := replace(v, 'Ã…', 'Å');
  v := replace(v, 'Ã˜', 'Ø');
  v := replace(v, 'Ã†', 'Æ');
  v := replace(v, 'â€™', '''');
  v := replace(v, 'â€œ', '"');
  v := replace(v, 'â€', '"');
  v := replace(v, 'â€“', '–');
  v := replace(v, 'â€”', '—');
  v := replace(v, 'Â ', ' ');

  -- Lexical fixes seen in the project seed/content.
  v := regexp_replace(v, '\mInnkjopsgrensen\M', 'Innkjøpsgrensen', 'g');
  v := regexp_replace(v, '\mInnkjopsgrense\M', 'Innkjøpsgrense', 'g');
  v := regexp_replace(v, '\mSprak\M', 'Språk', 'g');
  v := regexp_replace(v, '\msprak\M', 'språk', 'g');
  v := regexp_replace(v, '\mSprakniva\M', 'Språknivå', 'g');
  v := regexp_replace(v, '\msprakniva\M', 'språknivå', 'g');
  v := regexp_replace(v, '\mNivaa\M', 'Nivå', 'g');
  v := regexp_replace(v, '\mnivaa\M', 'nivå', 'g');
  v := regexp_replace(v, '\mNiva\M', 'Nivå', 'g');
  v := regexp_replace(v, '\mniva\M', 'nivå', 'g');
  v := regexp_replace(v, '\mGjor\M', 'Gjør', 'g');
  v := regexp_replace(v, '\mgjor\M', 'gjør', 'g');
  v := regexp_replace(v, '\mFaar\M', 'Får', 'g');
  v := regexp_replace(v, '\mfaar\M', 'får', 'g');
  v := regexp_replace(v, '\mBor\M', 'Bør', 'g');
  v := regexp_replace(v, '\mbor\M', 'bør', 'g');
  v := regexp_replace(v, '\mLoses\M', 'Løses', 'g');
  v := regexp_replace(v, '\mloses\M', 'løses', 'g');
  v := regexp_replace(v, '\mForste\M', 'Første', 'g');
  v := regexp_replace(v, '\mforste\M', 'første', 'g');
  v := regexp_replace(v, '\mArbeidsmiljo\M', 'Arbeidsmiljø', 'g');
  v := regexp_replace(v, '\marbeidsmiljo\M', 'arbeidsmiljø', 'g');
  v := regexp_replace(v, '\mOppfolgning\M', 'Oppfølging', 'g');
  v := regexp_replace(v, '\moppfolgning\M', 'oppfølging', 'g');
  v := regexp_replace(v, '\mOppfolging\M', 'Oppfølging', 'g');
  v := regexp_replace(v, '\moppfolging\M', 'oppfølging', 'g');
  v := regexp_replace(v, '\mForhandsgodkjente\M', 'Forhåndsgodkjente', 'g');
  v := regexp_replace(v, '\mforhandsgodkjente\M', 'forhåndsgodkjente', 'g');
  v := regexp_replace(v, '\mSoke\M', 'Søke', 'g');
  v := regexp_replace(v, '\msoke\M', 'søke', 'g');

  return v;
end;
$$;

create or replace function public._cleanup_normalize_norwegian_jsonb(p_input jsonb)
returns jsonb
language plpgsql
immutable
as $$
declare
  v jsonb;
begin
  if p_input is null then
    return null;
  end if;

  case jsonb_typeof(p_input)
    when 'string' then
      return to_jsonb(public._cleanup_normalize_norwegian_text(p_input #>> '{}'));
    when 'array' then
      select coalesce(jsonb_agg(public._cleanup_normalize_norwegian_jsonb(value) order by ord), '[]'::jsonb)
        into v
      from jsonb_array_elements(p_input) with ordinality as arr(value, ord);
      return v;
    when 'object' then
      select coalesce(jsonb_object_agg(key, public._cleanup_normalize_norwegian_jsonb(value)), '{}'::jsonb)
        into v
      from jsonb_each(p_input);
      return v;
    else
      return p_input;
  end case;
end;
$$;

create or replace function public._cleanup_text_has_issue(p_input text)
returns boolean
language sql
stable
as $$
  select coalesce(p_input, '') ~ '(Ã|Â|�|(?i)\m(?:sprak|sprakniva|nivaa|niva|gjor|faar|bor|loses|arbeidsmiljo|oppfolgning|oppfolging|forste|forhandsgodkjente|soke|innkjopsgrens(?:en)?)\M)';
$$;

create or replace function public._cleanup_jsonb_has_issue(p_input jsonb)
returns boolean
language sql
stable
as $$
  select coalesce(p_input::text, '') ~ '(Ã|Â|�|(?i)\m(?:sprak|sprakniva|nivaa|niva|gjor|faar|bor|loses|arbeidsmiljo|oppfolgning|oppfolging|forste|forhandsgodkjente|soke|innkjopsgrens(?:en)?)\M)';
$$;

create temp table if not exists cleanup_counts (
  table_name text not null,
  column_name text not null,
  affected_rows bigint not null
) on commit drop;

create temp table if not exists cleanup_samples (
  table_name text not null,
  record_key text not null,
  field_name text not null,
  original text not null,
  cleaned text not null
) on commit drop;

select 'preflight' as section, table_name, exists_flag
from (
  values
    ('public.content_snapshots', public._cleanup_table_exists('public.content_snapshots')),
    ('public.content_editors', public._cleanup_table_exists('public.content_editors')),
    ('public.content_templates', public._cleanup_table_exists('public.content_templates')),
    ('public.content_pages', public._cleanup_table_exists('public.content_pages')),
    ('public.news_posts', public._cleanup_table_exists('public.news_posts')),
    ('public.content_revisions', public._cleanup_table_exists('public.content_revisions'))
) as t(table_name, exists_flag)
order by table_name;

select table_schema, table_name, column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and data_type in ('text', 'character varying', 'character', 'jsonb')
order by table_name, ordinal_position;

do $$
begin
  if public._cleanup_table_exists('public.content_snapshots') and public._cleanup_column_exists('public.content_snapshots', 'content') then
    insert into cleanup_counts (table_name, column_name, affected_rows)
    select 'content_snapshots', 'content', count(*)
    from public.content_snapshots
    where public._cleanup_jsonb_has_issue(content);

    insert into cleanup_samples (table_name, record_key, field_name, original, cleaned)
    select
      'content_snapshots',
      id::text,
      'content',
      content::text,
      public._cleanup_normalize_norwegian_jsonb(content)::text
    from public.content_snapshots
    where public._cleanup_jsonb_has_issue(content)
    order by updated_at desc nulls last, id
    limit 20;
  end if;

  if public._cleanup_table_exists('public.content_templates') then
    if public._cleanup_column_exists('public.content_templates', 'name') then
      insert into cleanup_counts (table_name, column_name, affected_rows)
      select 'content_templates', 'name', count(*)
      from public.content_templates
      where public._cleanup_text_has_issue(name);

      insert into cleanup_samples (table_name, record_key, field_name, original, cleaned)
      select 'content_templates', id::text, 'name', name, public._cleanup_normalize_norwegian_text(name)
      from public.content_templates
      where public._cleanup_text_has_issue(name)
      order by updated_at desc nulls last, id
      limit 20;
    end if;

    if public._cleanup_column_exists('public.content_templates', 'description') then
      insert into cleanup_counts (table_name, column_name, affected_rows)
      select 'content_templates', 'description', count(*)
      from public.content_templates
      where public._cleanup_text_has_issue(description);

      insert into cleanup_samples (table_name, record_key, field_name, original, cleaned)
      select 'content_templates', id::text, 'description', description, public._cleanup_normalize_norwegian_text(description)
      from public.content_templates
      where public._cleanup_text_has_issue(description)
      order by updated_at desc nulls last, id
      limit 20;
    end if;

    if public._cleanup_column_exists('public.content_templates', 'body_template') then
      insert into cleanup_counts (table_name, column_name, affected_rows)
      select 'content_templates', 'body_template', count(*)
      from public.content_templates
      where public._cleanup_text_has_issue(body_template);

      insert into cleanup_samples (table_name, record_key, field_name, original, cleaned)
      select 'content_templates', id::text, 'body_template', body_template, public._cleanup_normalize_norwegian_text(body_template)
      from public.content_templates
      where public._cleanup_text_has_issue(body_template)
      order by updated_at desc nulls last, id
      limit 20;
    end if;

    if public._cleanup_column_exists('public.content_templates', 'frontmatter_example') then
      insert into cleanup_counts (table_name, column_name, affected_rows)
      select 'content_templates', 'frontmatter_example', count(*)
      from public.content_templates
      where public._cleanup_jsonb_has_issue(frontmatter_example);

      insert into cleanup_samples (table_name, record_key, field_name, original, cleaned)
      select
        'content_templates',
        id::text,
        'frontmatter_example',
        frontmatter_example::text,
        public._cleanup_normalize_norwegian_jsonb(frontmatter_example)::text
      from public.content_templates
      where public._cleanup_jsonb_has_issue(frontmatter_example)
      order by updated_at desc nulls last, id
      limit 20;
    end if;

    if public._cleanup_column_exists('public.content_templates', 'frontmatter_schema') then
      insert into cleanup_counts (table_name, column_name, affected_rows)
      select 'content_templates', 'frontmatter_schema', count(*)
      from public.content_templates
      where public._cleanup_jsonb_has_issue(frontmatter_schema);

      insert into cleanup_samples (table_name, record_key, field_name, original, cleaned)
      select
        'content_templates',
        id::text,
        'frontmatter_schema',
        frontmatter_schema::text,
        public._cleanup_normalize_norwegian_jsonb(frontmatter_schema)::text
      from public.content_templates
      where public._cleanup_jsonb_has_issue(frontmatter_schema)
      order by updated_at desc nulls last, id
      limit 20;
    end if;
  end if;

  if public._cleanup_table_exists('public.content_pages') then
    if public._cleanup_column_exists('public.content_pages', 'title') then
      insert into cleanup_counts (table_name, column_name, affected_rows)
      select 'content_pages', 'title', count(*)
      from public.content_pages
      where public._cleanup_text_has_issue(title);

      insert into cleanup_samples (table_name, record_key, field_name, original, cleaned)
      select 'content_pages', id::text, 'title', title, public._cleanup_normalize_norwegian_text(title)
      from public.content_pages
      where public._cleanup_text_has_issue(title)
      order by updated_at desc nulls last, id
      limit 20;
    end if;

    if public._cleanup_column_exists('public.content_pages', 'excerpt') then
      insert into cleanup_counts (table_name, column_name, affected_rows)
      select 'content_pages', 'excerpt', count(*)
      from public.content_pages
      where public._cleanup_text_has_issue(excerpt);

      insert into cleanup_samples (table_name, record_key, field_name, original, cleaned)
      select 'content_pages', id::text, 'excerpt', excerpt, public._cleanup_normalize_norwegian_text(excerpt)
      from public.content_pages
      where public._cleanup_text_has_issue(excerpt)
      order by updated_at desc nulls last, id
      limit 20;
    end if;

    if public._cleanup_column_exists('public.content_pages', 'body') then
      insert into cleanup_counts (table_name, column_name, affected_rows)
      select 'content_pages', 'body', count(*)
      from public.content_pages
      where public._cleanup_text_has_issue(body);

      insert into cleanup_samples (table_name, record_key, field_name, original, cleaned)
      select 'content_pages', id::text, 'body', left(body, 400), left(public._cleanup_normalize_norwegian_text(body), 400)
      from public.content_pages
      where public._cleanup_text_has_issue(body)
      order by updated_at desc nulls last, id
      limit 20;
    end if;

    if public._cleanup_column_exists('public.content_pages', 'seo_title') then
      insert into cleanup_counts (table_name, column_name, affected_rows)
      select 'content_pages', 'seo_title', count(*)
      from public.content_pages
      where public._cleanup_text_has_issue(seo_title);
    end if;

    if public._cleanup_column_exists('public.content_pages', 'seo_description') then
      insert into cleanup_counts (table_name, column_name, affected_rows)
      select 'content_pages', 'seo_description', count(*)
      from public.content_pages
      where public._cleanup_text_has_issue(seo_description);
    end if;

    if public._cleanup_column_exists('public.content_pages', 'metadata') then
      insert into cleanup_counts (table_name, column_name, affected_rows)
      select 'content_pages', 'metadata', count(*)
      from public.content_pages
      where public._cleanup_jsonb_has_issue(metadata);

      insert into cleanup_samples (table_name, record_key, field_name, original, cleaned)
      select
        'content_pages',
        id::text,
        'metadata',
        metadata::text,
        public._cleanup_normalize_norwegian_jsonb(metadata)::text
      from public.content_pages
      where public._cleanup_jsonb_has_issue(metadata)
      order by updated_at desc nulls last, id
      limit 20;
    end if;
  end if;

  if public._cleanup_table_exists('public.news_posts') then
    if public._cleanup_column_exists('public.news_posts', 'title') then
      insert into cleanup_counts (table_name, column_name, affected_rows)
      select 'news_posts', 'title', count(*)
      from public.news_posts
      where public._cleanup_text_has_issue(title);
    end if;

    if public._cleanup_column_exists('public.news_posts', 'excerpt') then
      insert into cleanup_counts (table_name, column_name, affected_rows)
      select 'news_posts', 'excerpt', count(*)
      from public.news_posts
      where public._cleanup_text_has_issue(excerpt);
    end if;

    if public._cleanup_column_exists('public.news_posts', 'body') then
      insert into cleanup_counts (table_name, column_name, affected_rows)
      select 'news_posts', 'body', count(*)
      from public.news_posts
      where public._cleanup_text_has_issue(body);
    end if;

    if public._cleanup_column_exists('public.news_posts', 'tag') then
      insert into cleanup_counts (table_name, column_name, affected_rows)
      select 'news_posts', 'tag', count(*)
      from public.news_posts
      where public._cleanup_text_has_issue(tag);
    end if;

    if public._cleanup_column_exists('public.news_posts', 'author') then
      insert into cleanup_counts (table_name, column_name, affected_rows)
      select 'news_posts', 'author', count(*)
      from public.news_posts
      where public._cleanup_text_has_issue(author);
    end if;

    if public._cleanup_column_exists('public.news_posts', 'seo_title') then
      insert into cleanup_counts (table_name, column_name, affected_rows)
      select 'news_posts', 'seo_title', count(*)
      from public.news_posts
      where public._cleanup_text_has_issue(seo_title);
    end if;

    if public._cleanup_column_exists('public.news_posts', 'seo_description') then
      insert into cleanup_counts (table_name, column_name, affected_rows)
      select 'news_posts', 'seo_description', count(*)
      from public.news_posts
      where public._cleanup_text_has_issue(seo_description);
    end if;

    if public._cleanup_column_exists('public.news_posts', 'metadata') then
      insert into cleanup_counts (table_name, column_name, affected_rows)
      select 'news_posts', 'metadata', count(*)
      from public.news_posts
      where public._cleanup_jsonb_has_issue(metadata);

      insert into cleanup_samples (table_name, record_key, field_name, original, cleaned)
      select
        'news_posts',
        id::text,
        'metadata',
        metadata::text,
        public._cleanup_normalize_norwegian_jsonb(metadata)::text
      from public.news_posts
      where public._cleanup_jsonb_has_issue(metadata)
      order by updated_at desc nulls last, id
      limit 20;
    end if;
  end if;

  if public._cleanup_table_exists('public.content_editors') and public._cleanup_column_exists('public.content_editors', 'display_name') then
    insert into cleanup_counts (table_name, column_name, affected_rows)
    select 'content_editors', 'display_name', count(*)
    from public.content_editors
    where public._cleanup_text_has_issue(display_name);

    insert into cleanup_samples (table_name, record_key, field_name, original, cleaned)
    select 'content_editors', id::text, 'display_name', display_name, public._cleanup_normalize_norwegian_text(display_name)
    from public.content_editors
    where public._cleanup_text_has_issue(display_name)
    order by created_at desc nulls last, id
    limit 20;
  end if;
end $$;

select 'affected_rows' as section, table_name, column_name, affected_rows
from cleanup_counts
where affected_rows > 0
order by table_name, column_name;

select 'sample' as section, table_name, record_key, field_name, original, cleaned
from cleanup_samples
order by table_name, field_name, record_key;

rollback;
