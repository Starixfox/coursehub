-- CourseHub :: Migration 03 — courses / modules / lessons / gated lesson_content
create table public.courses (
  id             uuid primary key default gen_random_uuid(),
  creator_id     uuid not null references public.profiles(id) on delete restrict,
  creator_name   text,                         -- denormalized for public pages (no profiles RLS leak)
  title          text not null,
  slug           text not null unique,
  subtitle       text,
  description    text,
  thumbnail_path text,                          -- Supabase Storage path; served via signed URL
  category       text,
  level          text check (level in ('beginner','intermediate','advanced')),
  required_tier  public.subscription_tier not null default 'basic',
  status         public.course_status not null default 'draft',
  published_at   timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index courses_creator_idx on public.courses (creator_id);
create index courses_status_idx on public.courses (status);
create index courses_category_idx on public.courses (category);
create trigger courses_set_updated_at before update on public.courses
  for each row execute function public.set_updated_at();

create table public.modules (
  id         uuid primary key default gen_random_uuid(),
  course_id  uuid not null references public.courses(id) on delete cascade,
  title      text not null,
  position   int not null default 0,
  created_at timestamptz not null default now()
);
create index modules_course_idx on public.modules (course_id);

create table public.lessons (
  id               uuid primary key default gen_random_uuid(),
  module_id        uuid not null references public.modules(id) on delete cascade,
  course_id        uuid not null references public.courses(id) on delete cascade,
  title            text not null,
  slug             text,
  position         int not null default 0,
  duration_seconds int not null default 0,
  is_preview       boolean not null default false,    -- free preview lesson
  required_tier    public.subscription_tier,          -- null => inherits course.required_tier
  has_video        boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index lessons_module_idx on public.lessons (module_id);
create index lessons_course_idx on public.lessons (course_id);
create unique index lessons_course_slug_idx on public.lessons (course_id, slug) where slug is not null;
create trigger lessons_set_updated_at before update on public.lessons
  for each row execute function public.set_updated_at();

-- Gated content lives in its own table so RLS can hide it independently of lesson metadata.
create table public.lesson_content (
  lesson_id     uuid primary key references public.lessons(id) on delete cascade,
  content_html  text,                 -- sanitized server-side before write
  content_json  jsonb,                -- optional structured editor blocks
  cf_stream_uid text,                 -- Cloudflare Stream video UID
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create trigger lesson_content_set_updated_at before update on public.lesson_content
  for each row execute function public.set_updated_at();

-- ---------- visibility / edit / access helpers ----------
create or replace function public.course_is_visible(p_course_id uuid, uid uuid default auth.uid())
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.courses c
    where c.id = p_course_id
      and (c.status = 'published' or c.creator_id = uid or public.is_admin(uid))
  );
$$;

create or replace function public.course_is_editable(p_course_id uuid, uid uuid default auth.uid())
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.courses c
    where c.id = p_course_id and (c.creator_id = uid or public.is_admin(uid))
  );
$$;

create or replace function public.effective_lesson_tier(p_lesson_id uuid)
returns public.subscription_tier language sql stable security definer set search_path = '' as $$
  select coalesce(l.required_tier, c.required_tier)
  from public.lessons l join public.courses c on c.id = l.course_id
  where l.id = p_lesson_id;
$$;

-- THE per-lesson gate — used by lesson_content RLS AND the video-token route
create or replace function public.can_access_lesson(p_lesson_id uuid, uid uuid default auth.uid())
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1
    from public.lessons l
    join public.courses c on c.id = l.course_id
    where l.id = p_lesson_id
      and (
        l.is_preview = true
        or c.creator_id = uid
        or public.is_admin(uid)
        or public.has_tier_access(coalesce(l.required_tier, c.required_tier), uid)
      )
  );
$$;

grant execute on function public.course_is_visible(uuid, uuid) to anon, authenticated;
grant execute on function public.course_is_editable(uuid, uuid) to authenticated;
grant execute on function public.effective_lesson_tier(uuid) to anon, authenticated;
grant execute on function public.can_access_lesson(uuid, uuid) to anon, authenticated;

-- ---------- RLS ----------
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_content enable row level security;

-- courses
create policy "courses_select_visible" on public.courses
  for select using (status = 'published' or creator_id = auth.uid() or public.is_admin());
create policy "courses_insert_own" on public.courses
  for insert with check (creator_id = auth.uid() and public.is_creator_or_admin());
create policy "courses_update_own" on public.courses
  for update using (creator_id = auth.uid() or public.is_admin())
  with check (creator_id = auth.uid() or public.is_admin());
create policy "courses_delete_own" on public.courses
  for delete using (creator_id = auth.uid() or public.is_admin());

-- modules
create policy "modules_select_visible" on public.modules
  for select using (public.course_is_visible(course_id));
create policy "modules_write_editable" on public.modules
  for all using (public.course_is_editable(course_id))
  with check (public.course_is_editable(course_id));

-- lessons (metadata public for published courses)
create policy "lessons_select_visible" on public.lessons
  for select using (public.course_is_visible(course_id));
create policy "lessons_write_editable" on public.lessons
  for all using (public.course_is_editable(course_id))
  with check (public.course_is_editable(course_id));

-- lesson_content (GATED by tier / preview / ownership)
create policy "lesson_content_select_gated" on public.lesson_content
  for select using (public.can_access_lesson(lesson_id));
create policy "lesson_content_write_editable" on public.lesson_content
  for all using (
    exists (select 1 from public.lessons l where l.id = lesson_id and public.course_is_editable(l.course_id))
  ) with check (
    exists (select 1 from public.lessons l where l.id = lesson_id and public.course_is_editable(l.course_id))
  );
