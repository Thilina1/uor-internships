-- 1. Create the 'internships' bucket for image uploads
insert into storage.buckets (id, name, public)
values ('internships', 'internships', true)
on conflict (id) do nothing;

-- 2. Create the 'resumes' bucket for CV uploads
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', true)
on conflict (id) do nothing;

-- 3. Set up Storage Object Policies (Allows public inserts/selects since custom auth is used)
create policy "Public Access Internships" on storage.objects for all using ( bucket_id = 'internships' );
create policy "Public Access Resumes" on storage.objects for all using ( bucket_id = 'resumes' );
