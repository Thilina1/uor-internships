-- Enable pgcrypto for UUIDs if not already enabled
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 1. Profiles Table (Custom Auth)
create table if not exists public.profiles (
  id uuid default uuid_generate_v4() primary key,
  email text unique not null,
  password_hash text not null,
  role text check (role in ('student', 'alumni', 'lecturer', 'external', 'admin')) not null,
  name text,
  avatar_url text,
  reset_token text,
  reset_token_expires_at timestamp with time zone,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Ensure the ID column has the default value if the table already exists
alter table public.profiles alter column id set default uuid_generate_v4();

-- Ensure reset_token columns exist for existing tables
alter table public.profiles add column if not exists reset_token text;
alter table public.profiles add column if not exists reset_token_expires_at timestamp with time zone;

-- Function to verify password
create or replace function public.verify_user_password(user_id uuid, plain_password text)
returns boolean as $$
declare
  stored_hash text;
begin
  select password_hash into stored_hash from public.profiles where id = user_id;
  if stored_hash is null then
    return false;
  end if;
  return stored_hash = crypt(plain_password, stored_hash);
end;
$$ language plpgsql security definer;

-- Trigger to hash password before insert/update
create or replace function public.hash_profile_password()
returns trigger as $$
begin
  if new.password_hash is not null and (tg_op = 'INSERT' or new.password_hash <> old.password_hash) then
    new.password_hash := crypt(new.password_hash, gen_salt('bf'));
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists tr_hash_profile_password on public.profiles;
create trigger tr_hash_profile_password
  before insert or update on public.profiles
  for each row execute function public.hash_profile_password();

-- Disable RLS for internal auth demo/simplicity, or use Service Role
-- In a real custom auth, you'd verify JWTs or use a different mechanism.
alter table public.profiles disable row level security;
alter table public.internships disable row level security;
alter table public.applications disable row level security;

-- 2. Internships Table
create table if not exists public.internships (
  id uuid default uuid_generate_v4() primary key,
  company_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text not null,
  requirements text,
  image_url text,
  external_url text,
  expires_at timestamp with time zone,
  status text default 'open',
  job_type text,
  experience_level text,
  education_skills text,
  summary text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn off Row Level Security for internships as we use custom auth
alter table public.internships disable row level security;

drop policy if exists "Internships are viewable by everyone." on internships;
create policy "Internships are viewable by everyone." on internships
  for select using (true);

drop policy if exists "Members can insert own internships." on internships;
create policy "Members can insert own internships." on internships
  for insert with check (
    auth.uid() = company_id and 
    exists (select 1 from public.profiles where id = auth.uid() and role in ('alumni', 'lecturer', 'external'))
  );

drop policy if exists "Members can update own internships." on internships;
create policy "Members can update own internships." on internships
  for update using (
    auth.uid() = company_id
  );

drop policy if exists "Members can delete own internships." on internships;
create policy "Members can delete own internships." on internships
  for delete using (
    auth.uid() = company_id
  );

-- 3. Applications Table
create table if not exists public.applications (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  internship_id uuid references public.internships(id) on delete cascade not null,
  status text default 'pending', -- 'pending', 'accepted', 'rejected'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (student_id, internship_id)
);

-- Turn off Row Level Security for applications as we use custom auth
alter table public.applications disable row level security;

-- Students can view their own applications, companies can view applications for their internships
drop policy if exists "Users can view own applications or received applications." on applications;
create policy "Users can view own applications or received applications." on applications
  for select using (
    auth.uid() = student_id or
    exists (
      select 1 from public.internships i
      where i.id = applications.internship_id and i.company_id = auth.uid()
    )
  );

-- Students can apply for internships
drop policy if exists "Students can insert their own applications." on applications;
create policy "Students can insert their own applications." on applications
  for insert with check (
    auth.uid() = student_id and
    exists (select 1 from public.profiles where id = auth.uid() and role = 'student')
  );

-- Members can update the status of applications to their internships
drop policy if exists "Members can update application status." on applications;
create policy "Members can update application status." on applications
  for update using (
    exists (
      select 1 from public.internships i
      where i.id = applications.internship_id and i.company_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.internships i
      where i.id = applications.internship_id and i.company_id = auth.uid()
    )
  );
-- Create saved_jobs table
create table if not exists public.saved_jobs (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  internship_id uuid references public.internships(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (student_id, internship_id)
);

-- Turn off RLS for simplicity / custom auth
alter table public.saved_jobs disable row level security;
