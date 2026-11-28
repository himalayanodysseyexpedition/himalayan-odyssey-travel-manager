alter table public.calling_leads add column assigned_staff_id uuid references public.calling_staff(user_id) on delete set null, add column assigned_at timestamptz;
create index calling_leads_assigned_staff_idx on public.calling_leads(assigned_staff_id);
-- Preserve established ownership for previously worked leads.
update public.calling_leads l set assigned_staff_id=x.staff_id, assigned_at=x.created_at
from (select distinct on (g.lead_id) g.lead_id,g.staff_id,g.created_at from public.calling_logs g join public.calling_staff s on s.user_id=g.staff_id order by g.lead_id,g.created_at desc,g.id desc) x where x.lead_id=l.id;
alter policy calling_leads_read on public.calling_leads using (auth.uid()='79482db3-a3f7-4773-bb8d-5a79c9d10237'::uuid or (assigned_staff_id=auth.uid() and exists(select 1 from public.calling_staff s where s.user_id=auth.uid())));
alter policy calling_logs_read on public.calling_logs using (exists(select 1 from public.calling_leads l where l.id=calling_logs.lead_id));
alter policy calling_logs_add on public.calling_logs with check (staff_id=auth.uid() and exists(select 1 from public.calling_leads l where l.id=calling_logs.lead_id));
create function private.calling_queue_v2() returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if auth.uid() is null or not (auth.uid()='79482db3-a3f7-4773-bb8d-5a79c9d10237'::uuid or exists(select 1 from public.calling_staff s where s.user_id=auth.uid())) then raise exception 'Not authorized' using errcode='42501'; end if;
 return coalesce((select jsonb_agg(jsonb_build_object('id',l.id,'destination',l.destination,'travellers',l.travellers,'travel_date',l.travel_date,'created_at',l.created_at,'assigned_staff_id',l.assigned_staff_id,'assigned_name',s.display_name) order by l.created_at desc) from public.calling_leads l left join public.calling_staff s on s.user_id=l.assigned_staff_id),'[]'::jsonb);
end $$;
create function private.calling_team_v2() returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if auth.uid() is null or not (auth.uid()='79482db3-a3f7-4773-bb8d-5a79c9d10237'::uuid or exists(select 1 from public.calling_staff s where s.user_id=auth.uid())) then raise exception 'Not authorized' using errcode='42501'; end if;
 return coalesce((select jsonb_agg(jsonb_build_object('user_id',s.user_id,'display_name',s.display_name) order by s.display_name) from public.calling_staff s),'[]'::jsonb);
end $$;
create function private.calling_assign_v2(p_lead uuid,p_target uuid,p_action text) returns boolean language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); current_owner uuid; is_admin boolean:=actor='79482db3-a3f7-4773-bb8d-5a79c9d10237'::uuid;
begin
 if actor is null or not (is_admin or exists(select 1 from public.calling_staff s where s.user_id=actor)) then raise exception 'Not authorized' using errcode='42501'; end if;
 select assigned_staff_id into current_owner from public.calling_leads where id=p_lead for update;
 if not found then raise exception 'Lead not found'; end if;
 if p_action='claim' then
   if is_admin or p_target is distinct from actor or current_owner is not null then raise exception 'Lead already assigned or unavailable' using errcode='42501'; end if;
 elsif p_action='transfer' then
   if (not is_admin and current_owner is distinct from actor) or p_target is null or p_target is not distinct from current_owner then raise exception 'Only the owner or admin can transfer this lead' using errcode='42501'; end if;
 elsif p_action='release' then
   if (not is_admin and current_owner is distinct from actor) or p_target is not null then raise exception 'Only the owner or admin can release this lead' using errcode='42501'; end if;
 else raise exception 'Invalid action'; end if;
 if p_target is not null and not exists(select 1 from public.calling_staff s where s.user_id=p_target) then raise exception 'Target is not authorized staff'; end if;
 update public.calling_leads set assigned_staff_id=p_target,assigned_at=case when p_target is null then null else now() end where id=p_lead;
 return true;
end $$;
create function private.calling_log_lock_v2() returns trigger language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); current_owner uuid;
begin
 select assigned_staff_id into current_owner from public.calling_leads where id=new.lead_id for update;
 if not found or actor is null or new.staff_id is distinct from actor or (actor<>'79482db3-a3f7-4773-bb8d-5a79c9d10237'::uuid and (current_owner is distinct from actor or not exists(select 1 from public.calling_staff s where s.user_id=actor))) then raise exception 'Lead is locked or your access has changed' using errcode='42501'; end if;
 return new;
end $$;
create trigger calling_log_lock_v2 before insert on public.calling_logs for each row execute function private.calling_log_lock_v2();
create function public.calling_queue_v2() returns jsonb language sql stable set search_path='' as $$select private.calling_queue_v2()$$;
create function public.calling_team_v2() returns jsonb language sql stable set search_path='' as $$select private.calling_team_v2()$$;
create function public.calling_assign_v2(p_lead uuid,p_target uuid,p_action text) returns boolean language sql set search_path='' as $$select private.calling_assign_v2(p_lead,p_target,p_action)$$;
revoke all on function private.calling_queue_v2(),private.calling_team_v2(),private.calling_assign_v2(uuid,uuid,text),private.calling_log_lock_v2(),public.calling_queue_v2(),public.calling_team_v2(),public.calling_assign_v2(uuid,uuid,text) from public,anon,authenticated;
grant execute on function private.calling_queue_v2(),private.calling_team_v2(),private.calling_assign_v2(uuid,uuid,text),public.calling_queue_v2(),public.calling_team_v2(),public.calling_assign_v2(uuid,uuid,text) to authenticated;
