-- ==============================================================================
-- FHR CAR SERVICE - SUPABASE DATABASE SCHEMA
-- Jalankan query SQL ini di Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. ORDERS TABLE (Pesanan Servis & SPK)
create table if not exists public.orders (
  id text primary key,
  spk_number text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  status text default 'pending',
  total_price numeric default 0,
  customer_name text,
  phone text,
  service_type text,
  car_brand text,
  car_model text,
  car_year text,
  license_plate text,
  location_address text,
  is_emergency boolean default false,
  notes text,
  service_date text,
  service_time text,
  service_location text,
  sa_name text,
  sa_id text,
  fa_name text,
  fa_id text,
  mekanik_name text,
  mekanik_id text,
  kasir_name text,
  kasir_id text,
  kilometer text,
  no_rangka text,
  no_mesin text,
  fuel_type text,
  spareparts jsonb default '[]'::jsonb,
  jasa_list jsonb default '[]'::jsonb,
  sa_check_eksterior jsonb default '[]'::jsonb,
  sa_check_interior jsonb default '[]'::jsonb,
  sa_check_mesin jsonb default '[]'::jsonb,
  sa_check_kaki_kaki jsonb default '[]'::jsonb,
  lpa_checklist jsonb default '[]'::jsonb,
  sa_catatan_umum text,
  lpa_catatan text,
  diskon numeric default 0,
  pajak_persen numeric default 0,
  metode_pembayaran text default 'cash',
  dibayar numeric default 0,
  kembalian numeric default 0,
  customer_type text default 'BARU',
  customer_id text,
  raw_data jsonb default '{}'::jsonb
);

-- 2. CUSTOMERS TABLE (Data Pelanggan)
create table if not exists public.customers (
  id text primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  name text not null,
  phone text,
  email text,
  address text,
  car_brand text,
  car_model text,
  car_year text,
  license_plate text,
  vin_number text,
  engine_number text,
  fuel_type text,
  transmission text,
  customer_type text default 'BARU',
  notes text,
  raw_data jsonb default '{}'::jsonb
);

-- 3. EMPLOYEES TABLE (Data Karyawan & HRD)
create table if not exists public.employees (
  id text primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  name text not null,
  nik text,
  role text not null default 'Mekanik',
  phone text,
  email text,
  status text not null default 'active',
  raw_data jsonb default '{}'::jsonb
);

-- 4. INVENTORY TABLE (Kelola Sparepart & Jasa)
create table if not exists public.inventory (
  id text primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  sku_code text,
  name text not null,
  category text,
  type text default 'sparepart',
  unit text default 'pcs',
  stock numeric default 0,
  min_stock numeric default 0,
  buy_price numeric default 0,
  sell_price numeric default 0,
  duration_minutes numeric,
  warranty_days numeric,
  notes text,
  is_active boolean default true,
  raw_data jsonb default '{}'::jsonb
);

-- 5. PURCHASE ORDERS TABLE (Pembelian Stok / PO)
create table if not exists public.purchase_orders (
  id text primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  po_number text,
  supplier text,
  supplier_phone text,
  status text default 'draft',
  items jsonb default '[]'::jsonb,
  total_amount numeric default 0,
  notes text,
  ordered_at timestamptz,
  received_at timestamptz,
  raw_data jsonb default '{}'::jsonb
);

-- 6. ACTIVITY PLANS TABLE (Daily Activity Plan / DAP)
create table if not exists public.activity_plans (
  id text primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  date text,
  title text,
  division text,
  target_units numeric default 0,
  target_omset numeric default 0,
  tasks jsonb default '[]'::jsonb,
  notes text,
  raw_data jsonb default '{}'::jsonb
);

-- 7. DISCUSSIONS TABLE (Chat Tim Internal)
create table if not exists public.discussions (
  id text primary key,
  created_at timestamptz default now(),
  sender_id text,
  sender_name text not null,
  sender_role text,
  sender_avatar text,
  message text not null,
  category text default 'umum',
  attachments jsonb default '[]'::jsonb,
  raw_data jsonb default '{}'::jsonb
);

-- 8. ARTICLES TABLE (CMS Tips & Artikel)
create table if not exists public.articles (
  id text primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  title text not null,
  slug text not null,
  category text,
  date text,
  read_time text,
  author text,
  author_avatar text,
  cover_image text,
  excerpt text,
  content text,
  tags jsonb default '[]'::jsonb,
  featured boolean default false,
  status text default 'published',
  raw_data jsonb default '{}'::jsonb
);

-- 9. LPA TABLE (Lembar Pemeriksaan Awal)
create table if not exists public.lpa (
  id text primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  nopol text,
  pelanggan text,
  tipe_mobil text,
  mekanik text,
  km text,
  tanggal text,
  saran text,
  items jsonb default '{}'::jsonb,
  raw_data jsonb default '{}'::jsonb
);

-- 10. JOURNAL ENTRIES TABLE (Jurnal Transaksi & Kas Keuangan)
create table if not exists public.journal_entries (
  id text primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  tanggal text not null,
  ref text,
  keterangan text not null,
  no_akun_debet text not null,
  nama_akun_debet text not null,
  debet numeric default 0,
  no_akun_kredit text not null,
  nama_akun_kredit text not null,
  kredit numeric default 0,
  type text default 'manual_pengeluaran',
  sumber_dana text default 'kas_tangan',
  spk_id text,
  spk_number text,
  is_manual boolean default true,
  is_hpp boolean default false,
  raw_data jsonb default '{}'::jsonb
);

-- ==============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS) & POLICIES (Full Access for Anon Key)
-- ==============================================================================
alter table public.orders enable row level security;
alter table public.customers enable row level security;
alter table public.employees enable row level security;
alter table public.inventory enable row level security;
alter table public.purchase_orders enable row level security;
alter table public.activity_plans enable row level security;
alter table public.discussions enable row level security;
alter table public.articles enable row level security;
alter table public.lpa enable row level security;
alter table public.journal_entries enable row level security;

create policy "Anon full access orders" on public.orders for all using (true) with check (true);
create policy "Anon full access customers" on public.customers for all using (true) with check (true);
create policy "Anon full access employees" on public.employees for all using (true) with check (true);
create policy "Anon full access inventory" on public.inventory for all using (true) with check (true);
create policy "Anon full access purchase_orders" on public.purchase_orders for all using (true) with check (true);
create policy "Anon full access activity_plans" on public.activity_plans for all using (true) with check (true);
create policy "Anon full access discussions" on public.discussions for all using (true) with check (true);
create policy "Anon full access articles" on public.articles for all using (true) with check (true);
create policy "Anon full access lpa" on public.lpa for all using (true) with check (true);
create policy "Anon full access journal_entries" on public.journal_entries for all using (true) with check (true);

-- ==============================================================================
-- ENABLE REALTIME PUBLICATION
-- ==============================================================================
do $$
begin
  alter publication supabase_realtime add table public.orders, public.customers, public.employees, public.inventory, public.purchase_orders, public.activity_plans, public.discussions, public.articles, public.lpa, public.journal_entries;
exception when others then
  null; -- Abaikan jika sudah terdaftar
end $$;
