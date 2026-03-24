-- Supabase content snapshot storage for Global Working.
-- Run this in the Supabase SQL editor.

create extension if not exists pgcrypto;

create table if not exists public.content_snapshots (
  id uuid primary key default gen_random_uuid(),
  locale text not null,
  status text not null check (status in ('draft', 'published')),
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create unique index if not exists content_snapshots_locale_status_idx
  on public.content_snapshots (locale, status);

create index if not exists content_snapshots_locale_updated_at_idx
  on public.content_snapshots (locale, updated_at desc);

create table if not exists public.content_editors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade,
  email text unique,
  role text not null default 'editor' check (role in ('admin', 'editor')),
  created_at timestamptz not null default now()
);

update public.content_editors
set role = 'editor'
where role is null;

create or replace function public.set_content_snapshots_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  if new.status = 'published' and old.status is distinct from 'published' then
    new.published_at = now();
  end if;
  return new;
end;
$$;

drop trigger if exists content_snapshots_updated_at on public.content_snapshots;
create trigger content_snapshots_updated_at
before update on public.content_snapshots
for each row
execute function public.set_content_snapshots_updated_at();

alter table public.content_snapshots enable row level security;
alter table public.content_editors enable row level security;

create or replace function public.is_content_editor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.content_editors ce
    where (ce.user_id = auth.uid()
       or lower(ce.email) = lower(auth.jwt() ->> 'email'))
      and ce.role in ('admin', 'editor')
  );
$$;

grant execute on function public.is_content_editor() to anon, authenticated;

drop policy if exists "Public can read published content" on public.content_snapshots;
create policy "Public can read published content"
  on public.content_snapshots
  for select
  to anon, authenticated
  using (status = 'published');

drop policy if exists "Editors can read all content" on public.content_snapshots;
create policy "Editors can read all content"
  on public.content_snapshots
  for select
  to authenticated
  using (public.is_content_editor());

drop policy if exists "Editors can write content" on public.content_snapshots;
create policy "Editors can write content"
  on public.content_snapshots
  for insert
  to authenticated
  with check (public.is_content_editor());

drop policy if exists "Editors can update content" on public.content_snapshots;
create policy "Editors can update content"
  on public.content_snapshots
  for update
  to authenticated
  using (public.is_content_editor())
  with check (public.is_content_editor());

drop policy if exists "Editors can delete content" on public.content_snapshots;
create policy "Editors can delete content"
  on public.content_snapshots
  for delete
  to authenticated
  using (public.is_content_editor());

drop policy if exists "Editors can read their own row" on public.content_editors;
create policy "Editors can read their own row"
  on public.content_editors
  for select
  to authenticated
  using (user_id = auth.uid() or lower(email) = lower(auth.jwt() ->> 'email'));

-- Seed your first editor manually:
-- insert into public.content_editors (email, role) values ('you@example.com', 'admin');
