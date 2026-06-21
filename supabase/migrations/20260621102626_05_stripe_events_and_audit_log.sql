-- CourseHub :: Migration 05 — webhook idempotency + audit trail
create table public.stripe_events (
  id           text primary key,          -- Stripe event id (idempotency key)
  type         text not null,
  payload      jsonb,
  processed_at timestamptz not null default now()
);
alter table public.stripe_events enable row level security;
-- no policies: service_role only (bypasses RLS). Clients can never read/write.

create table public.audit_log (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references public.profiles(id) on delete set null,
  action      text not null,
  target_type text,
  target_id   text,
  metadata    jsonb not null default '{}'::jsonb,
  ip          text,
  user_agent  text,
  created_at  timestamptz not null default now()
);
create index audit_log_actor_idx on public.audit_log (actor_id, created_at desc);
create index audit_log_action_idx on public.audit_log (action, created_at desc);

alter table public.audit_log enable row level security;
create policy "audit_log_admin_read" on public.audit_log
  for select using (public.is_admin());
-- no insert policy: writes go through log_audit_event() (security definer) or service_role.

create or replace function public.log_audit_event(
  p_action      text,
  p_target_type text default null,
  p_target_id   text default null,
  p_metadata    jsonb default '{}'::jsonb,
  p_ip          text default null,
  p_user_agent  text default null
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_id uuid;
begin
  insert into public.audit_log (actor_id, action, target_type, target_id, metadata, ip, user_agent)
  values (auth.uid(), p_action, p_target_type, p_target_id, coalesce(p_metadata, '{}'::jsonb), p_ip, p_user_agent)
  returning id into v_id;
  return v_id;
end;
$$;

grant execute on function public.log_audit_event(text, text, text, jsonb, text, text) to authenticated;
