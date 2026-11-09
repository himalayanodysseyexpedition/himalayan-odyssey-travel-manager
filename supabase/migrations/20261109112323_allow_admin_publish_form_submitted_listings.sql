drop policy if exists "admin can publish form submitted supplier listings" on public.supplier_listings;
create policy "admin can publish form submitted supplier listings"
on public.supplier_listings
for insert to authenticated
with check (
  (select auth.uid()) = '79482db3-a3f7-4773-bb8d-5a79c9d10237'::uuid
  and supplier_id is null
);
