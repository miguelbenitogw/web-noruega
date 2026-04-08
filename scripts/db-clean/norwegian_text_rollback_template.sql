-- Rollback cleanup: restore backed-up rows after the apply step.
-- Run only if the apply step needs to be reversed.

begin;

create or replace function public._cleanup_table_exists(p_table_name text)
returns boolean
language sql
stable
as $$
  select to_regclass(p_table_name) is not null;
$$;

do $$
begin
  if public._cleanup_table_exists('public._cleanup_backup_content_snapshots')
     and public._cleanup_table_exists('public.content_snapshots') then
    update public.content_snapshots live
    set content = backup.content
    from public._cleanup_backup_content_snapshots backup
    where live.id = backup.id;
  end if;

  if public._cleanup_table_exists('public._cleanup_backup_content_templates')
     and public._cleanup_table_exists('public.content_templates') then
    update public.content_templates live
    set
      name = backup.name,
      description = backup.description,
      body_template = backup.body_template,
      frontmatter_example = backup.frontmatter_example,
      frontmatter_schema = backup.frontmatter_schema
    from public._cleanup_backup_content_templates backup
    where live.id = backup.id;
  end if;

  if public._cleanup_table_exists('public._cleanup_backup_content_pages')
     and public._cleanup_table_exists('public.content_pages') then
    update public.content_pages live
    set
      title = backup.title,
      excerpt = backup.excerpt,
      body = backup.body,
      seo_title = backup.seo_title,
      seo_description = backup.seo_description,
      metadata = backup.metadata
    from public._cleanup_backup_content_pages backup
    where live.id = backup.id;
  end if;

  if public._cleanup_table_exists('public._cleanup_backup_news_posts')
     and public._cleanup_table_exists('public.news_posts') then
    update public.news_posts live
    set
      title = backup.title,
      excerpt = backup.excerpt,
      body = backup.body,
      tag = backup.tag,
      author = backup.author,
      seo_title = backup.seo_title,
      seo_description = backup.seo_description,
      metadata = backup.metadata
    from public._cleanup_backup_news_posts backup
    where live.id = backup.id;
  end if;

  if public._cleanup_table_exists('public._cleanup_backup_content_editors')
     and public._cleanup_table_exists('public.content_editors')
     and exists (
       select 1
       from information_schema.columns
       where table_schema = 'public'
         and table_name = 'content_editors'
         and column_name = 'display_name'
     ) then
    update public.content_editors live
    set display_name = backup.display_name
    from public._cleanup_backup_content_editors backup
    where live.id = backup.id;
  end if;
end $$;

select 'rollback_backups_present' as section, table_name
from (
  values
    ('public._cleanup_backup_content_snapshots', public._cleanup_table_exists('public._cleanup_backup_content_snapshots')),
    ('public._cleanup_backup_content_templates', public._cleanup_table_exists('public._cleanup_backup_content_templates')),
    ('public._cleanup_backup_content_pages', public._cleanup_table_exists('public._cleanup_backup_content_pages')),
    ('public._cleanup_backup_news_posts', public._cleanup_table_exists('public._cleanup_backup_news_posts')),
    ('public._cleanup_backup_content_editors', public._cleanup_table_exists('public._cleanup_backup_content_editors'))
) as t(table_name, exists_flag)
where exists_flag
order by table_name;

commit;
