begin;

create extension if not exists pgcrypto;

alter table public.content_editors
  add column if not exists role text;

update public.content_editors
set role = 'editor'
where role is null
   or length(btrim(role)) = 0;

alter table public.content_editors
  alter column role set default 'editor';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'content_editors_role_check'
      and conrelid = 'public.content_editors'::regclass
  ) then
    alter table public.content_editors
      add constraint content_editors_role_check
      check (role in ('admin', 'editor'));
  end if;
end $$;

create or replace function public.can_manage_content_assets()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.content_editors ce
    where ce.is_active
      and coalesce(ce.role, 'editor') in ('admin', 'editor')
      and (
        ce.user_id = auth.uid()
        or (
          public.current_editor_email() is not null
          and ce.email is not null
          and lower(ce.email) = public.current_editor_email()
        )
      )
  );
$$;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
select
  'content-media',
  'content-media',
  false,
  10485760,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
    'image/svg+xml'
  ]::text[]
where not exists (
  select 1
  from storage.buckets
  where id = 'content-media'
);

create table if not exists public.content_assets (
  id uuid primary key default gen_random_uuid(),
  bucket text not null default 'content-media',
  storage_path text not null,
  public_url text,
  mime_type text,
  size_bytes bigint,
  width integer,
  height integer,
  alt text,
  caption text,
  usage_type text,
  status text not null default 'active',
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint content_assets_storage_path_key unique (storage_path),
  constraint content_assets_bucket_not_blank check (length(btrim(bucket)) > 0),
  constraint content_assets_storage_path_not_blank check (length(btrim(storage_path)) > 0),
  constraint content_assets_public_url_not_blank check (public_url is null or length(btrim(public_url)) > 0),
  constraint content_assets_mime_type_not_blank check (mime_type is null or length(btrim(mime_type)) > 0),
  constraint content_assets_usage_type_not_blank check (usage_type is null or length(btrim(usage_type)) > 0),
  constraint content_assets_status_check check (status in ('active', 'inactive', 'archived')),
  constraint content_assets_size_bytes_check check (size_bytes is null or size_bytes >= 0),
  constraint content_assets_width_check check (width is null or width > 0),
  constraint content_assets_height_check check (height is null or height > 0)
);

create table if not exists public.content_asset_usages (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.content_assets(id) on delete cascade,
  entity_type text not null,
  entity_id text not null,
  field_path text not null,
  locale text,
  notes text,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint content_asset_usages_entity_type_not_blank check (length(btrim(entity_type)) > 0),
  constraint content_asset_usages_entity_id_not_blank check (length(btrim(entity_id)) > 0),
  constraint content_asset_usages_field_path_not_blank check (length(btrim(field_path)) > 0),
  constraint content_asset_usages_locale_not_blank check (locale is null or length(btrim(locale)) > 0)
);

create index if not exists content_assets_bucket_status_idx
  on public.content_assets (bucket, status);

create index if not exists content_assets_usage_type_idx
  on public.content_assets (usage_type);

create index if not exists content_assets_created_at_idx
  on public.content_assets (created_at desc);

create index if not exists content_asset_usages_asset_id_idx
  on public.content_asset_usages (asset_id);

create index if not exists content_asset_usages_entity_lookup_idx
  on public.content_asset_usages (entity_type, entity_id, field_path);

drop trigger if exists content_assets_touch_updated_at on public.content_assets;
create trigger content_assets_touch_updated_at
before update on public.content_assets
for each row
execute function public.touch_updated_at();

drop trigger if exists content_asset_usages_touch_updated_at on public.content_asset_usages;
create trigger content_asset_usages_touch_updated_at
before update on public.content_asset_usages
for each row
execute function public.touch_updated_at();

alter table public.content_assets enable row level security;
alter table public.content_asset_usages enable row level security;

drop policy if exists "Public can read active content assets" on public.content_assets;
create policy "Public can read active content assets"
  on public.content_assets
  for select
  to anon, authenticated
  using (status = 'active');

drop policy if exists "Editors can read all content assets" on public.content_assets;
create policy "Editors can read all content assets"
  on public.content_assets
  for select
  to authenticated
  using (public.can_manage_content_assets());

drop policy if exists "Editors can insert content assets" on public.content_assets;
create policy "Editors can insert content assets"
  on public.content_assets
  for insert
  to authenticated
  with check (public.can_manage_content_assets());

drop policy if exists "Editors can update content assets" on public.content_assets;
create policy "Editors can update content assets"
  on public.content_assets
  for update
  to authenticated
  using (public.can_manage_content_assets())
  with check (public.can_manage_content_assets());

drop policy if exists "Editors can delete content assets" on public.content_assets;
create policy "Editors can delete content assets"
  on public.content_assets
  for delete
  to authenticated
  using (public.can_manage_content_assets());

drop policy if exists "Editors can read content asset usages" on public.content_asset_usages;
create policy "Editors can read content asset usages"
  on public.content_asset_usages
  for select
  to authenticated
  using (public.can_manage_content_assets());

drop policy if exists "Editors can insert content asset usages" on public.content_asset_usages;
create policy "Editors can insert content asset usages"
  on public.content_asset_usages
  for insert
  to authenticated
  with check (public.can_manage_content_assets());

drop policy if exists "Editors can update content asset usages" on public.content_asset_usages;
create policy "Editors can update content asset usages"
  on public.content_asset_usages
  for update
  to authenticated
  using (public.can_manage_content_assets())
  with check (public.can_manage_content_assets());

drop policy if exists "Editors can delete content asset usages" on public.content_asset_usages;
create policy "Editors can delete content asset usages"
  on public.content_asset_usages
  for delete
  to authenticated
  using (public.can_manage_content_assets());

drop policy if exists "Editors can view content-media bucket" on storage.buckets;
create policy "Editors can view content-media bucket"
  on storage.buckets
  for select
  to authenticated
  using (
    id = 'content-media'
    and public.can_manage_content_assets()
  );

drop policy if exists "Public can read active content-media objects" on storage.objects;
create policy "Public can read active content-media objects"
  on storage.objects
  for select
  to anon, authenticated
  using (
    bucket_id = 'content-media'
    and exists (
      select 1
      from public.content_assets ca
      where ca.bucket = storage.objects.bucket_id
        and ca.storage_path = storage.objects.name
        and ca.status = 'active'
    )
  );

drop policy if exists "Editors can read all content-media objects" on storage.objects;
create policy "Editors can read all content-media objects"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'content-media'
    and public.can_manage_content_assets()
  );

drop policy if exists "Editors can insert content-media objects" on storage.objects;
create policy "Editors can insert content-media objects"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'content-media'
    and public.can_manage_content_assets()
  );

drop policy if exists "Editors can update content-media objects" on storage.objects;
create policy "Editors can update content-media objects"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'content-media'
    and public.can_manage_content_assets()
  )
  with check (
    bucket_id = 'content-media'
    and public.can_manage_content_assets()
  );

drop policy if exists "Editors can delete content-media objects" on storage.objects;
create policy "Editors can delete content-media objects"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'content-media'
    and public.can_manage_content_assets()
  );

grant execute on function public.can_manage_content_assets() to anon, authenticated;

grant select, insert, update, delete on public.content_assets to authenticated;
grant select, insert, update, delete on public.content_asset_usages to authenticated;
grant select on public.content_assets to anon;

commit;
