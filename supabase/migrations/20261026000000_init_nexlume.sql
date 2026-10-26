-- Migration: 20261026000000_init_nexlume.sql
-- Initializes profiles, shops, panels, products, storage bucket, RLS, and functions

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  role text not null check (role in ('admin', 'viewer')) default 'viewer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.handle_updated_at();

create table if not exists public.shops (
  id text primary key,
  shop_code text not null unique,
  name text not null,
  district text not null,
  location text not null,
  pincode text,
  contact_person text,
  contact_number text,
  status text default 'Active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_shops_updated_at on public.shops;
create trigger set_shops_updated_at
before update on public.shops
for each row execute function public.handle_updated_at();

create table if not exists public.panels (
  id text primary key,
  panel_code text not null unique,
  name text not null,
  shop_id text references public.shops(id) on delete set null,
  resolution text default '1920 × 1080',
  status text default 'Running',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_panels_updated_at on public.panels;
create trigger set_panels_updated_at
before update on public.panels
for each row execute function public.handle_updated_at();

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  product_code text,
  name text not null,
  name_ta text,
  image_url text,
  image_path text,
  quantity numeric not null default 0 check (quantity >= 0),
  unit text not null check (unit in ('kg', 'g', 'L', 'ml', 'oz', 'pcs')),
  shop_id text references public.shops(id) on delete cascade,
  panel_id text references public.panels(id) on delete set null,
  category text default 'General',
  description text,
  low_stock_threshold numeric default 20 check (low_stock_threshold >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
before update on public.products
for each row execute function public.handle_updated_at();

create index if not exists idx_products_name on public.products(name);
create index if not exists idx_products_shop_id on public.products(shop_id);
create index if not exists idx_products_panel_id on public.products(panel_id);
create index if not exists idx_panels_shop_id on public.panels(shop_id);
create index if not exists idx_profiles_username on public.profiles(lower(username));

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.get_auth_email_by_username(p_username text)
returns text
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_email text;
begin
  select u.email into v_email
  from auth.users u
  join public.profiles p on p.id = u.id
  where lower(trim(p.username)) = lower(trim(p_username));

  return v_email;
end;
$$;

grant execute on function public.get_auth_email_by_username(text) to anon, authenticated;
grant execute on function public.is_admin() to authenticated;

alter table public.profiles enable row level security;
alter table public.shops enable row level security;
alter table public.panels enable row level security;
alter table public.products enable row level security;

drop policy if exists "Public can view products" on public.products;
create policy "Public can view products" on public.products for select using (true);

drop policy if exists "Admins can insert products" on public.products;
create policy "Admins can insert products" on public.products for insert
  with check (public.is_admin() or auth.role() = 'authenticated');

drop policy if exists "Admins can update products" on public.products;
create policy "Admins can update products" on public.products for update
  using (public.is_admin() or auth.role() = 'authenticated')
  with check (public.is_admin() or auth.role() = 'authenticated');

drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products" on public.products for delete
  using (public.is_admin() or auth.role() = 'authenticated');

drop policy if exists "Public can view shops" on public.shops;
create policy "Public can view shops" on public.shops for select using (true);

drop policy if exists "Admins can insert shops" on public.shops;
create policy "Admins can insert shops" on public.shops for insert
  with check (public.is_admin() or auth.role() = 'authenticated');

drop policy if exists "Admins can update shops" on public.shops;
create policy "Admins can update shops" on public.shops for update
  using (public.is_admin() or auth.role() = 'authenticated')
  with check (public.is_admin() or auth.role() = 'authenticated');

drop policy if exists "Admins can delete shops" on public.shops;
create policy "Admins can delete shops" on public.shops for delete
  using (public.is_admin() or auth.role() = 'authenticated');

drop policy if exists "Public can view panels" on public.panels;
create policy "Public can view panels" on public.panels for select using (true);

drop policy if exists "Admins can insert panels" on public.panels;
create policy "Admins can insert panels" on public.panels for insert
  with check (public.is_admin() or auth.role() = 'authenticated');

drop policy if exists "Admins can update panels" on public.panels;
create policy "Admins can update panels" on public.panels for update
  using (public.is_admin() or auth.role() = 'authenticated')
  with check (public.is_admin() or auth.role() = 'authenticated');

drop policy if exists "Admins can delete panels" on public.panels;
create policy "Admins can delete panels" on public.panels for delete
  using (public.is_admin() or auth.role() = 'authenticated');

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles for select
  using (auth.uid() = id or public.is_admin());

drop policy if exists "Admins can manage profiles" on public.profiles;
create policy "Admins can manage profiles" on public.profiles for all
  using (public.is_admin() or auth.uid() = id)
  with check (public.is_admin() or (auth.uid() = id and role = 'viewer'));

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can read product images" on storage.objects;
create policy "Public can read product images" on storage.objects for select
  using (bucket_id = 'product-images');

drop policy if exists "Authenticated users can upload product images" on storage.objects;
create policy "Authenticated users can upload product images" on storage.objects for insert
  with check (bucket_id = 'product-images' and auth.role() = 'authenticated');

drop policy if exists "Authenticated users can update product images" on storage.objects;
create policy "Authenticated users can update product images" on storage.objects for update
  using (bucket_id = 'product-images' and auth.role() = 'authenticated');

drop policy if exists "Authenticated users can delete product images" on storage.objects;
create policy "Authenticated users can delete product images" on storage.objects for delete
  using (bucket_id = 'product-images' and auth.role() = 'authenticated');

insert into public.shops (id, shop_code, name, district, location, pincode, contact_person, contact_number, status)
values
  ('TN-RS-1001', 'TN-RS-1001', 'Anna Nagar Fair Price Shop #1', 'Chennai', '12, 2nd Avenue, Anna Nagar West, Chennai', '600040', 'R. Soundararajan', '9840123456', 'Active'),
  ('TN-RS-1002', 'TN-RS-1002', 'T. Nagar Central Fair Price Shop', 'Chennai', '45, South Usman Road, T. Nagar, Chennai', '600017', 'M. Selvakumar', '9840987654', 'Active'),
  ('TN-RS-2001', 'TN-RS-2001', 'Gandhipuram Public Outlet #3', 'Coimbatore', '88, Cross Cut Road, Gandhipuram, Coimbatore', '641012', 'K. Murugesan', '9443123450', 'Active')
on conflict (id) do nothing;

insert into public.panels (id, panel_code, name, shop_id, resolution, status)
values
  ('PNL-001', 'PNL-001', 'Main Counter TV #1', 'TN-RS-1001', '1920 × 1080', 'Running'),
  ('PNL-002', 'PNL-002', 'Entrance Information Display', 'TN-RS-1001', '1920 × 1080', 'Running'),
  ('PNL-003', 'PNL-003', 'T. Nagar Hall TV #1', 'TN-RS-1002', '1920 × 1080', 'Running'),
  ('PNL-004', 'PNL-004', 'Coimbatore Counter Display', 'TN-RS-2001', '1920 × 1080', 'Running')
on conflict (id) do nothing;

insert into public.products (product_code, name, name_ta, quantity, unit, shop_id, panel_id, category, description, low_stock_threshold)
values
  ('P001', 'Rice', 'அரிசி', 1800, 'kg', 'TN-RS-1001', 'PNL-001', 'Grains', 'Boiled / Raw Ponni Rice for PDS ration cardholders', 200),
  ('P002', 'Sugar', 'சர்க்கரை', 45, 'kg', 'TN-RS-1001', 'PNL-001', 'Essential', 'Refined crystal white sugar', 50),
  ('P003', 'Black Gram', 'கருப்பு உளுந்து', 10, 'kg', 'TN-RS-1001', 'PNL-001', 'Pulses', 'Whole black gram / urad dal', 30),
  ('P004', 'Palm Oil', 'பாமாயில்', 75, 'L', 'TN-RS-1001', 'PNL-001', 'Cooking Oil', 'Fortified refined palm olein oil (1L pack)', 25),
  ('P005', 'Wheat', 'கோதுமை', 35, 'kg', 'TN-RS-1001', 'PNL-001', 'Grains', 'Whole wheat grain', 40),
  ('P006', 'Toor Dal', 'துவரம் பருப்பு', 120, 'kg', 'TN-RS-1001', 'PNL-001', 'Pulses', 'Special PDS yellow split toor dal', 30),
  ('P007', 'Green Gram', 'பாசிப் பருப்பு', 20, 'kg', 'TN-RS-1001', 'PNL-001', 'Pulses', 'High protein green moong dal', 25)
on conflict do nothing;
