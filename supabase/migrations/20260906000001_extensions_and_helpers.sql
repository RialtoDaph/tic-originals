-- Fase 1: base extensions + helper functions shared by every table below.
-- Mirrors Base44's implicit per-record fields (created_date, updated_date,
-- created_by) and its RLS `user_condition: { role: "admin" }` checks.

create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- profiles.role backs every `user_condition: { role: "admin" }` check that
-- Base44 entities declare. security definer avoids RLS recursion when this
-- function is itself called from a policy on the profiles table.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Base44 stamps created_by with the acting user's email automatically;
-- reproduce that so RLS clauses like `data.created_by = "{{user.email}}"`
-- (see Review) keep working without every insert having to set it by hand.
create or replace function public.set_created_by()
returns trigger
language plpgsql
as $$
begin
  if new.created_by is null then
    new.created_by := auth.jwt() ->> 'email';
  end if;
  return new;
end;
$$;
