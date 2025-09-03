-- Nexus Market EDU Database Schema
-- Comprehensive marketplace with courses, e-commerce, and affiliate system

-- 1) USER PROFILES & ROLES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  avatar_url text,
  role text check (role in ('user','seller','admin')) default 'user',
  bio text,
  
  -- Seller specific fields
  pix_key text,
  tax_id text,
  seller_slug text unique,
  is_verified boolean default false,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2) STORES/SHOPS
create table public.stores (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  slug text not null unique,
  description text,
  logo_url text,
  banner_url text,
  
  -- Settings
  theme jsonb default '{}',
  is_active boolean default true,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3) PRODUCT CATEGORIES
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  icon text,
  parent_id uuid references public.categories(id) on delete cascade,
  sort_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 4) PRODUCTS
create table public.products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid references public.stores(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  
  title text not null,
  slug text not null,
  description text,
  thumbnail_url text,
  
  -- Product type and pricing
  type text check (type in ('digital','curso','fisico','servico','bundle','assinatura')) default 'digital',
  price_cents int not null default 0,
  compare_price_cents int,
  currency text default 'BRL',
  
  -- Course specific
  total_lessons int default 0,
  total_duration_minutes int default 0,
  difficulty_level text check (difficulty_level in ('beginner','intermediate','advanced')),
  
  -- Physical products
  weight_grams int,
  requires_shipping boolean default false,
  
  -- Status and settings
  status text check (status in ('draft','published','paused','archived')) default 'draft',
  featured boolean default false,
  allow_affiliates boolean default true,
  
  -- SEO
  meta_title text,
  meta_description text,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  unique(store_id, slug)
);

-- 5) COURSE MODULES & LESSONS
create table public.modules (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  title text not null,
  description text,
  sort_order int not null default 0,
  created_at timestamptz default now()
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid references public.modules(id) on delete cascade,
  title text not null,
  description text,
  video_url text,
  video_duration_seconds int,
  content text, -- Rich text content
  resources jsonb default '{}', -- Downloads, links, etc
  is_preview boolean default false,
  sort_order int not null default 0,
  created_at timestamptz default now()
);

-- 6) ORDERS & PAYMENTS
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  
  -- Order details
  total_cents int not null,
  currency text default 'BRL',
  status text check (status in ('pending','paid','failed','cancelled','refunded')) default 'pending',
  
  -- Payment gateway info
  gateway text, -- stripe, appmax
  gateway_session_id text,
  gateway_payment_id text,
  
  -- Customer info (for guest checkout)
  customer_email text,
  customer_name text,
  
  -- Shipping (for physical products)
  shipping_address jsonb,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  
  unit_price_cents int not null,
  quantity int not null default 1,
  
  -- Revenue split
  seller_share_cents int default 0,
  affiliate_share_cents int default 0,
  platform_share_cents int default 0,
  
  created_at timestamptz default now()
);

-- 7) LICENSES (Product Access)
create table public.licenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  
  expires_at timestamptz,
  is_active boolean default true,
  
  created_at timestamptz default now(),
  unique(user_id, product_id)
);

-- 8) AFFILIATE SYSTEM
create table public.affiliates (
  id uuid primary key default gen_random_uuid(),
  store_id uuid references public.stores(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  status text check (status in ('pending','approved','rejected')) default 'pending',
  default_commission_pct numeric(5,2) default 20.00,
  affiliate_code text not null,
  created_at timestamptz default now(),
  unique(store_id, user_id),
  unique(affiliate_code)
);

create table public.product_commissions (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  affiliate_id uuid references public.affiliates(id) on delete cascade,
  commission_pct numeric(5,2) not null,
  unique(product_id, affiliate_id)
);

-- 9) COURSE PROGRESS
create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete cascade,
  
  progress_seconds int default 0,
  completed boolean default false,
  completed_at timestamptz,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, lesson_id)
);

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.stores enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.licenses enable row level security;
alter table public.affiliates enable row level security;
alter table public.product_commissions enable row level security;
alter table public.lesson_progress enable row level security;

-- RLS POLICIES

-- Profiles: Users can read/update own profile, admins can read all
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Stores: Public read for active stores, owners can manage
create policy "Anyone can view active stores" on public.stores
  for select using (is_active = true);

create policy "Store owners can manage their stores" on public.stores
  for all using (auth.uid() = owner_id);

-- Categories: Public read
create policy "Anyone can view active categories" on public.categories
  for select using (is_active = true);

-- Products: Public read for published, owners can manage
create policy "Anyone can view published products" on public.products
  for select using (status = 'published');

create policy "Store owners can manage their products" on public.products
  for all using (
    exists(
      select 1 from public.stores s 
      where s.id = store_id and s.owner_id = auth.uid()
    )
  );

-- Modules: Public read for published product modules, owners can manage
create policy "Anyone can view published product modules" on public.modules
  for select using (
    exists(
      select 1 from public.products p 
      where p.id = product_id and p.status = 'published'
    )
  );

create policy "Store owners can manage their modules" on public.modules
  for all using (
    exists(
      select 1 from public.products p
      join public.stores s on s.id = p.store_id
      where p.id = product_id and s.owner_id = auth.uid()
    )
  );

-- Lessons: Preview lessons public, full access requires license
create policy "Anyone can view preview lessons" on public.lessons
  for select using (
    is_preview = true and exists(
      select 1 from public.modules m
      join public.products p on p.id = m.product_id
      where m.id = module_id and p.status = 'published'
    )
  );

create policy "Licensed users can view all lessons" on public.lessons
  for select using (
    exists(
      select 1 from public.modules m
      join public.products p on p.id = m.product_id
      join public.licenses l on l.product_id = p.id
      where m.id = module_id and l.user_id = auth.uid() and l.is_active = true
    )
  );

create policy "Store owners can manage their lessons" on public.lessons
  for all using (
    exists(
      select 1 from public.modules m
      join public.products p on p.id = m.product_id
      join public.stores s on s.id = p.store_id
      where m.id = module_id and s.owner_id = auth.uid()
    )
  );

-- Orders: Users can view own orders
create policy "Users can view own orders" on public.orders
  for select using (auth.uid() = user_id);

create policy "Users can create orders" on public.orders
  for insert with check (auth.uid() = user_id);

-- Order items: Users can view items from their orders
create policy "Users can view own order items" on public.order_items
  for select using (
    exists(
      select 1 from public.orders o 
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

-- Licenses: Users can view own licenses
create policy "Users can view own licenses" on public.licenses
  for select using (auth.uid() = user_id);

-- Affiliates: Users can view own affiliates, store owners can see their affiliates
create policy "Users can view own affiliates" on public.affiliates
  for select using (
    auth.uid() = user_id or 
    exists(
      select 1 from public.stores s 
      where s.id = store_id and s.owner_id = auth.uid()
    )
  );

create policy "Users can request affiliate status" on public.affiliates
  for insert with check (auth.uid() = user_id);

-- Lesson progress: Users can view/update own progress
create policy "Users can manage own lesson progress" on public.lesson_progress
  for all using (auth.uid() = user_id);

-- Create updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Apply updated_at triggers
create trigger handle_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger handle_stores_updated_at
  before update on public.stores
  for each row execute function public.handle_updated_at();

create trigger handle_products_updated_at
  before update on public.products
  for each row execute function public.handle_updated_at();

create trigger handle_orders_updated_at
  before update on public.orders
  for each row execute function public.handle_updated_at();

create trigger handle_lesson_progress_updated_at
  before update on public.lesson_progress
  for each row execute function public.handle_updated_at();

-- Create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id, 
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Insert default categories
insert into public.categories (name, slug, icon) values
  ('Desenvolvimento', 'desenvolvimento', '💻'),
  ('Design', 'design', '🎨'),
  ('Marketing', 'marketing', '📈'),
  ('Negócios', 'negocios', '💼'),
  ('Idiomas', 'idiomas', '🗣️'),
  ('Saúde', 'saude', '💪'),
  ('Música', 'musica', '🎵'),
  ('Fotografia', 'fotografia', '📸');