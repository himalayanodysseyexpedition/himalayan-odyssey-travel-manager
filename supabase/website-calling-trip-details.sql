alter table public.calling_leads add column trip_details text;
create or replace function private.sync_calling_trip_details() returns trigger language plpgsql set search_path='' as $$
begin
 update public.calling_leads set trip_details=case when new.source='Website' then new.notes else null end where id=new.id;
 return new;
end;
$$;
create trigger calling_trip_details_sync after insert or update of notes,source on public.leads for each row execute function private.sync_calling_trip_details();
update public.calling_leads c set trip_details=l.notes from public.leads l where c.id=l.id and l.source='Website';
