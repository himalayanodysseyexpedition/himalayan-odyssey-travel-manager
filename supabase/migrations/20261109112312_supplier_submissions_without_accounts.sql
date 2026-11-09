create table if not exists public.supplier_submissions (
  id uuid primary key default gen_random_uuid(),
  contact_person text not null check (char_length(btrim(contact_person)) between 2 and 100),
  business_name text not null check (char_length(btrim(business_name)) between 2 and 150),
  phone text not null check (char_length(regexp_replace(phone, '[^0-9+]', '', 'g')) between 10 and 16),
  whatsapp text not null check (char_length(regexp_replace(whatsapp, '[^0-9+]', '', 'g')) between 10 and 16),
  email text,
  supplier_type text not null check (supplier_type in ('driver','property','both')),
  city text,
  state text not null default 'Himachal Pradesh',
  business_address text,
  gst_number text,
  listing_type text not null check (listing_type in ('cab','property')),
  title text not null check (char_length(btrim(title)) between 3 and 150),
  destination text not null check (char_length(btrim(destination)) between 2 and 100),
  location text not null check (char_length(btrim(location)) between 2 and 150),
  description text,
  price numeric(12,2) check (price is null or price >= 0),
  price_unit text,
  vehicle_model text,
  seating_capacity integer check (seating_capacity is null or seating_capacity between 1 and 60),
  vehicle_features text[] not null default '{}',
  property_type text,
  room_types text[] not null default '{}',
  amenities text[] not null default '{}',
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.supplier_listings alter column supplier_id drop not null;
alter table public.supplier_submissions enable row level security;

revoke all on public.supplier_submissions from anon, authenticated;
grant insert on public.supplier_submissions to anon, authenticated;
grant select, update, delete on public.supplier_submissions to authenticated;

drop policy if exists "public can submit supplier registrations" on public.supplier_submissions;
create policy "public can submit supplier registrations"
on public.supplier_submissions
for insert to anon, authenticated
with check (
  status = 'pending'
  and admin_notes is null
  and char_length(btrim(contact_person)) between 2 and 100
  and char_length(btrim(business_name)) between 2 and 150
  and char_length(regexp_replace(phone, '[^0-9+]', '', 'g')) between 10 and 16
  and char_length(regexp_replace(whatsapp, '[^0-9+]', '', 'g')) between 10 and 16
);

drop policy if exists "admin manages supplier registrations" on public.supplier_submissions;
create policy "admin manages supplier registrations"
on public.supplier_submissions
for all to authenticated
using ((select auth.uid()) = '79482db3-a3f7-4773-bb8d-5a79c9d10237'::uuid)
with check ((select auth.uid()) = '79482db3-a3f7-4773-bb8d-5a79c9d10237'::uuid);
