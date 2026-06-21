-- CourseHub :: Migration 08 — move SECURITY DEFINER helpers into non-exposed `private` schema
create schema if not exists private;
grant usage on schema private to anon, authenticated;

-- ---------- drop policies that reference the public helpers ----------
drop policy if exists "profiles_admin_all" on public.profiles;
drop policy if exists "subscriptions_admin_select" on public.subscriptions;
drop policy if exists "courses_select_visible" on public.courses;
drop policy if exists "courses_insert_own" on public.courses;
drop policy if exists "courses_update_own" on public.courses;
drop policy if exists "courses_delete_own" on public.courses;
drop policy if exists "modules_select_visible" on public.modules;
drop policy if exists "modules_write_editable" on public.modules;
drop policy if exists "lessons_select_visible" on public.lessons;
drop policy if exists "lessons_write_editable" on public.lessons;
drop policy if exists "lesson_content_select_gated" on public.lesson_content;
drop policy if exists "lesson_content_write_editable" on public.lesson_content;
drop policy if exists "enrollments_creator_read" on public.enrollments;
drop policy if exists "enrollments_admin_read" on public.enrollments;
drop policy if exists "progress_creator_read" on public.lesson_progress;
drop policy if exists "certificates_select_self" on public.certificates;
drop policy if exists "audit_log_admin_read" on public.audit_log;
drop policy if exists "course_media_read_editor" on storage.objects;
drop policy if exists "course_media_insert_editor" on storage.objects;
drop policy if exists "course_media_update_editor" on storage.objects;
drop policy if exists "course_media_delete_editor" on storage.objects;

-- ---------- drop trigger + public functions ----------
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop function if exists public.is_admin(uuid);
drop function if exists public.is_creator_or_admin(uuid);
drop function if exists public.tier_rank(public.subscription_tier);
drop function if exists public.current_tier(uuid);
drop function if exists public.has_tier_access(public.subscription_tier, uuid);
drop function if exists public.course_is_visible(uuid, uuid);
drop function if exists public.course_is_editable(uuid, uuid);
drop function if exists public.effective_lesson_tier(uuid);
drop function if exists public.can_access_lesson(uuid, uuid);
drop function if exists public.course_progress(uuid, uuid);
drop function if exists public.issue_certificate(uuid, uuid);
drop function if exists public.log_audit_event(text, text, text, jsonb, text, text);
drop function if exists public.safe_uuid(text);

-- ---------- recreate helpers in private ----------
create function private.is_admin(uid uuid default auth.uid())
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles p where p.id = uid and p.role = 'admin');
$$;
create function private.is_creator_or_admin(uid uuid default auth.uid())
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles p where p.id = uid and p.role in ('creator','admin'));
$$;
create function private.tier_rank(t public.subscription_tier)
returns int language sql immutable set search_path = '' as $$
  select case t when 'free' then 0 when 'basic' then 1 when 'pro' then 2 when 'premium' then 3 end;
$$;
create function private.current_tier(uid uuid default auth.uid())
returns public.subscription_tier language sql stable security definer set search_path = '' as $$
  select coalesce(
    (select s.tier from public.subscriptions s
      where s.user_id = uid and s.status in ('active','trialing')
        and (s.current_period_end is null or s.current_period_end > now()) limit 1),
    'free'::public.subscription_tier);
$$;
create function private.has_tier_access(required public.subscription_tier, uid uuid default auth.uid())
returns boolean language sql stable security definer set search_path = '' as $$
  select private.tier_rank(private.current_tier(uid)) >= private.tier_rank(required);
$$;
create function private.course_is_visible(p_course_id uuid, uid uuid default auth.uid())
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.courses c where c.id = p_course_id
    and (c.status = 'published' or c.creator_id = uid or private.is_admin(uid)));
$$;
create function private.course_is_editable(p_course_id uuid, uid uuid default auth.uid())
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.courses c where c.id = p_course_id
    and (c.creator_id = uid or private.is_admin(uid)));
$$;
create function private.effective_lesson_tier(p_lesson_id uuid)
returns public.subscription_tier language sql stable security definer set search_path = '' as $$
  select coalesce(l.required_tier, c.required_tier) from public.lessons l
    join public.courses c on c.id = l.course_id where l.id = p_lesson_id;
$$;
create function private.can_access_lesson(p_lesson_id uuid, uid uuid default auth.uid())
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.lessons l join public.courses c on c.id = l.course_id
    where l.id = p_lesson_id and (l.is_preview = true or c.creator_id = uid or private.is_admin(uid)
      or private.has_tier_access(coalesce(l.required_tier, c.required_tier), uid)));
$$;
create function private.course_progress(p_course_id uuid, uid uuid default auth.uid())
returns table(total int, completed int, percent numeric) language sql stable security definer set search_path = '' as $$
  select (select count(*)::int from public.lessons where course_id = p_course_id),
    (select count(*)::int from public.lesson_progress where course_id = p_course_id and user_id = uid and completed),
    case when (select count(*) from public.lessons where course_id = p_course_id) = 0 then 0
      else round(100.0 * (select count(*) from public.lesson_progress where course_id = p_course_id and user_id = uid and completed)
        / (select count(*) from public.lessons where course_id = p_course_id), 1) end;
$$;
create function private.issue_certificate(p_course_id uuid, uid uuid default auth.uid())
returns public.certificates language plpgsql security definer set search_path = '' as $$
declare v_total int; v_done int; v_cert public.certificates;
begin
  if not private.has_tier_access('premium', uid) then raise exception 'Certificates require the Premium tier'; end if;
  select count(*) into v_total from public.lessons where course_id = p_course_id;
  select count(*) into v_done  from public.lesson_progress where course_id = p_course_id and user_id = uid and completed = true;
  if v_total = 0 or v_done < v_total then raise exception 'Course is not fully completed'; end if;
  insert into public.certificates (user_id, course_id, serial)
  values (uid, p_course_id, 'CH-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12)))
  on conflict (user_id, course_id) do update set issued_at = public.certificates.issued_at returning * into v_cert;
  return v_cert;
end; $$;
create function private.log_audit_event(p_action text, p_target_type text default null, p_target_id text default null,
  p_metadata jsonb default '{}'::jsonb, p_ip text default null, p_user_agent text default null)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_id uuid;
begin
  insert into public.audit_log (actor_id, action, target_type, target_id, metadata, ip, user_agent)
  values (auth.uid(), p_action, p_target_type, p_target_id, coalesce(p_metadata,'{}'::jsonb), p_ip, p_user_agent) returning id into v_id;
  return v_id;
end; $$;
create function private.safe_uuid(t text) returns uuid language plpgsql immutable set search_path = '' as $$
begin return t::uuid; exception when others then return null; end; $$;
create function private.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  return new;
end; $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function private.handle_new_user();

-- ---------- recreate policies referencing private.* ----------
create policy "profiles_admin_all" on public.profiles for all using (private.is_admin()) with check (private.is_admin());
create policy "subscriptions_admin_select" on public.subscriptions for select using (private.is_admin());

create policy "courses_select_visible" on public.courses for select using (status='published' or creator_id=auth.uid() or private.is_admin());
create policy "courses_insert_own" on public.courses for insert with check (creator_id=auth.uid() and private.is_creator_or_admin());
create policy "courses_update_own" on public.courses for update using (creator_id=auth.uid() or private.is_admin()) with check (creator_id=auth.uid() or private.is_admin());
create policy "courses_delete_own" on public.courses for delete using (creator_id=auth.uid() or private.is_admin());

create policy "modules_select_visible" on public.modules for select using (private.course_is_visible(course_id));
create policy "modules_write_editable" on public.modules for all using (private.course_is_editable(course_id)) with check (private.course_is_editable(course_id));

create policy "lessons_select_visible" on public.lessons for select using (private.course_is_visible(course_id));
create policy "lessons_write_editable" on public.lessons for all using (private.course_is_editable(course_id)) with check (private.course_is_editable(course_id));

create policy "lesson_content_select_gated" on public.lesson_content for select using (private.can_access_lesson(lesson_id));
create policy "lesson_content_write_editable" on public.lesson_content for all
  using (exists (select 1 from public.lessons l where l.id=lesson_id and private.course_is_editable(l.course_id)))
  with check (exists (select 1 from public.lessons l where l.id=lesson_id and private.course_is_editable(l.course_id)));

create policy "enrollments_creator_read" on public.enrollments for select using (private.course_is_editable(course_id));
create policy "enrollments_admin_read" on public.enrollments for select using (private.is_admin());
create policy "progress_creator_read" on public.lesson_progress for select using (private.course_is_editable(course_id));
create policy "certificates_select_self" on public.certificates for select using (user_id=auth.uid() or private.course_is_editable(course_id) or private.is_admin());
create policy "audit_log_admin_read" on public.audit_log for select using (private.is_admin());

create policy "course_media_read_editor" on storage.objects for select to authenticated
  using (bucket_id='course-media' and private.course_is_editable(private.safe_uuid((storage.foldername(name))[1])));
create policy "course_media_insert_editor" on storage.objects for insert to authenticated
  with check (bucket_id='course-media' and private.course_is_editable(private.safe_uuid((storage.foldername(name))[1])));
create policy "course_media_update_editor" on storage.objects for update to authenticated
  using (bucket_id='course-media' and private.course_is_editable(private.safe_uuid((storage.foldername(name))[1])));
create policy "course_media_delete_editor" on storage.objects for delete to authenticated
  using (bucket_id='course-media' and private.course_is_editable(private.safe_uuid((storage.foldername(name))[1])));

-- explicit deny-all on stripe_events (service_role bypasses RLS) — clears the linter INFO
create policy "stripe_events_no_client_access" on public.stripe_events
  for all to anon, authenticated using (false) with check (false);

-- ---------- grants (RLS needs the executing role to hold EXECUTE) ----------
revoke execute on all functions in schema private from public;
grant execute on function private.is_admin(uuid)                                  to anon, authenticated;
grant execute on function private.is_creator_or_admin(uuid)                       to anon, authenticated;
grant execute on function private.tier_rank(public.subscription_tier)             to anon, authenticated;
grant execute on function private.current_tier(uuid)                              to anon, authenticated;
grant execute on function private.has_tier_access(public.subscription_tier, uuid) to anon, authenticated;
grant execute on function private.course_is_visible(uuid, uuid)                   to anon, authenticated;
grant execute on function private.course_is_editable(uuid, uuid)                  to anon, authenticated;
grant execute on function private.effective_lesson_tier(uuid)                     to anon, authenticated;
grant execute on function private.can_access_lesson(uuid, uuid)                   to anon, authenticated;
grant execute on function private.safe_uuid(text)                                 to anon, authenticated;
grant execute on function private.course_progress(uuid, uuid)                     to authenticated;
grant execute on function private.issue_certificate(uuid, uuid)                   to authenticated;

-- ---------- safe public RPC wrappers (SECURITY INVOKER, hard-bound to auth.uid()) ----------
create function public.my_current_tier()
returns public.subscription_tier language sql stable security invoker set search_path = '' as $$
  select private.current_tier(auth.uid());
$$;
create function public.my_course_progress(p_course_id uuid)
returns table(total int, completed int, percent numeric) language sql stable security invoker set search_path = '' as $$
  select * from private.course_progress(p_course_id, auth.uid());
$$;
create function public.can_i_access_lesson(p_lesson_id uuid)
returns boolean language sql stable security invoker set search_path = '' as $$
  select private.can_access_lesson(p_lesson_id, auth.uid());
$$;
create function public.claim_certificate(p_course_id uuid)
returns public.certificates language sql volatile security invoker set search_path = '' as $$
  select private.issue_certificate(p_course_id, auth.uid());
$$;

revoke execute on function public.my_current_tier()        from public, anon;
revoke execute on function public.my_course_progress(uuid) from public, anon;
revoke execute on function public.can_i_access_lesson(uuid) from public, anon;
revoke execute on function public.claim_certificate(uuid)  from public, anon;
grant  execute on function public.my_current_tier()        to authenticated;
grant  execute on function public.my_course_progress(uuid) to authenticated;
grant  execute on function public.can_i_access_lesson(uuid) to authenticated;
grant  execute on function public.claim_certificate(uuid)  to authenticated;
