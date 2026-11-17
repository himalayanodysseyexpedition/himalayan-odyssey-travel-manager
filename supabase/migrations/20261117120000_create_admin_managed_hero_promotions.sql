create table if not exists public.site_hero_promotions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  top_label text not null default 'NEXT GROUP DEPARTURE',
  season_label text not null default '',
  kicker text not null default 'HIMALAYAN ODYSSEY PRESENTS',
  title_line1 text not null,
  title_emphasis text not null default '',
  title_line2 text not null default '',
  date_label text not null default '',
  facts jsonb not null default '[]'::jsonb check (jsonb_typeof(facts) = 'array'),
  price_per_person numeric(12,2) not null default 0 check (price_per_person >= 0),
  booked_count integer not null default 0 check (booked_count >= 0),
  total_seats integer not null default 0 check (total_seats >= 0),
  itinerary_label text not null default 'VIEW ITINERARY',
  itinerary_url text not null default '/itineraries/',
  itinerary_items jsonb not null default '[]'::jsonb check (jsonb_typeof(itinerary_items) = 'array'),
  cta_label text not null default 'ENQUIRE ON WHATSAPP',
  cta_url text not null default 'https://wa.me/919816929669',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site_hero_promotions_booked_within_capacity check (total_seats = 0 or booked_count <= total_seats)
);
alter table public.site_hero_promotions enable row level security;
grant select on public.site_hero_promotions to anon, authenticated;
grant insert, update, delete on public.site_hero_promotions to authenticated;
create policy "Public reads active hero promotions" on public.site_hero_promotions
  for select to anon, authenticated using (is_active or (select auth.uid()) = '79482db3-a3f7-4773-bb8d-5a79c9d10237'::uuid);
create policy "Admin manages hero promotions" on public.site_hero_promotions
  for all to authenticated
  using ((select auth.uid()) = '79482db3-a3f7-4773-bb8d-5a79c9d10237'::uuid)
  with check ((select auth.uid()) = '79482db3-a3f7-4773-bb8d-5a79c9d10237'::uuid);

insert into public.site_hero_promotions
(slug,top_label,season_label,kicker,title_line1,title_emphasis,title_line2,date_label,facts,price_per_person,booked_count,total_seats,itinerary_label,itinerary_url,itinerary_items,cta_label,cta_url,sort_order,is_active)
values
('winter-spiti-expedition','NEXT GROUP DEPARTURE','WINTER 2026–27','HIMALAYAN ODYSSEY PRESENTS','Winter','Spiti','Expedition','26 DEC 2026 — 02 JAN 2027',
 '["7 Nights / 8 Days","Ambala & Chandigarh Pickup"]'::jsonb,17000,32,40,'VIEW ITINERARY','/itineraries/','[]'::jsonb,
 'EXPLORE THIS DEPARTURE','https://wa.me/919816929669?text=Hello%20Himalayan%20Odyssey%20Expedition%2C%20I%20am%20interested%20in%20the%20Winter%20Spiti%20Expedition%20(26%20Dec%202026%20%E2%80%93%2002%20Jan%202027)%20priced%20at%20%E2%82%B917%2C000%20per%20person.%20Please%20share%20the%20full%20itinerary%20and%20booking%20details.',
 1,true),
('kinnaur-spiti-group-tour','NEXT GROUP DEPARTURE','DECEMBER 2026','HIMALAYAN ODYSSEY PRESENTS','Kinnaur','& Spiti','Group Tour','19 DEC 2026',
 '["6 Nights / 7 Days","Chandigarh Pickup & Drop"]'::jsonb,15000,4,12,'VIEW 7-DAY ITINERARY','/itineraries/',
 '["DAY 1 · Chandigarh → Shimla → Narkanda · DJ party & bonfire","DAY 2 · Narkanda → Sangla → Chitkul · Lepcha La & Chitkul border sightseeing","DAY 3 · Sangla → Khab Sangam → Nako → Tabo","DAY 4 · Tabo → Kaza","DAY 5 · Kaza local sightseeing · Overnight in Kaza","DAY 6 · Kaza → Kalpa","DAY 7 · Kalpa → Chandigarh drop"]'::jsonb,
 'ENQUIRE ON WHATSAPP','https://wa.me/919816929669?text=Hello%20Himalayan%20Odyssey%20Expedition%2C%20I%20am%20interested%20in%20the%2019%20December%202026%20Kinnaur%20and%20Spiti%20group%20tour%20(6%20Nights%2F7%20Days)%20priced%20at%20%E2%82%B915%2C000%20per%20person%2C%20with%20Chandigarh%20pickup%20and%20drop.%20Please%20share%20the%20full%20itinerary%20and%20booking%20details.',
 2,true)
on conflict (slug) do nothing;