begin;

create extension if not exists pgcrypto;

do $$
begin
  create type public.content_status as enum ('draft', 'published');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.content_entity_type as enum ('content_page', 'news_post', 'content_template');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.content_revision_action as enum ('insert', 'update', 'delete');
exception
  when duplicate_object then null;
end $$;

create or replace function public.current_editor_email()
returns text
language sql
stable
as $$
  select nullif(lower(trim(auth.jwt() ->> 'email')), '');
$$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.apply_basic_audit_fields()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    new.created_by = coalesce(new.created_by, auth.uid());
    new.updated_by = coalesce(new.updated_by, auth.uid());
  else
    new.updated_by = coalesce(auth.uid(), new.updated_by, old.updated_by);
  end if;

  return new;
end;
$$;

create or replace function public.apply_publish_audit_fields()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    new.created_by = coalesce(new.created_by, auth.uid());
    new.updated_by = coalesce(new.updated_by, auth.uid());

    if new.status = 'published' then
      new.published_at = coalesce(new.published_at, now());
      new.published_by = coalesce(new.published_by, auth.uid());
    end if;

    return new;
  end if;

  new.updated_by = coalesce(auth.uid(), new.updated_by, old.updated_by);

  if old.status is distinct from 'published' and new.status = 'published' then
    new.published_at = coalesce(new.published_at, now());
    new.published_by = coalesce(new.published_by, auth.uid());
  end if;

  return new;
end;
$$;

create or replace function public.jsonb_changed_keys(
  old_row jsonb,
  new_row jsonb,
  excluded_keys text[] default array['created_at', 'updated_at', 'created_by', 'updated_by', 'published_at', 'published_by']::text[]
)
returns text[]
language sql
immutable
as $$
  with all_keys as (
    select key
    from jsonb_each(coalesce(old_row, '{}'::jsonb))
    union
    select key
    from jsonb_each(coalesce(new_row, '{}'::jsonb))
  )
  select coalesce(array_agg(key order by key), '{}'::text[])
  from all_keys
  where key <> all(coalesce(excluded_keys, '{}'::text[]))
    and coalesce(old_row -> key, 'null'::jsonb) is distinct from coalesce(new_row -> key, 'null'::jsonb);
$$;

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
    where ce.is_active
      and (
        ce.user_id = auth.uid()
        or (
          public.current_editor_email() is not null
          and lower(ce.email) = public.current_editor_email()
        )
      )
  );
$$;

create or replace function public.capture_content_revision()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_action public.content_revision_action;
  v_old jsonb := '{}'::jsonb;
  v_new jsonb := '{}'::jsonb;
  v_content_type public.content_entity_type;
  v_content_id uuid;
  v_slug text;
  v_locale text;
  v_version integer;
  v_changed_fields text[];
begin
  if tg_op = 'INSERT' then
    v_action := 'insert';
    v_new := to_jsonb(new);
    v_content_id := new.id;
    v_slug := coalesce(new.slug, null);
    v_locale := coalesce(new.locale, null);
    v_changed_fields := public.jsonb_changed_keys('{}'::jsonb, v_new);
  elsif tg_op = 'UPDATE' then
    v_action := 'update';
    v_old := to_jsonb(old);
    v_new := to_jsonb(new);
    v_content_id := new.id;
    v_slug := coalesce(new.slug, old.slug);
    v_locale := coalesce(new.locale, old.locale);
    v_changed_fields := public.jsonb_changed_keys(v_old, v_new);

    if coalesce(array_length(v_changed_fields, 1), 0) = 0 then
      return new;
    end if;
  else
    v_action := 'delete';
    v_old := to_jsonb(old);
    v_content_id := old.id;
    v_slug := coalesce(old.slug, null);
    v_locale := coalesce(old.locale, null);
    v_changed_fields := public.jsonb_changed_keys(v_old, '{}'::jsonb);
  end if;

  if tg_table_name = 'content_pages' then
    v_content_type := 'content_page';
  elsif tg_table_name = 'news_posts' then
    v_content_type := 'news_post';
  else
    v_content_type := 'content_template';
  end if;

  select coalesce(max(cr.version), 0) + 1
    into v_version
  from public.content_revisions cr
  where cr.content_type = v_content_type
    and cr.content_id = v_content_id;

  insert into public.content_revisions (
    content_type,
    content_id,
    content_slug,
    content_locale,
    revision_action,
    version,
    old_data,
    new_data,
    changed_fields,
    changed_by
  )
  values (
    v_content_type,
    v_content_id,
    v_slug,
    v_locale,
    v_action,
    v_version,
    v_old,
    v_new,
    v_changed_fields,
    coalesce(auth.uid(), case when tg_op = 'DELETE' then old.updated_by else new.updated_by end)
  );

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

create table if not exists public.content_editors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade,
  email text,
  display_name text,
  is_active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint content_editors_email_not_blank check (email is null or length(btrim(email)) > 0),
  constraint content_editors_display_name_not_blank check (display_name is null or length(btrim(display_name)) > 0)
);

create table if not exists public.content_templates (
  id uuid primary key default gen_random_uuid(),
  template_key text not null,
  name text not null,
  description text,
  content_type public.content_entity_type not null default 'news_post',
  locale text not null default 'nb',
  frontmatter_schema jsonb not null default '{}'::jsonb,
  frontmatter_example jsonb not null default '{}'::jsonb,
  body_template text not null default '',
  is_starter boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint content_templates_template_key_not_blank check (length(btrim(template_key)) > 0),
  constraint content_templates_name_not_blank check (length(btrim(name)) > 0),
  constraint content_templates_locale_not_blank check (length(btrim(locale)) > 0),
  constraint content_templates_content_type_check check (content_type in ('content_page', 'news_post'))
);

create table if not exists public.content_pages (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references public.content_templates(id) on delete set null,
  locale text not null default 'nb',
  slug text not null,
  title text not null,
  excerpt text not null default '',
  body text not null default '',
  status public.content_status not null default 'draft',
  publish_at timestamptz,
  published_at timestamptz,
  published_by uuid references auth.users(id) on delete set null,
  seo_title text,
  seo_description text,
  cover_image text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint content_pages_slug_not_blank check (length(btrim(slug)) > 0),
  constraint content_pages_title_not_blank check (length(btrim(title)) > 0),
  constraint content_pages_locale_not_blank check (length(btrim(locale)) > 0)
);

create table if not exists public.news_posts (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references public.content_templates(id) on delete set null,
  locale text not null default 'nb',
  slug text not null,
  title text not null,
  excerpt text not null default '',
  body text not null default '',
  tag text not null default 'Nyhet',
  read_time text not null default '3 min',
  author text not null default 'Global Working',
  cover_image text,
  status public.content_status not null default 'draft',
  publish_at timestamptz,
  published_at timestamptz,
  published_by uuid references auth.users(id) on delete set null,
  seo_title text,
  seo_description text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint news_posts_slug_not_blank check (length(btrim(slug)) > 0),
  constraint news_posts_title_not_blank check (length(btrim(title)) > 0),
  constraint news_posts_tag_not_blank check (length(btrim(tag)) > 0),
  constraint news_posts_locale_not_blank check (length(btrim(locale)) > 0)
);

create table if not exists public.content_revisions (
  id uuid primary key default gen_random_uuid(),
  content_type public.content_entity_type not null,
  content_id uuid not null,
  content_slug text,
  content_locale text,
  revision_action public.content_revision_action not null,
  version integer not null,
  old_data jsonb not null default '{}'::jsonb,
  new_data jsonb not null default '{}'::jsonb,
  changed_fields text[] not null default '{}'::text[],
  changed_by uuid references auth.users(id) on delete set null,
  changed_at timestamptz not null default now(),
  constraint content_revisions_version_positive check (version > 0)
);

create unique index if not exists content_editors_email_key on public.content_editors (lower(email));

create unique index if not exists content_templates_template_key_locale_key
  on public.content_templates (template_key, locale);
create index if not exists content_templates_content_type_idx
  on public.content_templates (content_type);
create index if not exists content_templates_is_starter_idx
  on public.content_templates (is_starter)
  where is_starter;
create index if not exists content_templates_sort_order_idx
  on public.content_templates (sort_order, template_key);

create unique index if not exists content_pages_locale_slug_key
  on public.content_pages (locale, slug);
create index if not exists content_pages_status_publish_at_idx
  on public.content_pages (status, publish_at desc nulls last);
create index if not exists content_pages_published_at_idx
  on public.content_pages (published_at desc nulls last);
create index if not exists content_pages_template_id_idx
  on public.content_pages (template_id);

create unique index if not exists news_posts_locale_slug_key
  on public.news_posts (locale, slug);
create index if not exists news_posts_status_publish_at_idx
  on public.news_posts (status, publish_at desc nulls last);
create index if not exists news_posts_published_at_idx
  on public.news_posts (published_at desc nulls last);
create index if not exists news_posts_tag_idx
  on public.news_posts (tag);
create index if not exists news_posts_template_id_idx
  on public.news_posts (template_id);

create unique index if not exists content_revisions_content_version_key
  on public.content_revisions (content_type, content_id, version);
create index if not exists content_revisions_content_lookup_idx
  on public.content_revisions (content_type, content_id, changed_at desc);
create index if not exists content_revisions_slug_idx
  on public.content_revisions (content_type, content_slug, changed_at desc);

drop trigger if exists content_editors_touch_updated_at on public.content_editors;
create trigger content_editors_touch_updated_at
before update on public.content_editors
for each row
execute function public.touch_updated_at();

drop trigger if exists content_editors_apply_audit on public.content_editors;
create trigger content_editors_apply_audit
before insert or update on public.content_editors
for each row
execute function public.apply_basic_audit_fields();

drop trigger if exists content_templates_touch_updated_at on public.content_templates;
create trigger content_templates_touch_updated_at
before update on public.content_templates
for each row
execute function public.touch_updated_at();

drop trigger if exists content_templates_apply_audit on public.content_templates;
create trigger content_templates_apply_audit
before insert or update on public.content_templates
for each row
execute function public.apply_basic_audit_fields();

drop trigger if exists content_pages_touch_updated_at on public.content_pages;
create trigger content_pages_touch_updated_at
before update on public.content_pages
for each row
execute function public.touch_updated_at();

drop trigger if exists content_pages_apply_audit on public.content_pages;
create trigger content_pages_apply_audit
before insert or update on public.content_pages
for each row
execute function public.apply_publish_audit_fields();

drop trigger if exists content_pages_create_revision on public.content_pages;
create trigger content_pages_create_revision
after insert or update or delete on public.content_pages
for each row
execute function public.capture_content_revision();

drop trigger if exists news_posts_touch_updated_at on public.news_posts;
create trigger news_posts_touch_updated_at
before update on public.news_posts
for each row
execute function public.touch_updated_at();

drop trigger if exists news_posts_apply_audit on public.news_posts;
create trigger news_posts_apply_audit
before insert or update on public.news_posts
for each row
execute function public.apply_publish_audit_fields();

drop trigger if exists news_posts_create_revision on public.news_posts;
create trigger news_posts_create_revision
after insert or update or delete on public.news_posts
for each row
execute function public.capture_content_revision();

alter table public.content_editors enable row level security;
alter table public.content_templates enable row level security;
alter table public.content_pages enable row level security;
alter table public.news_posts enable row level security;
alter table public.content_revisions enable row level security;

drop policy if exists "Editor can read own editor row" on public.content_editors;
create policy "Editor can read own editor row"
  on public.content_editors
  for select
  to authenticated
  using (
    user_id = auth.uid()
    or (email is not null and lower(email) = public.current_editor_email())
  );

drop policy if exists "Editor can insert own editor row" on public.content_editors;
create policy "Editor can insert own editor row"
  on public.content_editors
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    or (email is not null and lower(email) = public.current_editor_email())
  );

drop policy if exists "Editor can update own editor row" on public.content_editors;
create policy "Editor can update own editor row"
  on public.content_editors
  for update
  to authenticated
  using (
    user_id = auth.uid()
    or (email is not null and lower(email) = public.current_editor_email())
  )
  with check (
    user_id = auth.uid()
    or (email is not null and lower(email) = public.current_editor_email())
  );

drop policy if exists "Editor can delete own editor row" on public.content_editors;
create policy "Editor can delete own editor row"
  on public.content_editors
  for delete
  to authenticated
  using (
    user_id = auth.uid()
    or (email is not null and lower(email) = public.current_editor_email())
  );

drop policy if exists "Editors can read content templates" on public.content_templates;
create policy "Editors can read content templates"
  on public.content_templates
  for select
  to authenticated
  using (public.is_content_editor());

drop policy if exists "Editors can manage content templates" on public.content_templates;
create policy "Editors can manage content templates"
  on public.content_templates
  for all
  to authenticated
  using (public.is_content_editor())
  with check (public.is_content_editor());

drop policy if exists "Public can read published pages" on public.content_pages;
create policy "Public can read published pages"
  on public.content_pages
  for select
  to anon, authenticated
  using (status = 'published');

drop policy if exists "Editors can read all pages" on public.content_pages;
create policy "Editors can read all pages"
  on public.content_pages
  for select
  to authenticated
  using (public.is_content_editor());

drop policy if exists "Editors can insert pages" on public.content_pages;
create policy "Editors can insert pages"
  on public.content_pages
  for insert
  to authenticated
  with check (public.is_content_editor());

drop policy if exists "Editors can update pages" on public.content_pages;
create policy "Editors can update pages"
  on public.content_pages
  for update
  to authenticated
  using (public.is_content_editor())
  with check (public.is_content_editor());

drop policy if exists "Editors can delete pages" on public.content_pages;
create policy "Editors can delete pages"
  on public.content_pages
  for delete
  to authenticated
  using (public.is_content_editor());

drop policy if exists "Public can read published news" on public.news_posts;
create policy "Public can read published news"
  on public.news_posts
  for select
  to anon, authenticated
  using (status = 'published');

drop policy if exists "Editors can read all news" on public.news_posts;
create policy "Editors can read all news"
  on public.news_posts
  for select
  to authenticated
  using (public.is_content_editor());

drop policy if exists "Editors can insert news" on public.news_posts;
create policy "Editors can insert news"
  on public.news_posts
  for insert
  to authenticated
  with check (public.is_content_editor());

drop policy if exists "Editors can update news" on public.news_posts;
create policy "Editors can update news"
  on public.news_posts
  for update
  to authenticated
  using (public.is_content_editor())
  with check (public.is_content_editor());

drop policy if exists "Editors can delete news" on public.news_posts;
create policy "Editors can delete news"
  on public.news_posts
  for delete
  to authenticated
  using (public.is_content_editor());

drop policy if exists "Editors can read revisions" on public.content_revisions;
create policy "Editors can read revisions"
  on public.content_revisions
  for select
  to authenticated
  using (public.is_content_editor());

grant usage on schema public to anon, authenticated;

grant execute on function public.current_editor_email() to anon, authenticated;
grant execute on function public.is_content_editor() to anon, authenticated;

grant select, insert, update, delete on public.content_editors to authenticated;
grant select, insert, update, delete on public.content_templates to authenticated;
grant select, insert, update, delete on public.content_pages to authenticated;
grant select, insert, update, delete on public.news_posts to authenticated;
grant select on public.content_revisions to authenticated;

grant select on public.content_pages to anon;
grant select on public.news_posts to anon;

insert into public.content_templates (
  template_key,
  name,
  description,
  content_type,
  locale,
  frontmatter_schema,
  frontmatter_example,
  body_template,
  is_starter,
  is_active,
  sort_order,
  created_by,
  updated_by
)
values
(
  'news_plattform',
  'News starter: platform launch',
  'Use for product, platform, or capability launch updates.',
  'news_post',
  'nb',
  jsonb_build_object(
    'required', jsonb_build_array('slug', 'title', 'excerpt', 'date', 'tag', 'readTime', 'coverImage', 'status', 'publishAt', 'author', 'seoTitle', 'seoDescription'),
    'status', jsonb_build_array('draft', 'published')
  ),
  jsonb_build_object(
    'slug', 'ny-kandidatportal-lansert',
    'title', 'Ny kandidatportal lansert',
    'excerpt', 'Vi lanserer en ny digital plattform der arbeidsgivere enkelt kan søke gjennom forhåndsgodkjente kandidater i sanntid.',
    'date', '2026-03-10',
    'tag', 'Plattform',
    'readTime', '7 min',
    'coverImage', '/images/news/default.jpg',
    'status', 'draft',
    'publishAt', '2026-03-10T08:00:00Z',
    'author', 'Global Working',
    'seoTitle', 'Ny kandidatportal lansert',
    'seoDescription', 'Global Working lanserer ny kandidatportal for raskere matching mellom arbeidsgivere og forhåndsgodkjente kandidater.'
  ),
  E'Global Working har lansert en ny kandidatportal som gir arbeidsgivere direkte tilgang til tilgjengelige kandidater for fast ansettelse.\n\n## Hva portalen brukes til\n\n- Få rask oversikt over aktuelle kandidater\n- Gjore en forste vurdering av relevans før intervju\n- Redusere tiden fra behov til konkret kandidatdialog\n\n## Hva du faar som arbeidsgiver\n\n- Se tilgjengelige profiler for fast ansettelse\n- Prioritere kandidater som matcher rolle og behov\n- Invitere videre til intervju i neste steg\n\n## Neste steg\n\nVi videreutvikler portalen med bedre innsikt i kandidatflyt og tydeligere støtte for arbeidsgivere i vurderingsfasen.',
  true,
  true,
  10,
  null,
  null
),
(
  'news_lovgivning',
  'News starter: legislation update',
  'Use for legal, policy, or regulatory updates.',
  'news_post',
  'nb',
  jsonb_build_object(
    'required', jsonb_build_array('slug', 'title', 'excerpt', 'date', 'tag', 'readTime', 'coverImage', 'status', 'publishAt', 'author', 'seoTitle', 'seoDescription'),
    'status', jsonb_build_array('draft', 'published')
  ),
  jsonb_build_object(
    'slug', 'innkjopsgrense-juli-2026',
    'title', 'Innkjopsgrensen heves fra juli 2026',
    'excerpt', 'Fra 1. juli 2026 okes innkjopsgrensen for arbeidskraft. Dette gir nye muligheter for kommuner og helseforetak.',
    'date', '2026-02-01',
    'tag', 'Lovgivning',
    'readTime', '6 min',
    'coverImage', '/images/news/default.jpg',
    'status', 'draft',
    'publishAt', '2026-02-01T08:00:00Z',
    'author', 'Global Working',
    'seoTitle', 'Innkjopsgrensen heves fra juli 2026',
    'seoDescription', 'Oppdatert oversikt over endringen i innkjopsgrensen fra 1. juli 2026 og hva dette betyr for offentlig sektor.'
  ),
  E'Fra 1. juli 2026 omtales en heving av innkjopsgrensen i våre kanaler. For mange virksomheter i offentlig sektor kan dette gi storre fleksibilitet når bemanningsbehov ma loses raskt og innenfor gjeldende rammer.\n\n## Hva dette kan bety i praksis\n\n- Enklere planlegging av mindre innkjop\n- Raskere beslutningslop i perioder med kapasitetsutfordringer\n- Bedre mulighet til a kombinere kortsiktige og langsiktige tiltak\n\n## Hva du bor gjore for 1. juli 2026\n\n1. Oppdater interne rutiner for innkjop og godkjenning.\n2. Avklar roller mellom innkjop, HR og linjeledelse.\n3. Etabler en plan for hvilke behov som skal loses med direkte ansettelse.\n4. Sikre at språk- og kvalitetskrav er tydelige i hele lopet.\n\n## Viktigst\n\nMålet er ikke bare raskere prosess, men tryggere og mer bærekraftige ansettelser for norske tjenester.',
  true,
  true,
  20,
  null,
  null
),
(
  'news_suksesshistorie',
  'News starter: success story',
  'Use for case studies and customer stories.',
  'news_post',
  'nb',
  jsonb_build_object(
    'required', jsonb_build_array('slug', 'title', 'excerpt', 'date', 'tag', 'readTime', 'coverImage', 'status', 'publishAt', 'author', 'seoTitle', 'seoDescription'),
    'status', jsonb_build_array('draft', 'published')
  ),
  jsonb_build_object(
    'slug', 'sor-fron-integrasjon',
    'title', 'Sor-Fron kommune: En smidig integrasjon',
    'excerpt', 'Les hvordan Sor-Fron kommune integrerte en portugisisk sykepleier gjennom et strukturert sprak- og oppfolgingslop.',
    'date', '2026-01-15',
    'tag', 'Suksesshistorie',
    'readTime', '7 min',
    'coverImage', '/images/news/default.jpg',
    'status', 'draft',
    'publishAt', '2026-01-15T08:00:00Z',
    'author', 'Global Working',
    'seoTitle', 'Sor-Fron kommune: En smidig integrasjon',
    'seoDescription', 'Case fra Sor-Fron kommune om strukturert sprak- og oppfolgingslop for trygg integrasjon av ny sykepleier.'
  ),
  E'Sor-Fron kommune ønsket en løsning som ga både faglig kapasitet og trygg integrasjon i tjenesten. Erfaringen viser at internasjonal rekruttering fungerer best når språk, forventninger og oppfølging planlegges før kandidaten starter i stilling.\n\n## Utgangspunktet\n\nKommunen hadde behov for stabil bemanning og ønsket a unnga en sårbar oppstart. Målet var ikke en kortsiktig vikarordning, men en varig ansettelse med god kvalitet i hverdagen.\n\n## Slik ble prosessen gjennomført\n\n1. Kartlegging av behov i avdeling og team.\n2. Tydelig rolleprofil med språkkrav og ansvarsnivaa.\n3. Strukturert språkforberedelse før oppstart.\n4. Planlagt overgang til arbeidsgiver med klare kontaktpunkter.\n5. Tett oppfolgning i de forste ukene etter ankomst.\n\n## Hva andre kommuner kan lære\n\n- Start planleggingen tidlig, ikke etter signert kontrakt\n- Koble språkkrav direkte til arbeidsoppgaver\n- Legg inn strukturert oppfolgning de forste ukene\n\n## Hvorfor dette betyr noe\n\nGod integrasjon handler om mer enn bemanningstall. Det handler om pasient- og brukersikkerhet, kvalitet i dokumentasjon og en arbeidshverdag der nye medarbeidere blir en del av teamet raskt og trygt.',
  true,
  true,
  30,
  null,
  null
),
(
  'news_veiledning',
  'News starter: guidance article',
  'Use for practical how-to and explainer articles.',
  'news_post',
  'nb',
  jsonb_build_object(
    'required', jsonb_build_array('slug', 'title', 'excerpt', 'date', 'tag', 'readTime', 'coverImage', 'status', 'publishAt', 'author', 'seoTitle', 'seoDescription'),
    'status', jsonb_build_array('draft', 'published')
  ),
  jsonb_build_object(
    'slug', 'evaluering-sprakniva',
    'title', 'Slik evalueres norsk spraknivaa',
    'excerpt', 'Praktisk guide til CEFR-nivaaene og kravene som gjelder for ulike stillinger i det norske arbeidsmarkedet.',
    'date', '2025-12-05',
    'tag', 'Veiledning',
    'readTime', '8 min',
    'coverImage', '/images/news/default.jpg',
    'status', 'draft',
    'publishAt', '2025-12-05T08:00:00Z',
    'author', 'Global Working',
    'seoTitle', 'Slik evalueres norsk spraknivaa',
    'seoDescription', 'Praktisk oversikt over CEFR-nivaaer og hvordan norsk spraknivaa vurderes i rekruttering til ulike stillinger.'
  ),
  E'Språknivå er en av de viktigste faktorene for en trygg oppstart i norsk arbeidsliv. Når vurderingen er presis, blir onboarding kortere, samarbeidet i teamet bedre og risikoen for misforståelser lavere.\n\n## CEFR-nivaene i arbeidshverdagen\n\n- A-nivaa: grunnleggende språkbruk i enkle situasjoner\n- B-nivaa: selvstendig språkbruk i arbeidshverdagen\n- C-nivaa: avansert og nyansert språkforstaelse i komplekse faglige situasjoner\n\n## Slik far du en mer treffsikker vurdering\n\n1. Formell niva-testing som gir et strukturert utgangspunkt.\n2. Praktiske scenarioer fra faktisk arbeidshverdag.\n3. Samtaler som tester forstaelse, presisjon og tempo.\n4. Faglig terminologi relevant for rollen kandidaten skal inn i.\n\n## Malet\n\nMålet er a redusere språklig usikkerhet og gjøre overgangen til norsk arbeidsmiljo tryggere for begge parter.',
  true,
  true,
  40,
  null,
  null
)
on conflict (template_key, locale) do update
set
  name = excluded.name,
  description = excluded.description,
  content_type = excluded.content_type,
  frontmatter_schema = excluded.frontmatter_schema,
  frontmatter_example = excluded.frontmatter_example,
  body_template = excluded.body_template,
  is_starter = excluded.is_starter,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order,
  updated_at = now();

commit;
