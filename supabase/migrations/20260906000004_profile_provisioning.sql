-- Fase 1: keep public.profiles in sync with auth.users, and stop a
-- non-admin from promoting themselves via the "own row" update policy.
-- Not wired into the live app until Fase 4 (auth cutover) — safe to ship
-- now since it only reacts to auth.users, which stays empty until then.

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

create or replace function public.prevent_self_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role <> old.role and not public.is_admin() then
    new.role := old.role;
  end if;
  return new;
end;
$$;

create trigger profiles_guard_role_change
  before update on public.profiles
  for each row execute function public.prevent_self_role_escalation();
