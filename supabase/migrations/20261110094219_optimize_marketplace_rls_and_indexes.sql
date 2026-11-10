create index if not exists marketplace_services_owner_id_idx
  on public.marketplace_services(owner_id);

drop policy if exists "Guests can view active marketplace services" on public.marketplace_services;
create policy "Guests can view active marketplace services"
  on public.marketplace_services for select to anon, authenticated
  using (is_active = true or (select auth.uid()) = '79482db3-a3f7-4773-bb8d-5a79c9d10237'::uuid);

drop policy if exists "Admin manages marketplace services" on public.marketplace_services;
create policy "Admin manages marketplace services"
  on public.marketplace_services for all to authenticated
  using ((select auth.uid()) = '79482db3-a3f7-4773-bb8d-5a79c9d10237'::uuid)
  with check ((select auth.uid()) = '79482db3-a3f7-4773-bb8d-5a79c9d10237'::uuid and owner_id = (select auth.uid()));

drop policy if exists "Admin manages marketplace enquiries" on public.marketplace_enquiries;
create policy "Admin manages marketplace enquiries"
  on public.marketplace_enquiries for all to authenticated
  using ((select auth.uid()) = '79482db3-a3f7-4773-bb8d-5a79c9d10237'::uuid)
  with check ((select auth.uid()) = '79482db3-a3f7-4773-bb8d-5a79c9d10237'::uuid);