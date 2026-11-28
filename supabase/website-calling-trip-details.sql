alter table public.calling_leads add column trip_details text;
create or replace function private.sync_calling_trip_details() returns trigger language plpgsql set search_path='' as $$
begin
 update public.calling_leads set trip_details=case when new.source='Website' then new.notes else null end where id=new.id;
 return new;
end;
$$;
create trigger calling_trip_details_sync after insert or update of notes,source on public.leads for each row execute function private.sync_calling_trip_details();
update public.calling_leads c set trip_details=l.notes from public.leads l where c.id=l.id and l.source='Website';

create or replace function private.calling_queue_v2() returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if auth.uid() is null or not (auth.uid()='79482db3-a3f7-4773-bb8d-5a79c9d10237'::uuid or exists(select 1 from public.calling_staff s where s.user_id=auth.uid())) then raise exception 'Not authorized' using errcode='42501'; end if;
 return coalesce((select jsonb_agg(jsonb_build_object('id',l.id,'destination',l.destination,'travellers',l.travellers,'travel_date',l.travel_date,'trip_days',substring(l.trip_details from '(?m)^Tour days: ([1-9]|[1-5][0-9]|60)'created_at',l.created_at,'assigned_staff_id',l.assigned_staff_id,'assigned_name',s.display_name) order by l.created_at desc) from public.calling_leads l left join public.calling_staff s on s.user_id=l.assigned_staff_id),'[]'::jsonb);
end $$;)::integer,'is_website',l.source='Website','created_at',l.created_at,'assigned_staff_id',l.assigned_staff_id,'assigned_name',s.display_name) order by l.created_at desc) from public.calling_leads l left join public.calling_staff s on s.user_id=l.assigned_staff_id),'[]'::jsonb);
end $$;
