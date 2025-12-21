create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

create table if not exists users (
  id bigserial primary key,
  email text not null unique,
  password text not null,
  name text not null,
  avatar_url text,
  role text not null default 'USER' check (role in ('ADMIN', 'SHOP', 'USER')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists shops (
  id bigserial primary key,
  name text not null,
  owner_id bigint not null unique references users(id) on delete cascade,
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists products (
  id bigserial primary key,
  title text not null,
  description text,
  price integer not null check (price >= 0),
  image_url text,
  shop_id bigint not null references shops(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists product_images (
  id bigserial primary key,
  product_id bigint not null references products(id) on delete cascade,
  url text not null,
  sort_order integer not null default 0
);

create table if not exists carts (
  id bigserial primary key,
  user_id bigint not null unique references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists cart_items (
  id bigserial primary key,
  cart_id bigint not null references carts(id) on delete cascade,
  product_id bigint not null references products(id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  unique (cart_id, product_id)
);

create table if not exists invoices (
  id bigserial primary key,
  user_id bigint not null references users(id) on delete cascade,
  order_id text not null unique,
  email text not null,
  total integer not null default 0 check (total >= 0),
  item_count integer not null default 0 check (item_count >= 0),
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists shop_requests (
  id bigserial primary key,
  requester_id bigint not null references users(id) on delete cascade,
  shop_name text not null,
  shop_owner_email text not null,
  status text not null default 'PENDING' check (status in ('PENDING', 'APPROVED', 'REJECTED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists notifications (
  id bigserial primary key,
  user_id bigint not null references users(id) on delete cascade,
  title text not null,
  body text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_users_email on users(email);
create index if not exists idx_shops_owner_id on shops(owner_id);
create index if not exists idx_shops_verified on shops(verified);
create index if not exists idx_products_shop_id on products(shop_id);
create index if not exists idx_products_created_at on products(created_at);
create index if not exists idx_product_images_product_id on product_images(product_id);
create index if not exists idx_cart_items_cart_id on cart_items(cart_id);
create index if not exists idx_shop_requests_requester_id on shop_requests(requester_id);
create index if not exists idx_notifications_user_id on notifications(user_id);
create index if not exists idx_invoices_user_id on invoices(user_id);
create index if not exists idx_invoices_order_id on invoices(order_id);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists users_set_updated_at on users;
create trigger users_set_updated_at
before update on users
for each row execute function set_updated_at();

drop trigger if exists shops_set_updated_at on shops;
create trigger shops_set_updated_at
before update on shops
for each row execute function set_updated_at();

drop trigger if exists products_set_updated_at on products;
create trigger products_set_updated_at
before update on products
for each row execute function set_updated_at();

drop trigger if exists carts_set_updated_at on carts;
create trigger carts_set_updated_at
before update on carts
for each row execute function set_updated_at();

drop trigger if exists shop_requests_set_updated_at on shop_requests;
create trigger shop_requests_set_updated_at
before update on shop_requests
for each row execute function set_updated_at();

-- ============================================================================
-- Disable RLS (Row Level Security) for development
-- WARNING: Only disable for development/staging, enable RLS for production!
-- ============================================================================
alter table users disable row level security;
alter table shops disable row level security;
alter table products disable row level security;
alter table product_images disable row level security;
alter table carts disable row level security;
alter table cart_items disable row level security;
alter table shop_requests disable row level security;
alter table notifications disable row level security;
alter table invoices disable row level security;

-- ============================================================================
-- Grant permissions to service_role (for API access)
-- ============================================================================
grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant all on all functions in schema public to service_role;
grant all on invoices to service_role;
grant usage, select on sequence invoices_id_seq to service_role;

-- ============================================================================
-- Grant permissions to authenticated users
-- ============================================================================
grant usage on schema public to authenticated;
grant all on all tables in schema public to authenticated;
grant all on all sequences in schema public to authenticated;
grant all on all functions in schema public to authenticated;
grant all on invoices to authenticated;
grant usage, select on sequence invoices_id_seq to authenticated;

-- ============================================================================
-- Grant limited permissions to anon (public access)
-- ============================================================================
grant usage on schema public to anon;
grant select on all tables in schema public to anon;
grant select on invoices to anon;
grant usage, select on sequence invoices_id_seq to anon;

-- Future sequences: ensure grants apply to new sequences, too
alter default privileges in schema public grant usage, select on sequences to service_role;
alter default privileges in schema public grant usage, select on sequences to authenticated;
alter default privileges in schema public grant usage, select on sequences to anon;
