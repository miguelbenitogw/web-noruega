-- Apply cleanup: backup affected rows, normalize Norwegian text, and verify.
-- Run only after reviewing the dry-run output.

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

create temp table if not exists cleanup_backup_summary (
  table_name text not null,
  backed_up_rows bigint not null
) on commit drop;

create temp table if not exists cleanup_apply_summary (
  table_name text not null,
  updated_rows bigint not null
) on commit drop;

create temp table if not exists cleanup_remaining_summary (
  table_name text not null,
  column_name text not null,
  remaining_suspect_rows bigint not null
) on commit drop;

do $$
declare
  v_rows bigint;
begin
  if public._cleanup_table_exists('public.content_snapshots') and public._cleanup_column_exists('public.content_snapshots', 'content') then
    create table if not exists public._cleanup_backup_content_snapshots (like public.content_snapshots including all);
    truncate public._cleanup_backup_content_snapshots;
    insert into public._cleanup_backup_content_snapshots
    select *
    from public.content_snapshots
    where public._cleanup_jsonb_has_issue(content);
    get diagnostics v_rows = row_count;
    insert into cleanup_backup_summary (table_name, backed_up_rows)
    values ('content_snapshots', v_rows);

    update public.content_snapshots
    set content = public._cleanup_normalize_norwegian_jsonb(content)
    where public._cleanup_jsonb_has_issue(content);
    get diagnostics v_rows = row_count;
    insert into cleanup_apply_summary (table_name, updated_rows)
    values ('content_snapshots', v_rows);
  end if;

  if public._cleanup_table_exists('public.content_templates') then
    create table if not exists public._cleanup_backup_content_templates (like public.content_templates including all);
    truncate public._cleanup_backup_content_templates;
    insert into public._cleanup_backup_content_templates
    select *
    from public.content_templates
    where public._cleanup_text_has_issue(name)
       or public._cleanup_text_has_issue(description)
       or public._cleanup_text_has_issue(body_template)
       or public._cleanup_jsonb_has_issue(frontmatter_example)
       or public._cleanup_jsonb_has_issue(frontmatter_schema);
    get diagnostics v_rows = row_count;
    insert into cleanup_backup_summary (table_name, backed_up_rows)
    values ('content_templates', v_rows);

    update public.content_templates
    set
      name = public._cleanup_normalize_norwegian_text(name),
      description = public._cleanup_normalize_norwegian_text(description),
      body_template = public._cleanup_normalize_norwegian_text(body_template),
      frontmatter_example = public._cleanup_normalize_norwegian_jsonb(frontmatter_example),
      frontmatter_schema = public._cleanup_normalize_norwegian_jsonb(frontmatter_schema)
    where public._cleanup_text_has_issue(name)
       or public._cleanup_text_has_issue(description)
       or public._cleanup_text_has_issue(body_template)
       or public._cleanup_jsonb_has_issue(frontmatter_example)
       or public._cleanup_jsonb_has_issue(frontmatter_schema);
    get diagnostics v_rows = row_count;
    insert into cleanup_apply_summary (table_name, updated_rows)
    values ('content_templates', v_rows);
  end if;

  if public._cleanup_table_exists('public.content_pages') then
    create table if not exists public._cleanup_backup_content_pages (like public.content_pages including all);
    truncate public._cleanup_backup_content_pages;
    insert into public._cleanup_backup_content_pages
    select *
    from public.content_pages
    where public._cleanup_text_has_issue(title)
       or public._cleanup_text_has_issue(excerpt)
       or public._cleanup_text_has_issue(body)
       or public._cleanup_text_has_issue(seo_title)
       or public._cleanup_text_has_issue(seo_description)
       or public._cleanup_jsonb_has_issue(metadata);
    get diagnostics v_rows = row_count;
    insert into cleanup_backup_summary (table_name, backed_up_rows)
    values ('content_pages', v_rows);

    update public.content_pages
    set
      title = public._cleanup_normalize_norwegian_text(title),
      excerpt = public._cleanup_normalize_norwegian_text(excerpt),
      body = public._cleanup_normalize_norwegian_text(body),
      seo_title = public._cleanup_normalize_norwegian_text(seo_title),
      seo_description = public._cleanup_normalize_norwegian_text(seo_description),
      metadata = public._cleanup_normalize_norwegian_jsonb(metadata)
    where public._cleanup_text_has_issue(title)
       or public._cleanup_text_has_issue(excerpt)
       or public._cleanup_text_has_issue(body)
       or public._cleanup_text_has_issue(seo_title)
       or public._cleanup_text_has_issue(seo_description)
       or public._cleanup_jsonb_has_issue(metadata);
    get diagnostics v_rows = row_count;
    insert into cleanup_apply_summary (table_name, updated_rows)
    values ('content_pages', v_rows);
  end if;

  if public._cleanup_table_exists('public.news_posts') then
    create table if not exists public._cleanup_backup_news_posts (like public.news_posts including all);
    truncate public._cleanup_backup_news_posts;
    insert into public._cleanup_backup_news_posts
    select *
    from public.news_posts
    where public._cleanup_text_has_issue(title)
       or public._cleanup_text_has_issue(excerpt)
       or public._cleanup_text_has_issue(body)
       or public._cleanup_text_has_issue(tag)
       or public._cleanup_text_has_issue(author)
       or public._cleanup_text_has_issue(seo_title)
       or public._cleanup_text_has_issue(seo_description)
       or public._cleanup_jsonb_has_issue(metadata);
    get diagnostics v_rows = row_count;
    insert into cleanup_backup_summary (table_name, backed_up_rows)
    values ('news_posts', v_rows);

    update public.news_posts
    set
      title = public._cleanup_normalize_norwegian_text(title),
      excerpt = public._cleanup_normalize_norwegian_text(excerpt),
      body = public._cleanup_normalize_norwegian_text(body),
      tag = public._cleanup_normalize_norwegian_text(tag),
      author = public._cleanup_normalize_norwegian_text(author),
      seo_title = public._cleanup_normalize_norwegian_text(seo_title),
      seo_description = public._cleanup_normalize_norwegian_text(seo_description),
      metadata = public._cleanup_normalize_norwegian_jsonb(metadata)
    where public._cleanup_text_has_issue(title)
       or public._cleanup_text_has_issue(excerpt)
       or public._cleanup_text_has_issue(body)
       or public._cleanup_text_has_issue(tag)
       or public._cleanup_text_has_issue(author)
       or public._cleanup_text_has_issue(seo_title)
       or public._cleanup_text_has_issue(seo_description)
       or public._cleanup_jsonb_has_issue(metadata);
    get diagnostics v_rows = row_count;
    insert into cleanup_apply_summary (table_name, updated_rows)
    values ('news_posts', v_rows);
  end if;

  if public._cleanup_table_exists('public.content_editors') and public._cleanup_column_exists('public.content_editors', 'display_name') then
    create table if not exists public._cleanup_backup_content_editors (like public.content_editors including all);
    truncate public._cleanup_backup_content_editors;
    insert into public._cleanup_backup_content_editors
    select *
    from public.content_editors
    where public._cleanup_text_has_issue(display_name);
    get diagnostics v_rows = row_count;
    insert into cleanup_backup_summary (table_name, backed_up_rows)
    values ('content_editors', v_rows);

    update public.content_editors
    set display_name = public._cleanup_normalize_norwegian_text(display_name)
    where public._cleanup_text_has_issue(display_name);
    get diagnostics v_rows = row_count;
    insert into cleanup_apply_summary (table_name, updated_rows)
    values ('content_editors', v_rows);
  end if;
end $$;

do $$
begin
  if public._cleanup_table_exists('public.content_snapshots') and public._cleanup_column_exists('public.content_snapshots', 'content') then
    insert into cleanup_remaining_summary (table_name, column_name, remaining_suspect_rows)
    select 'content_snapshots', 'content', count(*)
    from public.content_snapshots
    where public._cleanup_jsonb_has_issue(content);
  end if;

  if public._cleanup_table_exists('public.content_templates') then
    insert into cleanup_remaining_summary (table_name, column_name, remaining_suspect_rows)
    select 'content_templates', 'name', count(*)
    from public.content_templates
    where public._cleanup_text_has_issue(name);

    insert into cleanup_remaining_summary (table_name, column_name, remaining_suspect_rows)
    select 'content_templates', 'description', count(*)
    from public.content_templates
    where public._cleanup_text_has_issue(description);

    insert into cleanup_remaining_summary (table_name, column_name, remaining_suspect_rows)
    select 'content_templates', 'body_template', count(*)
    from public.content_templates
    where public._cleanup_text_has_issue(body_template);

    insert into cleanup_remaining_summary (table_name, column_name, remaining_suspect_rows)
    select 'content_templates', 'frontmatter_example', count(*)
    from public.content_templates
    where public._cleanup_jsonb_has_issue(frontmatter_example);

    insert into cleanup_remaining_summary (table_name, column_name, remaining_suspect_rows)
    select 'content_templates', 'frontmatter_schema', count(*)
    from public.content_templates
    where public._cleanup_jsonb_has_issue(frontmatter_schema);
  end if;

  if public._cleanup_table_exists('public.content_pages') then
    insert into cleanup_remaining_summary (table_name, column_name, remaining_suspect_rows)
    select 'content_pages', 'title', count(*)
    from public.content_pages
    where public._cleanup_text_has_issue(title);

    insert into cleanup_remaining_summary (table_name, column_name, remaining_suspect_rows)
    select 'content_pages', 'excerpt', count(*)
    from public.content_pages
    where public._cleanup_text_has_issue(excerpt);

    insert into cleanup_remaining_summary (table_name, column_name, remaining_suspect_rows)
    select 'content_pages', 'body', count(*)
    from public.content_pages
    where public._cleanup_text_has_issue(body);

    insert into cleanup_remaining_summary (table_name, column_name, remaining_suspect_rows)
    select 'content_pages', 'seo_title', count(*)
    from public.content_pages
    where public._cleanup_text_has_issue(seo_title);

    insert into cleanup_remaining_summary (table_name, column_name, remaining_suspect_rows)
    select 'content_pages', 'seo_description', count(*)
    from public.content_pages
    where public._cleanup_text_has_issue(seo_description);

    insert into cleanup_remaining_summary (table_name, column_name, remaining_suspect_rows)
    select 'content_pages', 'metadata', count(*)
    from public.content_pages
    where public._cleanup_jsonb_has_issue(metadata);
  end if;

  if public._cleanup_table_exists('public.news_posts') then
    insert into cleanup_remaining_summary (table_name, column_name, remaining_suspect_rows)
    select 'news_posts', 'title', count(*)
    from public.news_posts
    where public._cleanup_text_has_issue(title);

    insert into cleanup_remaining_summary (table_name, column_name, remaining_suspect_rows)
    select 'news_posts', 'excerpt', count(*)
    from public.news_posts
    where public._cleanup_text_has_issue(excerpt);

    insert into cleanup_remaining_summary (table_name, column_name, remaining_suspect_rows)
    select 'news_posts', 'body', count(*)
    from public.news_posts
    where public._cleanup_text_has_issue(body);

    insert into cleanup_remaining_summary (table_name, column_name, remaining_suspect_rows)
    select 'news_posts', 'tag', count(*)
    from public.news_posts
    where public._cleanup_text_has_issue(tag);

    insert into cleanup_remaining_summary (table_name, column_name, remaining_suspect_rows)
    select 'news_posts', 'author', count(*)
    from public.news_posts
    where public._cleanup_text_has_issue(author);

    insert into cleanup_remaining_summary (table_name, column_name, remaining_suspect_rows)
    select 'news_posts', 'seo_title', count(*)
    from public.news_posts
    where public._cleanup_text_has_issue(seo_title);

    insert into cleanup_remaining_summary (table_name, column_name, remaining_suspect_rows)
    select 'news_posts', 'seo_description', count(*)
    from public.news_posts
    where public._cleanup_text_has_issue(seo_description);

    insert into cleanup_remaining_summary (table_name, column_name, remaining_suspect_rows)
    select 'news_posts', 'metadata', count(*)
    from public.news_posts
    where public._cleanup_jsonb_has_issue(metadata);
  end if;

  if public._cleanup_table_exists('public.content_editors') and public._cleanup_column_exists('public.content_editors', 'display_name') then
    insert into cleanup_remaining_summary (table_name, column_name, remaining_suspect_rows)
    select 'content_editors', 'display_name', count(*)
    from public.content_editors
    where public._cleanup_text_has_issue(display_name);
  end if;
end $$;

select 'backup' as section, table_name, backed_up_rows
from cleanup_backup_summary
order by table_name;

select 'updated' as section, table_name, updated_rows
from cleanup_apply_summary
order by table_name;

select 'verification' as section, table_name, column_name, remaining_suspect_rows
from cleanup_remaining_summary
where remaining_suspect_rows > 0
order by table_name, column_name;

commit;
