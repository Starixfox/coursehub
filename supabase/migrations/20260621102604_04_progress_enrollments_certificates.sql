-- CourseHub :: Migration 04 — progress, enrollments, certificates
create table public.enrollments (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.profiles(id) on delete cascade,
  course_id        uuid not null references public.courses(id) on delete cascade,
  created_at       timestamptz not null default now(),
  last_accessed_at timestamptz not null default now(),
  unique (user_id, course_id)
);
create index enrollments_user_idx on public.enrollments (user_id);
create index enrollments_course_idx on public.enrollments (course_id);

create table public.lesson_progress (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references public.profiles(id) on delete cascade,
  lesson_id             uuid not null references public.lessons(id) on delete cascade,
  course_id             uuid not null references public.courses(id) on delete cascade,
  completed             boolean not null default false,
  last_position_seconds int not null default 0,
  completed_at          timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  unique (user_id, lesson_id)
);
create index lesson_progress_user_course_idx on public.lesson_progress (user_id, course_id);
create trigger lesson_progress_set_updated_at before update on public.lesson_progress
  for each row execute function public.set_updated_at();

create table public.certificates (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  serial    text not null unique,
  issued_at timestamptz not null default now(),
  unique (user_id, course_id)
);

-- ---------- progress helper ----------
create or replace function public.course_progress(p_course_id uuid, uid uuid default auth.uid())
returns table(total int, completed int, percent numeric)
language sql stable security definer set search_path = '' as $$
  select
    (select count(*)::int from public.lessons where course_id = p_course_id) as total,
    (select count(*)::int from public.lesson_progress
       where course_id = p_course_id and user_id = uid and completed) as completed,
    case
      when (select count(*) from public.lessons where course_id = p_course_id) = 0 then 0
      else round(
        100.0 * (select count(*) from public.lesson_progress
                   where course_id = p_course_id and user_id = uid and completed)
        / (select count(*) from public.lessons where course_id = p_course_id), 1)
    end as percent;
$$;

-- ---------- certificate issuance (server-verified, premium only) ----------
create or replace function public.issue_certificate(p_course_id uuid, uid uuid default auth.uid())
returns public.certificates language plpgsql security definer set search_path = '' as $$
declare
  v_total int;
  v_done  int;
  v_cert  public.certificates;
begin
  if not public.has_tier_access('premium', uid) then
    raise exception 'Certificates require the Premium tier';
  end if;

  select count(*) into v_total from public.lessons where course_id = p_course_id;
  select count(*) into v_done  from public.lesson_progress
    where course_id = p_course_id and user_id = uid and completed = true;

  if v_total = 0 or v_done < v_total then
    raise exception 'Course is not fully completed';
  end if;

  insert into public.certificates (user_id, course_id, serial)
  values (uid, p_course_id, 'CH-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12)))
  on conflict (user_id, course_id) do update set issued_at = public.certificates.issued_at
  returning * into v_cert;

  return v_cert;
end;
$$;

grant execute on function public.course_progress(uuid, uuid) to authenticated;
grant execute on function public.issue_certificate(uuid, uuid) to authenticated;

-- ---------- RLS ----------
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.certificates enable row level security;

-- enrollments: user owns own; creators can read enrollments of their courses; admin all
create policy "enrollments_rw_self" on public.enrollments
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "enrollments_creator_read" on public.enrollments
  for select using (public.course_is_editable(course_id));
create policy "enrollments_admin_read" on public.enrollments
  for select using (public.is_admin());

-- lesson_progress: user owns own; creators/admin can read for analytics
create policy "progress_rw_self" on public.lesson_progress
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "progress_creator_read" on public.lesson_progress
  for select using (public.course_is_editable(course_id));

-- certificates: read own / creator-of-course / admin; insert ONLY via issue_certificate()
create policy "certificates_select_self" on public.certificates
  for select using (user_id = auth.uid() or public.course_is_editable(course_id) or public.is_admin());
-- no insert/update/delete policy: only the SECURITY DEFINER function may create them
