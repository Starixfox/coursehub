-- CourseHub :: Migration 06 — storage buckets + path-scoped RLS
insert into storage.buckets (id, name, public)
values ('course-media', 'course-media', false),
       ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- safe uuid cast so a malformed object path denies instead of erroring
create or replace function public.safe_uuid(t text)
returns uuid language plpgsql immutable set search_path = '' as $$
begin
  return t::uuid;
exception when others then
  return null;
end;
$$;
grant execute on function public.safe_uuid(text) to anon, authenticated;

-- course-media (private): only the owning course's editors may touch its folder.
-- Public/consumer reads happen via server-minted signed URLs (service_role).
create policy "course_media_read_editor" on storage.objects
  for select to authenticated
  using (bucket_id = 'course-media' and public.course_is_editable(public.safe_uuid((storage.foldername(name))[1])));
create policy "course_media_insert_editor" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'course-media' and public.course_is_editable(public.safe_uuid((storage.foldername(name))[1])));
create policy "course_media_update_editor" on storage.objects
  for update to authenticated
  using (bucket_id = 'course-media' and public.course_is_editable(public.safe_uuid((storage.foldername(name))[1])));
create policy "course_media_delete_editor" on storage.objects
  for delete to authenticated
  using (bucket_id = 'course-media' and public.course_is_editable(public.safe_uuid((storage.foldername(name))[1])));

-- avatars (public read via bucket): users may only write their own {user_id}/ folder
create policy "avatars_insert_own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars_update_own" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars_delete_own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
