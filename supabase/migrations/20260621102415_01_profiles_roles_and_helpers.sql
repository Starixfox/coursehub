-- CourseHub :: Migration 01 — extensions, enums, profiles, role helpers
create extension if not exists pgcrypto;

-- ---------- Enums ----------
create type public.user_role as enum ('admin','creator','subscriber');
create type public.subscription_tier as enum ('free','basic','pro','premium');
create type public.subscription_status as enum
  ('trialing','active','past_due','canceled','incomplete','incomplete_expired','unpaid','paused');
create type public.course_status as enum ('draft','published','archived');
create type public.billing_interval as enum ('month','year');

-- ---------- updated_at helper ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- profiles ----------
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  full_name   text,
  avatar_url  text,
  role        public.user_role not null default 'subscriber',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

-- ---------- role helpers (SECURITY DEFINER -> avoid recursive RLS on profiles) ----------
create or replace function public.is_admin(uid uuid default auth.uid())
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles p where p.id = uid and p.role = 'admin');
$$;

create or replace function public.is_creator_or_admin(uid uuid default auth.uid())
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles p where p.id = uid and p.role in ('creator','admin'));
$$;

revoke execute on function public.is_admin(uuid) from anon;
revoke execute on function public.is_creator_or_admin(uuid) from anon;

-- ---------- profiles policies ----------
create policy "profiles_select_self" on public.profiles
  for select using (id = auth.uid());
create policy "profiles_update_self" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));
create policy "profiles_admin_all" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- auth.users -> profiles bootstrap ----------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
