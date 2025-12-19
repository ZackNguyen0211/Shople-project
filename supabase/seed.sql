with
admin as (
  insert into users (email, password, name, role)
  values ('admin@local', '$2a$10$nWSpMXROGYLwuJxhRiom..RuNjJPwh9kj/uUxUEIxhoazhibadDDq', 'admin', 'ADMIN')
  returning id
),
regular as (
  insert into users (email, password, name, role)
  values ('user@local', '$2a$10$nWSpMXROGYLwuJxhRiom..RuNjJPwh9kj/uUxUEIxhoazhibadDDq', 'user', 'USER')
  returning id
),
shop1_user as (
  insert into users (email, password, name, role)
  values ('shop1@local', '$2a$10$nWSpMXROGYLwuJxhRiom..RuNjJPwh9kj/uUxUEIxhoazhibadDDq', 'shop1', 'SHOP')
  returning id
),
shop2_user as (
  insert into users (email, password, name, role)
  values ('shop2@local', '$2a$10$nWSpMXROGYLwuJxhRiom..RuNjJPwh9kj/uUxUEIxhoazhibadDDq', 'shop2', 'SHOP')
  returning id
),
shops as (
  insert into shops (name, owner_id)
  values
    ('Demo Shop 1', (select id from shop1_user)),
    ('Demo Shop 2', (select id from shop2_user))
  returning id, name
),
shop_ids as (
  select
    (select id from shops order by id asc limit 1) as shop1_id,
    (select id from shops order by id asc offset 1 limit 1) as shop2_id
),
categories as (
  select * from (values
    (1, 'Men Fashion', 'men'),
    (2, 'Phones & Accessories', 'phone'),
    (3, 'Electronics', 'electronics'),
    (4, 'Computers & Laptops', 'laptop'),
    (5, 'Cameras & Photo', 'camera'),
    (6, 'Watches', 'watch'),
    (7, 'Men Shoes', 'shoes men'),
    (8, 'Home', 'home'),
    (9, 'Sports & Travel', 'sport'),
    (10, 'Automotive', 'auto'),
    (11, 'Women Fashion', 'women'),
    (12, 'Mom & Baby', 'baby'),
    (13, 'Home & Living', 'living'),
    (14, 'Beauty', 'beauty'),
    (15, 'Health', 'health'),
    (16, 'Women Shoes', 'shoes women'),
    (17, 'Bags', 'bag'),
    (18, 'Jewelry', 'jewelry'),
    (19, 'Grocery', 'grocery'),
    (20, 'Books', 'book')
  ) as c(idx, name, q)
),
product_rows as (
  select
    gs.i,
    c.name,
    c.q,
    c.name || ' - ' || c.q || ' #' || gs.i as title,
    s.shop1_id,
    s.shop2_id
  from generate_series(1, 40) as gs(i)
  join categories c on c.idx = ((gs.i - 1) % 20) + 1
  cross join shop_ids s
),
products as (
  insert into products (title, description, price, shop_id, image_url)
  select
    pr.title,
    'Demo ' || pr.q || ' item number ' || pr.i,
    129000 + ((pr.i - 1) * 37000) % 1700000,
    case when (pr.i - 1) % 2 = 0 then pr.shop1_id else pr.shop2_id end,
    'https://via.placeholder.com/600?text=' || upper(pr.q) || '+1'
  from product_rows pr
  returning id, title, price
),
product_images as (
  insert into product_images (product_id, url, sort_order)
  select
    p.id,
    'https://via.placeholder.com/600?text=' || upper(pr.q) || '+' || img.n,
    img.n - 1
  from products p
  join product_rows pr on pr.title = p.title
  cross join generate_series(1, 3) as img(n)
  returning id
),
user_cart as (
  insert into carts (user_id)
  values ((select id from regular))
  returning id
),
first_products as (
  select id, price
  from products
  order by id asc
  limit 2
),
first_product as (
  select id, price from first_products order by id asc limit 1
),
second_product as (
  select id, price from first_products order by id asc offset 1 limit 1
),
cart_item as (
  insert into cart_items (cart_id, product_id, quantity)
  values ((select id from user_cart), (select id from first_product), 2)
  returning id
),
order_row as (
  insert into orders (user_id, shop_id, status, total_cents)
  values (
    (select id from regular),
    (select shop1_id from shop_ids),
    'PAID',
    (select (select price from first_product) * 2 + (select price from second_product))
  )
  returning id
),
order_items as (
  insert into order_items (order_id, product_id, price, quantity)
  values
    ((select id from order_row), (select id from first_product), (select price from first_product), 2),
    ((select id from order_row), (select id from second_product), (select price from second_product), 1)
  returning id
),
payment_row as (
  insert into payments (order_id, provider, status, ref)
  values ((select id from order_row), 'demo', 'PAID', 'PMT-DEMO-1')
  returning id
)
select 'seeded' as status;
