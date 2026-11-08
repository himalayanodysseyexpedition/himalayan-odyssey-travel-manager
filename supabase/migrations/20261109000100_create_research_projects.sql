create table if not exists public.research_projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  title text not null,
  research_type text not null check (research_type in ('seo', 'destination', 'competitor', 'package')),
  topic text not null,
  market text,
  status text not null default 'planning' check (status in ('planning', 'researching', 'ready', 'archived')),
  outline jsonb not null default '[]'::jsonb,
  sources jsonb not null default '[]'::jsonb,
  findings text not null default '',
  report text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists research_projects_owner_updated_idx
  on public.research_projects (owner_id, updated_at desc);

alter table public.research_projects enable row level security;
grant select, insert, update, delete on public.research_projects to authenticated;

create policy "Research projects are visible to their owner"
  on public.research_projects for select to authenticated
  using ((select auth.uid()) = owner_id);

create policy "Owners can create research projects"
  on public.research_projects for insert to authenticated
  with check ((select auth.uid()) = owner_id);

create policy "Owners can update their research projects"
  on public.research_projects for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create policy "Owners can delete their research projects"
  on public.research_projects for delete to authenticated
  using ((select auth.uid()) = owner_id);
