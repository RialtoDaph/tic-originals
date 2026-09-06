-- Fase 1: table mirrors of base44/entities/*.jsonc.
--
-- `legacy_id` on every table stores the original Base44 record id. It exists
-- purely so the Fase 1 sync script can upsert idempotently and remap foreign
-- keys (e.g. Review.product_id, Bundle.product_ids) from Base44 string ids
-- to the new Postgres uuids. It can be dropped once the migration is final.

-- === profiles (mirrors the User entity's custom "role" field; everything
-- else about a user already lives in auth.users) ==============================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'user' check (role in ('admin', 'user')),
  legacy_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- === products ================================================================
create table public.products (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  name text not null,
  slug text unique,
  category text not null check (category in ('tees', 'hoodies', 'caps', 'accessories', 'other')),
  description text,
  description_de text,
  description_en text,
  care_instructions_de text,
  care_instructions_en text,
  material text,
  price numeric(10, 2) not null,
  stripe_price_id text,
  images text[] not null default '{}',
  colors text[] not null default '{}',
  sizes text[] not null default '{}'
    check (sizes <@ array['XS', 'S', 'M', 'L', 'XL', 'XXL', 'one-size']::text[]),
  stock jsonb not null default '[]', -- [{ color, size, quantity }]
  tags text[] not null default '{}',
  weight_grams integer,
  low_stock_threshold integer not null default 3,
  is_active boolean not null default true,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_is_active_idx on public.products (is_active);
create index products_created_at_idx on public.products (created_at desc);

-- === bundles ==================================================================
create table public.bundles (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  name text not null,
  product_ids uuid[] not null default '{}', -- may repeat an id for quantity > 1
  normal_price numeric(10, 2) not null,
  bundle_price numeric(10, 2) not null,
  bundle_sale_price numeric(10, 2),
  sale_valid_until date,
  items_summary text,
  is_active boolean not null default true,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index bundles_is_active_idx on public.bundles (is_active);

-- === orders ===================================================================
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  order_number text not null unique, -- format TIC-2026-XXXX
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned')),
  items jsonb not null default '[]', -- [{ product_id, product_name, color, size, quantity, unit_price }]
  subtotal numeric(10, 2),
  shipping_cost numeric(10, 2),
  discount_amount numeric(10, 2) not null default 0,
  applied_discount_code text,
  total numeric(10, 2),
  vat_amount numeric(10, 2),
  customer_email text not null,
  customer_name text,
  customer_phone text,
  language text not null default 'de' check (language in ('en', 'de')),
  shipping_address jsonb,
  shipping_method text check (shipping_method in ('standard')),
  shipping_carrier text,
  tracking_number text,
  payment_method text check (payment_method in ('stripe', 'paypal')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  stripe_session_id text,
  stripe_payment_intent text,
  stock_decremented boolean not null default false,
  notes text,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_customer_email_idx on public.orders (customer_email);
create index orders_payment_status_idx on public.orders (payment_status);
create index orders_created_at_idx on public.orders (created_at desc);

-- === discount_codes ===========================================================
create table public.discount_codes (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  code text not null unique,
  description text,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value numeric not null,
  is_active boolean not null default true,
  is_first_order_only boolean not null default false,
  maximum_discount_amount numeric,
  minimum_order_amount numeric not null default 0,
  usage_limit integer,
  usage_limit_per_customer integer not null default 1,
  used_count integer not null default 0,
  valid_from date,
  valid_until date,
  applicable_product_ids uuid[] not null default '{}',
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index discount_codes_is_active_idx on public.discount_codes (is_active);

-- === legal_pages ===============================================================
create table public.legal_pages (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  slug text not null unique, -- impressum | datenschutz | agb
  title_de text not null,
  title_en text,
  subtitle_de text,
  subtitle_en text,
  content_de text not null,
  content_en text,
  is_active boolean not null default true,
  last_updated date,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- === newsletter_subscribers ====================================================
create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  email text not null unique,
  description text,
  is_active boolean not null default true,
  language text not null default 'de' check (language in ('en', 'de')),
  unsubscribe_token text,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- === contact_messages ===========================================================
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  name text not null,
  email text not null,
  subject text,
  message text not null,
  description text check (char_length(description) <= 1000),
  is_read boolean not null default false,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- === reviews =====================================================================
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  product_id uuid not null references public.products(id) on delete cascade,
  author_name text not null,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  description text check (char_length(description) <= 1000),
  is_approved boolean not null default false,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index reviews_product_id_idx on public.reviews (product_id);
create index reviews_is_approved_idx on public.reviews (is_approved);

-- === site_settings ================================================================
create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  key text not null unique,
  value text,
  description text check (char_length(description) <= 1000),
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- updated_at / created_by triggers, shared across all tables above.
do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles', 'products', 'bundles', 'orders', 'discount_codes',
    'legal_pages', 'newsletter_subscribers', 'contact_messages',
    'reviews', 'site_settings'
  ]
  loop
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t);
    if t <> 'profiles' then
      execute format('create trigger set_created_by before insert on public.%I for each row execute function public.set_created_by()', t);
    end if;
  end loop;
end $$;
