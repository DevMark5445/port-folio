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

revoke all on function public.is_project_admin() from public;
grant execute on function public.is_project_admin() to authenticated;

notify pgrst, 'reload schema';
