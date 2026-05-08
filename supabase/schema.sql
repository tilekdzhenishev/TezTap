-- TezTap Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Jobs table
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

-- Saved jobs table
create table if not exists saved_jobs (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs(id) on delete cascade,
  device_id text not null,
  created_at timestamp with time zone default now()
);

-- Index for faster queries
create index if not exists idx_jobs_status_active on jobs(status, is_active);
create index if not exists idx_jobs_created on jobs(created_at desc);
create index if not exists idx_saved_jobs_device on saved_jobs(device_id);
create index if not exists idx_saved_jobs_job on saved_jobs(job_id);

-- Row Level Security (RLS) policies
alter table jobs enable row level security;
alter table saved_jobs enable row level security;

-- Anyone can read approved active jobs
create policy "Anyone can read approved jobs"
  on jobs for select
  using (status = 'approved' and is_active = true);

-- Anyone can insert jobs (for employer submission)
create policy "Anyone can create jobs"
  on jobs for insert
  with check (true);

-- Anyone can read their saved jobs by device_id
create policy "Anyone can read saved jobs by device"
  on saved_jobs for select
  using (true);

-- Anyone can insert saved jobs
create policy "Anyone can create saved jobs"
  on saved_jobs for insert
  with check (true);

-- Anyone can delete their saved jobs
create policy "Anyone can delete saved jobs"
  on saved_jobs for delete
  using (true);

-- Admin can update jobs (for approval/rejection)
-- For MVP, we allow anyone to update since admin code is app-level only
-- In production, use Supabase auth with admin role
create policy "Anyone can update jobs"
  on jobs for update
  using (true);

-- ============================================================
-- User Profiles (links Supabase Auth users to app roles)
-- ============================================================

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'user',
  created_at timestamp with time zone default now(),
  constraint profiles_role_check check (role in ('user', 'employer', 'admin'))
);

alter table profiles enable row level security;

create policy "Users can read own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- ============================================================
-- Verified Employers System
-- ============================================================

-- Employers table: stores business registration applications
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

-- Link jobs to verified employer accounts
alter table jobs add column if not exists employer_id uuid references employers(id) null;
alter table employers add column if not exists user_id uuid references auth.users(id) null;

-- Indexes
create index if not exists idx_employers_status on employers(verification_status);
create index if not exists idx_employers_created on employers(created_at desc);
create index if not exists idx_jobs_employer on jobs(employer_id);

-- RLS for employers
alter table employers enable row level security;

create policy "Anyone can read employers"
  on employers for select
  using (true);

create policy "Anyone can register as employer"
  on employers for insert
  with check (verification_status = 'pending');

create policy "Anyone can update employer status"
  on employers for update
  using (true);

-- Only approved employers can post jobs
drop policy if exists "Anyone can create jobs" on jobs;
create policy "Approved employers can create jobs"
  on jobs for insert
  with check (
    employer_id is null
    or exists (
      select 1 from employers
      where employers.id = jobs.employer_id
        and employers.verification_status = 'approved'
    )
  );

-- ============================================================
-- v1.5 Trust & Reliability System
-- ============================================================

-- Worker Profiles
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

-- Job Applications
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

-- RLS for worker_profiles
alter table worker_profiles enable row level security;

create policy "Workers can manage own profile"
  on worker_profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Admins can manage all worker profiles"
  on worker_profiles for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

-- RLS for job_applications
alter table job_applications enable row level security;

create policy "Workers can read own applications"
  on job_applications for select
  using (auth.uid() = worker_id);

create policy "Workers can apply to jobs"
  on job_applications for insert
  with check (auth.uid() = worker_id);

create policy "Workers can cancel own applications"
  on job_applications for update
  using (auth.uid() = worker_id);

create policy "Employers can read applications for their jobs"
  on job_applications for select
  using (
    exists (
      select 1 from jobs j
      join employers e on j.employer_id = e.id
      where j.id = job_applications.job_id
        and e.user_id = auth.uid()
    )
  );

create policy "Employers can update application status"
  on job_applications for update
  using (
    exists (
      select 1 from jobs j
      join employers e on j.employer_id = e.id
      where j.id = job_applications.job_id
        and e.user_id = auth.uid()
    )
  );

create policy "Admins can manage all applications"
  on job_applications for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

-- Note: Create 'worker-docs' storage bucket in Supabase dashboard
-- with public access. Suggested policy: allow authenticated users
-- to upload to worker-docs/{user_id}/ prefix.
