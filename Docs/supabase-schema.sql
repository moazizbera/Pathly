create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text not null,
  category text not null,
  main_goal text,
  focus_preference text default 'Three meaningful priorities',
  availability text default '90 minutes',
  active_role text default 'all',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists active_role text default 'all';

create table if not exists public.role_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null,
  main_goal text,
  focus_preference text default 'Three meaningful priorities',
  availability text default '90 minutes',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, role)
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  -- Keep the foreign key non-destructive for direct SQL deletes.
  -- Pathly's profile update flow deletes role-owned tasks first when a role is removed.
  role_profile_id uuid references public.role_profiles(id) on delete set null,
  client_request_id text,
  title text not null,
  description text,
  due_date date,
  estimated_minutes integer default 25,
  priority text not null default 'medium',
  status text not null default 'todo',
  task_lane text default 'general',
  subject text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Migration: add subject to existing tasks tables
alter table public.tasks add column if not exists subject text;
alter table public.tasks add column if not exists role_profile_id uuid references public.role_profiles(id) on delete set null;
alter table public.tasks add column if not exists task_lane text default 'general';
alter table public.tasks add column if not exists client_request_id text;

-- Important behavior note:
-- When a user unchecks a role in Pathly profile settings, the app explicitly deletes
-- tasks tied to that role_profile_id before deleting the role_profiles row.
-- Shared and general tasks are preserved.

create index if not exists tasks_user_id_idx on public.tasks(user_id);
create index if not exists tasks_due_date_idx on public.tasks(due_date);
create index if not exists tasks_role_profile_id_idx on public.tasks(role_profile_id);
create unique index if not exists tasks_user_client_request_id_idx on public.tasks(user_id, client_request_id) where client_request_id is not null;
create index if not exists role_profiles_user_id_idx on public.role_profiles(user_id);

alter table public.profiles enable row level security;
alter table public.role_profiles enable row level security;
alter table public.tasks enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "role_profiles_select_own" on public.role_profiles;
create policy "role_profiles_select_own"
on public.role_profiles
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "role_profiles_insert_own" on public.role_profiles;
create policy "role_profiles_insert_own"
on public.role_profiles
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "role_profiles_update_own" on public.role_profiles;
create policy "role_profiles_update_own"
on public.role_profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "role_profiles_delete_own" on public.role_profiles;
create policy "role_profiles_delete_own"
on public.role_profiles
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "tasks_select_own" on public.tasks;
create policy "tasks_select_own"
on public.tasks
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "tasks_insert_own" on public.tasks;
create policy "tasks_insert_own"
on public.tasks
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "tasks_update_own" on public.tasks;
create policy "tasks_update_own"
on public.tasks
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "tasks_delete_own" on public.tasks;
create policy "tasks_delete_own"
on public.tasks
for delete
to authenticated
using (auth.uid() = user_id);
