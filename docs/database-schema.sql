-- JobTrack: job_applications table
create table public.job_applications (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  company      text not null check (char_length(trim(company)) between 1 and 100),
  job_title    text not null check (char_length(trim(job_title)) between 1 and 100),
  job_link     text check (job_link is null or job_link ~* '^https?://[^[:space:]]+$'),
  applied_date date not null default current_date check (applied_date <= current_date + 1),
  status       text not null default 'Applied'
               check (status in ('Applied', 'Interview', 'Offer', 'Rejected')),
  notes        text check (notes is null or char_length(notes) <= 500),
  created_at   timestamptz not null default now()
);

-- No duplicate company + job title for the same user (case and spaces ignored)
create unique index job_applications_unique_per_user
  on public.job_applications (user_id, lower(trim(company)), lower(trim(job_title)));

create index job_applications_user_id_idx on public.job_applications (user_id);

-- Row Level Security: each user sees and changes only their own rows
alter table public.job_applications enable row level security;

create policy "Users can view own applications"
  on public.job_applications for select to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own applications"
  on public.job_applications for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own applications"
  on public.job_applications for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own applications"
  on public.job_applications for delete to authenticated
  using (auth.uid() = user_id);

-- Added later for the job post extraction feature
alter table public.job_applications
  add column if not exists required_skills text[] not null default '{}';
