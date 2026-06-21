-- CourseHub :: Migration 02 — subscriptions (entitlement source of truth) + tier engine
create table public.subscriptions (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references public.profiles(id) on delete cascade,
  stripe_customer_id     text,
  stripe_subscription_id text,
  tier                   public.subscription_tier not null default 'free',
  status                 public.subscription_status not null default 'active',
  billing_interval       public.billing_interval,
  current_period_end     timestamptz,
  cancel_at_period_end   boolean not null default false,
  seats                  int not null default 1,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  unique (user_id)
);
create index subscriptions_stripe_customer_idx on public.subscriptions (stripe_customer_id);
create index subscriptions_stripe_sub_idx on public.subscriptions (stripe_subscription_id);

create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

alter table public.subscriptions enable row level security;

-- ---------- tier engine ----------
create or replace function public.tier_rank(t public.subscription_tier)
returns int language sql immutable set search_path = '' as $$
  select case t
    when 'free' then 0
    when 'basic' then 1
    when 'pro' then 2
    when 'premium' then 3
  end;
$$;

-- effective current tier for a user: only counts if the sub is live
create or replace function public.current_tier(uid uuid default auth.uid())
returns public.subscription_tier language sql stable security definer set search_path = '' as $$
  select coalesce(
    (select s.tier
       from public.subscriptions s
      where s.user_id = uid
        and s.status in ('active','trialing')
        and (s.current_period_end is null or s.current_period_end > now())
      limit 1),
    'free'::public.subscription_tier
  );
$$;

-- THE entitlement gate — used by RLS policies AND server code
create or replace function public.has_tier_access(
  required public.subscription_tier,
  uid uuid default auth.uid()
) returns boolean language sql stable security definer set search_path = '' as $$
  select public.tier_rank(public.current_tier(uid)) >= public.tier_rank(required);
$$;

grant execute on function public.tier_rank(public.subscription_tier) to anon, authenticated;
grant execute on function public.current_tier(uuid) to authenticated;
grant execute on function public.has_tier_access(public.subscription_tier, uuid) to authenticated;

-- ---------- subscriptions policies (clients read own; only service_role writes) ----------
create policy "subscriptions_select_self" on public.subscriptions
  for select using (user_id = auth.uid());
create policy "subscriptions_admin_select" on public.subscriptions
  for select using (public.is_admin());
-- NOTE: no insert/update/delete policy on purpose. Only the Stripe webhook
-- (service_role, which bypasses RLS) may mutate subscriptions. Clients can
-- never fabricate entitlement.
