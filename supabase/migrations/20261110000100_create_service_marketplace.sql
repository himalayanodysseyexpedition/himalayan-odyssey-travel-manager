-- Service Marketplace: owner-managed cabs, hotels and tour packages.
-- Existing guest marketplace and supplier listings remain unchanged.
create table if not exists public.marketplace_services (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  category text not null check (category in ('cab','hotel','package')),
  title text not null check (char_length(btrim(title)) between 2 and 150),
  destination text not null default '',
  description text not null default '',
  price numeric(12,2) not null check (price >= 0),
  price_unit text not null check (price_unit in ('per_vehicle_day','per_person_night','per_person')),
  inventory integer not null default 0 check (inventory >= 0),
  capacity integer check (capacity is null or capacity >= 1),
  image_url text,
  storage_path text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists marketplace_services_public_idx
  on public.marketplace_services(category, is_active, sort_order, created_at desc);
alter table public.marketplace_services enable row level security;
grant select on public.marketplace_services to anon, authenticated;
grant insert, update, delete on public.marketplace_services to authenticated;
drop policy if exists "Guests can view active marketplace services" on public.marketplace_services;
create policy "Guests can view active marketplace services"
  on public.marketplace_services for select to anon, authenticated
  using (is_active = true or auth.uid() = '79482db3-a3f7-4773-bb8d-5a79c9d10237'::uuid);
drop policy if exists "Admin manages marketplace services" on public.marketplace_services;
create policy "Admin manages marketplace services"
  on public.marketplace_services for all to authenticated
  using (auth.uid() = '79482db3-a3f7-4773-bb8d-5a79c9d10237'::uuid)
  with check (auth.uid() = '79482db3-a3f7-4773-bb8d-5a79c9d10237'::uuid and owner_id = auth.uid());

create table if not exists public.marketplace_enquiries (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null check (char_length(btrim(guest_name)) between 2 and 100),
  guest_phone text not null check (char_length(regexp_replace(guest_phone, '[^0-9+]', '', 'g')) between 10 and 16),
  travel_date date,
  guest_count integer not null default 1 check (guest_count between 1 and 100),
  selections jsonb not null check (jsonb_typeof(selections) = 'array' and jsonb_array_length(selections) between 1 and 40),
  estimated_total numeric(12,2) not null check (estimated_total >= 0),
  status text not null default 'new' check (status in ('new','contacted','confirmed','closed')),
  source text not null default 'website',
  created_at timestamptz not null default now()
);
create index if not exists marketplace_enquiries_created_idx
  on public.marketplace_enquiries(created_at desc);
alter table public.marketplace_enquiries enable row level security;
grant insert on public.marketplace_enquiries to anon, authenticated;
grant select, update on public.marketplace_enquiries to authenticated;
drop policy if exists "Guests can submit marketplace enquiries" on public.marketplace_enquiries;
create policy "Guests can submit marketplace enquiries"
  on public.marketplace_enquiries for insert to anon, authenticated
  with check (
    char_length(btrim(guest_name)) between 2 and 100
    and char_length(regexp_replace(guest_phone, '[^0-9+]', '', 'g')) between 10 and 16
    and jsonb_typeof(selections) = 'array'
    and jsonb_array_length(selections) between 1 and 40
    and estimated_total >= 0
  );
drop policy if exists "Admin manages marketplace enquiries" on public.marketplace_enquiries;
create policy "Admin manages marketplace enquiries"
  on public.marketplace_enquiries for all to authenticated
  using (auth.uid() = '79482db3-a3f7-4773-bb8d-5a79c9d10237'::uuid)
  with check (auth.uid() = '79482db3-a3f7-4773-bb8d-5a79c9d10237'::uuid);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('marketplace-service-photos','marketplace-service-photos',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 5242880, allowed_mime_types = array['image/jpeg','image/png','image/webp'];

drop policy if exists "Public can view marketplace service photos" on storage.objects;
create policy "Public can view marketplace service photos"
  on storage.objects for select to public
  using (bucket_id = 'marketplace-service-photos');
drop policy if exists "Admin uploads marketplace service photos" on storage.objects;
create policy "Admin uploads marketplace service photos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'marketplace-service-photos' and auth.uid() = '79482db3-a3f7-4773-bb8d-5a79c9d10237'::uuid);
drop policy if exists "Admin updates marketplace service photos" on storage.objects;
create policy "Admin updates marketplace service photos"
  on storage.objects for update to authenticated
  using (bucket_id = 'marketplace-service-photos' and auth.uid() = '79482db3-a3f7-4773-bb8d-5a79c9d10237'::uuid)
  with check (bucket_id = 'marketplace-service-photos' and auth.uid() = '79482db3-a3f7-4773-bb8d-5a79c9d10237'::uuid);
drop policy if exists "Admin deletes marketplace service photos" on storage.objects;
create policy "Admin deletes marketplace service photos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'marketplace-service-photos' and auth.uid() = '79482db3-a3f7-4773-bb8d-5a79c9d10237'::uuid);
