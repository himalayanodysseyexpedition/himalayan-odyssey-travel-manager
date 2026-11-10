drop policy if exists "Admin manages marketplace services" on public.marketplace_services;

create policy "Admin inserts marketplace services"
  on public.marketplace_services for insert to authenticated
  with check ((select auth.uid()) = '79482db3-a3f7-4773-bb8d-5a79c9d10237'::uuid and owner_id = (select auth.uid()));

create policy "Admin updates marketplace services"
  on public.marketplace_services for update to authenticated
  using ((select auth.uid()) = '79482db3-a3f7-4773-bb8d-5a79c9d10237'::uuid)
  with check ((select auth.uid()) = '79482db3-a3f7-4773-bb8d-5a79c9d10237'::uuid and owner_id = (select auth.uid()));

create policy "Admin deletes marketplace services"
  on public.marketplace_services for delete to authenticated
  using ((select auth.uid()) = '79482db3-a3f7-4773-bb8d-5a79c9d10237'::uuid);

drop policy if exists "Admin manages marketplace enquiries" on public.marketplace_enquiries;

create policy "Admin views marketplace enquiries"
  on public.marketplace_enquiries for select to authenticated
  using ((select auth.uid()) = '79482db3-a3f7-4773-bb8d-5a79c9d10237'::uuid);

create policy "Admin updates marketplace enquiries"
  on public.marketplace_enquiries for update to authenticated
  using ((select auth.uid()) = '79482db3-a3f7-4773-bb8d-5a79c9d10237'::uuid)
  with check ((select auth.uid()) = '79482db3-a3f7-4773-bb8d-5a79c9d10237'::uuid);