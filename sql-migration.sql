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
