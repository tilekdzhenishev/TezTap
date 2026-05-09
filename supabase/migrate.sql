-- TezTap full idempotent migration
-- Safe to run multiple times — drops policies before recreating them

create extension if not exists "uuid-ossp";

-- ── jobs ─────────────────────────────────────────────────────
create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  payment text not null,
  duration text not null,
  schedule text not null,
  location text not null,
  experience text,
  company_name text,
  contact_url text not null,
  status text not null default 'pending',
  is_active boolean not null default false,
  created_at timestamp with time zone default now(),
  closed_at timestamp with time zone null,
  constraint jobs_status_check check (status in ('pending', 'approved', 'rejected'))
);

create index if not exists idx_jobs_status_active on jobs(status, is_active);
create index if not exists idx_jobs_created on jobs(created_at desc);

alter table jobs enable row level security;

drop policy if exists "Anyone can read approved jobs" on jobs;
drop policy if exists "Anyone can create jobs" on jobs;
drop policy if exists "Approved employers can create jobs" on jobs;
drop policy if exists "Employers can read own jobs" on jobs;
drop policy if exists "Admin console can read all jobs" on jobs;
drop policy if exists "Anyone can update jobs" on jobs;

-- Public feed: only fully published jobs
create policy "Anyone can read approved jobs"
  on jobs for select using (status = 'approved' and is_active = true);

-- Admin console has no Supabase auth session (auth.uid() = null), so it needs its own
-- permissive policy — same pattern as worker_profiles and employers admin policies.
create policy "Admin console can read all jobs"
  on jobs for select using (true);

-- Employers can always see jobs that belong to their own employer record
create policy "Employers can read own jobs"
  on jobs for select
  using (
    exists (
      select 1 from employers
      where employers.id = jobs.employer_id
        and employers.user_id = auth.uid()
    )
  );

-- Only an approved employer can submit jobs — and only for their own employer_id
create policy "Approved employers can create jobs"
  on jobs for insert
  with check (
    exists (
      select 1 from employers
      where employers.id = jobs.employer_id
        and employers.verification_status = 'approved'
        and employers.user_id = auth.uid()
    )
  );

create policy "Anyone can update jobs"
  on jobs for update using (true);

-- ── saved_jobs ────────────────────────────────────────────────
create table if not exists saved_jobs (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs(id) on delete cascade,
  device_id text not null,
  created_at timestamp with time zone default now()
);

create index if not exists idx_saved_jobs_device on saved_jobs(device_id);
create index if not exists idx_saved_jobs_job on saved_jobs(job_id);

alter table saved_jobs enable row level security;

drop policy if exists "Anyone can read saved jobs by device" on saved_jobs;
drop policy if exists "Anyone can create saved jobs" on saved_jobs;
drop policy if exists "Anyone can delete saved jobs" on saved_jobs;

create policy "Anyone can read saved jobs by device" on saved_jobs for select using (true);
create policy "Anyone can create saved jobs" on saved_jobs for insert with check (true);
create policy "Anyone can delete saved jobs" on saved_jobs for delete using (true);

-- ── profiles ──────────────────────────────────────────────────
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'user',
  created_at timestamp with time zone default now(),
  constraint profiles_role_check check (role in ('user', 'employer', 'admin'))
);

alter table profiles enable row level security;

drop policy if exists "Users can read own profile" on profiles;
drop policy if exists "Users can insert own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;

create policy "Users can read own profile" on profiles for select using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- ── employers ─────────────────────────────────────────────────
create table if not exists employers (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  business_type text not null,
  contact_phone text not null,
  description text,
  verification_status text not null default 'pending',
  created_at timestamp with time zone default now(),
  reviewed_at timestamp with time zone null,
  review_notes text null,
  constraint employers_status_check check (
    verification_status in ('pending', 'approved', 'rejected', 'suspended')
  )
);

alter table jobs add column if not exists employer_id uuid references employers(id) null;
alter table employers add column if not exists user_id uuid references auth.users(id) null;

create index if not exists idx_employers_status on employers(verification_status);
create index if not exists idx_employers_created on employers(created_at desc);
create index if not exists idx_jobs_employer on jobs(employer_id);

-- Remove duplicate employer rows per user, keeping the most recently reviewed (approved)
-- or the most recently created if none have been reviewed yet.
delete from employers
where id not in (
  select distinct on (user_id) id
  from employers
  where user_id is not null
  order by user_id,
           (verification_status = 'approved') desc,
           reviewed_at desc nulls last,
           created_at desc
);

-- Prevent duplicate employer rows per user (partial: allows multiple rows where user_id is null)
create unique index if not exists idx_employers_user_id_unique on employers(user_id)
  where user_id is not null;

alter table employers enable row level security;

drop policy if exists "Anyone can read employers" on employers;
drop policy if exists "Anyone can register as employer" on employers;
drop policy if exists "Anyone can update employer status" on employers;

create policy "Anyone can read employers" on employers for select using (true);
create policy "Anyone can register as employer" on employers for insert with check (verification_status = 'pending');
create policy "Anyone can update employer status" on employers for update using (true);

-- ── worker_profiles ───────────────────────────────────────────
create table if not exists worker_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  birth_year integer,
  phone text,
  passport_front_url text,
  selfie_url text,
  verification_status text not null default 'pending',
  rating numeric(3,2) not null default 0,
  completed_shifts integer not null default 0,
  no_show_count integer not null default 0,
  is_banned boolean not null default false,
  suspended_until timestamp with time zone null,
  created_at timestamp with time zone default now(),
  constraint worker_profiles_status_check check (
    verification_status in ('pending', 'verified', 'rejected')
  )
);

create unique index if not exists idx_worker_profiles_user on worker_profiles(user_id);
create index if not exists idx_worker_profiles_status on worker_profiles(verification_status);

alter table worker_profiles enable row level security;

drop policy if exists "Workers can manage own profile" on worker_profiles;
drop policy if exists "Workers can read own profile" on worker_profiles;
drop policy if exists "Workers can create pending profile" on worker_profiles;
drop policy if exists "Workers can update own pending profile" on worker_profiles;
drop policy if exists "Admins can manage all worker profiles" on worker_profiles;
drop policy if exists "Admin console can read worker profiles" on worker_profiles;
drop policy if exists "Admin console can update worker verification" on worker_profiles;

create policy "Workers can read own profile"
  on worker_profiles for select
  using (auth.uid() = user_id);

create policy "Workers can create pending profile"
  on worker_profiles for insert
  with check (auth.uid() = user_id and verification_status = 'pending');

create policy "Workers can update own pending profile"
  on worker_profiles for update
  using (auth.uid() = user_id and verification_status in ('pending', 'rejected'))
  with check (auth.uid() = user_id and verification_status = 'pending');

-- The current mobile admin console is unlocked by EXPO_PUBLIC_ADMIN_CODE.
-- Keep worker verification aligned with jobs/employers until admin actions
-- are moved to a service-role Edge Function.
create policy "Admin console can read worker profiles"
  on worker_profiles for select
  using (true);

create policy "Admin console can update worker verification"
  on worker_profiles for update
  using (true)
  with check (verification_status in ('pending', 'verified', 'rejected'));

create policy "Admins can manage all worker profiles"
  on worker_profiles for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- ── job_applications ──────────────────────────────────────────
create table if not exists job_applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(id) on delete cascade,
  worker_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'applied',
  applied_at timestamp with time zone default now(),
  responded_at timestamp with time zone null,
  rating integer null,
  no_show_reported boolean not null default false,
  unique(job_id, worker_id),
  constraint job_applications_status_check check (
    status in ('applied', 'accepted', 'completed', 'no_show', 'cancelled', 'rejected')
  ),
  constraint job_applications_rating_check check (
    rating is null or (rating >= 1 and rating <= 5)
  )
);

create index if not exists idx_job_applications_job on job_applications(job_id);
create index if not exists idx_job_applications_worker on job_applications(worker_id);
create index if not exists idx_job_applications_status on job_applications(status);

alter table job_applications enable row level security;

drop policy if exists "Workers can read own applications" on job_applications;
drop policy if exists "Workers can apply to jobs" on job_applications;
drop policy if exists "Workers can cancel own applications" on job_applications;
drop policy if exists "Employers can read applications for their jobs" on job_applications;
drop policy if exists "Employers can update application status" on job_applications;
drop policy if exists "Admins can manage all applications" on job_applications;

create policy "Workers can read own applications"
  on job_applications for select using (auth.uid() = worker_id);

create policy "Workers can apply to jobs"
  on job_applications for insert with check (auth.uid() = worker_id);

create policy "Workers can cancel own applications"
  on job_applications for update using (auth.uid() = worker_id);

create policy "Employers can read applications for their jobs"
  on job_applications for select
  using (
    exists (
      select 1 from jobs j join employers e on j.employer_id = e.id
      where j.id = job_applications.job_id and e.user_id = auth.uid()
    )
  );

create policy "Employers can update application status"
  on job_applications for update
  using (
    exists (
      select 1 from jobs j join employers e on j.employer_id = e.id
      where j.id = job_applications.job_id and e.user_id = auth.uid()
    )
  );

create policy "Admins can manage all applications"
  on job_applications for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );
