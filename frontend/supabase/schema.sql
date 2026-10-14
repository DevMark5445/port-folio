create table if not exists public.project_admin (
  singleton boolean primary key default true check (singleton),
  user_id uuid not null references auth.users (id) on delete cascade,
  username text unique check (char_length(username) between 3 and 40)
);

alter table public.project_admin
  add column if not exists username text;

update public.project_admin
set username = lower(
  coalesce(
    username,
    split_part((select email from auth.users where auth.users.id = public.project_admin.user_id), '@', 1)
  )
)
where username is null;

alter table public.project_admin
  alter column username set not null;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 120),
  category text not null check (char_length(category) between 1 and 80),
  description text not null check (char_length(description) between 1 and 1000),
  image_url text check (
    image_url is null
    or image_url ~* '^https?://'
    or image_url ~ '^/projects/[A-Za-z0-9._-]+$'
  ),
  image_alt text check (image_alt is null or char_length(image_alt) <= 250),
  repository_url text check (repository_url is null or repository_url ~* '^https?://'),
  live_url text check (live_url is null or live_url ~* '^https?://'),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.project_admin enable row level security;
alter table public.projects enable row level security;

create or replace function public.is_project_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.project_admin
    where user_id = (select auth.uid())
  );
$$;

create or replace function public.get_admin_email_for_username(p_username text)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select au.email
  from public.project_admin pa
  join auth.users au on au.id = pa.user_id
  where lower(pa.username) = lower(p_username)
  limit 1;
$$;

revoke all on function public.is_project_admin() from public;
grant execute on function public.is_project_admin() to authenticated;
revoke all on function public.get_admin_email_for_username(text) from public;
grant execute on function public.get_admin_email_for_username(text) to authenticated;

drop policy if exists "Anyone can read projects" on public.projects;
create policy "Anyone can read projects"
  on public.projects for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins can insert projects" on public.projects;
create policy "Admins can insert projects"
  on public.projects for insert
  to authenticated
  with check ((select public.is_project_admin()));

drop policy if exists "Admins can update projects" on public.projects;
create policy "Admins can update projects"
  on public.projects for update
  to authenticated
  using ((select public.is_project_admin()))
  with check ((select public.is_project_admin()));

drop policy if exists "Admins can delete projects" on public.projects;
create policy "Admins can delete projects"
  on public.projects for delete
  to authenticated
  using ((select public.is_project_admin()));

grant select on public.projects to anon, authenticated;
grant insert, update, delete on public.projects to authenticated;

insert into public.projects (
  id, title, category, description, image_url, image_alt, repository_url, live_url, sort_order
)
values
  (
    '4f97d8a4-1093-4df6-ae79-7e07d0d715b6',
    'Westlands Church Website',
    'Church website',
    'A live website project created for Westlands Church.',
    '/projects/westlands-church-project.png',
    'Screenshot of the Westlands P.A.G Church website homepage',
    'https://github.com/DevMark5445/Westlands-church',
    'https://westlands-church-9ncv.vercel.app',
    0
  ),
  (
    'b2372846-30f5-4fd9-82cc-a10a455f5d5e',
    'Hospital Queue System',
    'Queue management',
    'A web project for organizing queues in a hospital setting.',
    '/projects/hospital-queue-project.jpg',
    'Hospital waiting room image used by the queue system project',
    'https://github.com/DevMark5445/Hospital-qeue-system',
    'https://hospital-queue-system.vercel.app',
    1
  )
on conflict (id) do nothing;
