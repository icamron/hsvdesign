-- Run in Supabase SQL Editor. Tables are server-only.
begin;
create table if not exists public.hsv_projects (
 id text primary key, category text not null check(category in ('websites','logos','drone','seo','clients')),
 title text not null check(length(title) between 1 and 150),
 type text not null default '', image text not null default '', url text not null default '', description text not null default '',
 video boolean not null default false, featured boolean not null default false, published boolean not null default false,
 sort_order integer not null default 0 check(sort_order between 0 and 9999), version integer not null default 1 check(version>0), updated_at bigint not null
);
create table if not exists public.hsv_admins (username text primary key check(username='camron'),password_hash text not null,salt text not null,updated_at bigint not null,auth_version integer not null default 1);
create table if not exists public.hsv_sessions (token_hash text primary key,username text not null references public.hsv_admins(username) on delete cascade,csrf text not null,expires_at bigint not null,auth_version integer not null);
create table if not exists public.hsv_login_attempts (key text primary key,attempts integer not null,window_start bigint not null);
alter table public.hsv_projects enable row level security;
alter table public.hsv_admins enable row level security;
alter table public.hsv_sessions enable row level security;
alter table public.hsv_login_attempts enable row level security;
revoke all on public.hsv_projects,public.hsv_admins,public.hsv_sessions,public.hsv_login_attempts from anon,authenticated;
grant all on public.hsv_projects,public.hsv_admins,public.hsv_sessions,public.hsv_login_attempts to service_role;
create index if not exists hsv_sessions_expiry on public.hsv_sessions(expires_at);
create or replace function public.hsv_login_attempt(p_key text) returns integer
language plpgsql security invoker set search_path='' as $$
declare current_ms bigint:=floor(extract(epoch from clock_timestamp())*1000); n integer;
begin
 delete from public.hsv_login_attempts where window_start < current_ms-86400000;
 insert into public.hsv_login_attempts as a (key,attempts,window_start) values(p_key,1,current_ms)
 on conflict(key) do update set attempts=case when a.window_start<current_ms-900000 then 1 else a.attempts+1 end,
 window_start=case when a.window_start<current_ms-900000 then current_ms else a.window_start end returning attempts into n;
 return n;
end; $$;
revoke all on function public.hsv_login_attempt(text) from public,anon,authenticated;
grant execute on function public.hsv_login_attempt(text) to service_role;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('hsv-media','hsv-media',true,8388608,array['image/jpeg','image/png','image/webp','image/gif']) on conflict(id) do nothing;
-- No public upload policy. Only the authenticated server signs uploads.
commit;
