-- Create fields table
create table public.fields (
  id uuid not null default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  type text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint fields_pkey primary key (id)
);

alter table public.fields enable row level security;

create policy "Public fields are viewable by everyone."
on public.fields for select
using (true);

create policy "Authenticated users can create fields."
on public.fields for insert
with check (auth.role() = 'authenticated');

create policy "Authenticated users can update fields."
on public.fields for update
using (auth.role() = 'authenticated');

create policy "Authenticated users can delete fields."
on public.fields for delete
using (auth.role() = 'authenticated');

-- Add field_id to form_fields table
alter table public.form_fields
add column field_id uuid references public.fields(id);

-- Create index for better performance
create index idx_fields_slug on public.fields(slug);
create index idx_fields_type on public.fields(type);
create index idx_fields_active on public.fields(is_active);




