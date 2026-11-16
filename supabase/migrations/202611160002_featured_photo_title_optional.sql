-- Allow Featured Travel Photography records to be saved without a title.
alter table public.featured_travel_photos alter column title drop not null;
