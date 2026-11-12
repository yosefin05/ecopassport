create or replace function public.record_eco_action(
  p_user_name text,
  p_image_url text,
  p_score integer,
  p_carbon_saved numeric,
  p_action_title text
)
returns jsonb
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
declare
  v_user public.users%rowtype;
  v_action public.action_logs%rowtype;
begin
  if p_user_name is null or btrim(p_user_name) = '' or length(p_user_name) > 24 then
    raise exception 'Invalid user name';
  end if;
  if p_image_url is null or btrim(p_image_url) = '' then
    raise exception 'Image URL is required';
  end if;
  if p_score is null or p_score < 1 or p_score > 100 then
    raise exception 'Score must be between 1 and 100';
  end if;
  if p_carbon_saved is null or p_carbon_saved < 0 or p_carbon_saved > 1000 then
    raise exception 'Carbon saved must be between 0 and 1000';
  end if;
  if p_action_title is null or btrim(p_action_title) = '' or length(p_action_title) > 100 then
    raise exception 'Invalid action title';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_user_name, 0));

  select u.*
    into v_user
    from public.users as u
   where u.name = p_user_name
   order by u.created_at asc nulls first
   limit 1
   for update;

  if found then
    update public.users as u
       set green_points = coalesce(u.green_points, 0) + p_score
     where u.id = v_user.id
     returning u.* into v_user;
  else
    insert into public.users (name, green_points)
    values (p_user_name, p_score)
    returning * into v_user;
  end if;

  insert into public.action_logs (
    user_name,
    image_url,
    score,
    carbon_saved,
    action_title
  )
  values (
    p_user_name,
    p_image_url,
    p_score,
    p_carbon_saved,
    p_action_title
  )
  returning * into v_action;

  return jsonb_build_object(
    'log', to_jsonb(v_action),
    'green_points', v_user.green_points
  );
end;
$$;

revoke all on function public.record_eco_action(text, text, integer, numeric, text)
  from public, anon, authenticated;
grant execute on function public.record_eco_action(text, text, integer, numeric, text)
  to service_role;
