-- ==========================================================
-- House Stock — Supabase schema
-- วิธีใช้: เปิด Supabase Dashboard -> SQL Editor -> New query
-- วางไฟล์นี้ทั้งหมดแล้วกด Run (รันครั้งเดียวตอนตั้ง project ใหม่)
-- ==========================================================

create extension if not exists "pgcrypto";

-- ---------- houses ----------
create table if not exists public.houses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- tags (ประเภทของสิ่งของ) ----------
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

-- ---------- locations (สถานที่ที่ซื้อ) ----------
create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

-- ---------- items ----------
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  house_id uuid not null references public.houses(id) on delete cascade,
  name text not null,
  tag_id uuid references public.tags(id) on delete set null,
  quantity numeric not null default 1,
  expiry_date date,
  price numeric,
  location_id uuid references public.locations(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists items_house_id_idx on public.items (house_id);
create index if not exists items_tag_id_idx on public.items (tag_id);
create index if not exists items_expiry_date_idx on public.items (expiry_date);

-- ---------- auto-update updated_at ----------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists items_set_updated_at on public.items;
create trigger items_set_updated_at
  before update on public.items
  for each row execute function public.set_updated_at();

-- ==========================================================
-- Row Level Security
-- แอปนี้ยังไม่มีระบบ login (ใช้ anon key ตรงจาก frontend)
-- เปิด RLS ไว้ตามมาตรฐานความปลอดภัย และอนุญาตให้ anon
-- อ่าน/เขียนได้เต็มที่ก่อน — ถ้าอนาคตเพิ่มระบบ login ค่อยมาแก้ policy
-- ให้ผูกกับ auth.uid() แทน
-- ==========================================================

alter table public.houses enable row level security;
alter table public.tags enable row level security;
alter table public.locations enable row level security;
alter table public.items enable row level security;

create policy "anon full access" on public.houses
  for all using (true) with check (true);

create policy "anon full access" on public.tags
  for all using (true) with check (true);

create policy "anon full access" on public.locations
  for all using (true) with check (true);

create policy "anon full access" on public.items
  for all using (true) with check (true);
