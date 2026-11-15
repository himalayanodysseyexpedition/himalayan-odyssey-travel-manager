-- Independent homepage Featured Travel Photography gallery; additive to existing app data.
create table if not exists public.featured_travel_photos(id uuid primary key default gen_random_uuid(),title text not null,caption text,alt_text text,image_url text not null,storage_path text,sort_order integer not null default 1,is_active boolean not null default true,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create index if not exists featured_travel_photos_active_order_idx on public.featured_travel_photos(is_active,sort_order);
alter table public.featured_travel_photos enable row level security;
drop policy if exists "Public can view published featured photos" on public.featured_travel_photos;
create policy "Public can view published featured photos" on public.featured_travel_photos for select to anon using(is_active=true);
drop policy if exists "Authenticated users can manage featured photos" on public.featured_travel_photos;
create policy "Authenticated users can manage featured photos" on public.featured_travel_photos for all to authenticated using(true) with check(true);
drop policy if exists "Authenticated users can view all featured photos" on public.featured_travel_photos;
create policy "Authenticated users can view all featured photos" on public.featured_travel_photos for select to authenticated using(true);
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('featured-travel-photos','featured-travel-photos',true,5242880,array['image/jpeg','image/png','image/webp']) on conflict(id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists "Public can view featured travel photo files" on storage.objects;
create policy "Public can view featured travel photo files" on storage.objects for select to anon,authenticated using(bucket_id='featured-travel-photos');
drop policy if exists "Authenticated users can upload featured travel photos" on storage.objects;
create policy "Authenticated users can upload featured travel photos" on storage.objects for insert to authenticated with check(bucket_id='featured-travel-photos');
drop policy if exists "Authenticated users can update featured travel photos" on storage.objects;
create policy "Authenticated users can update featured travel photos" on storage.objects for update to authenticated using(bucket_id='featured-travel-photos') with check(bucket_id='featured-travel-photos');
drop policy if exists "Authenticated users can delete featured travel photos" on storage.objects;
create policy "Authenticated users can delete featured travel photos" on storage.objects for delete to authenticated using(bucket_id='featured-travel-photos');
insert into public.featured_travel_photos(title,caption,alt_text,image_url,sort_order,is_active)
select v.title,v.caption,v.alt_text,v.image_url,v.sort_order,true from (values
('Spiti Valley','THE MIDDLE LAND','High-altitude Himalayan landscape in Spiti Valley','/spiti.jpg',1),
('Kinnaur','LAND OF GODS','Mountain landscape in Kinnaur, Himachal Pradesh','/kinnaur.jpg',2),
('Narkanda','PEACE IN THE MOUNTAINS','Himalayan mountain scenery around Narkanda','/narkanda.jpg',3),
('Manali','THE MOUNTAIN ESCAPE','Mountain scenery around Manali, Himachal Pradesh','/manali.jpg',4)
) v(title,caption,alt_text,image_url,sort_order) where not exists(select 1 from public.featured_travel_photos);
-- Rollback: drop table public.featured_travel_photos; then remove storage objects and bucket 'featured-travel-photos'.
