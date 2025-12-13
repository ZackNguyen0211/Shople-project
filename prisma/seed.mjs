import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Simple password for local testing
  const passwordHash = await bcrypt.hash('1', 10);

  const [admin, user, ...shopOwners] = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@local' },
      update: {},
      create: { email: 'admin@local', password: passwordHash, name: 'admin', role: 'ADMIN' },
    }),
    prisma.user.upsert({
      where: { email: 'user@local' },
      update: {},
      create: { email: 'user@local', password: passwordHash, name: 'user', role: 'USER' },
    }),
    // 6 shop owners
    prisma.user.upsert({ where: { email: 'shop1@local' }, update: {}, create: { email: 'shop1@local', password: passwordHash, name: 'shop1', role: 'SHOP' } }),
    prisma.user.upsert({ where: { email: 'shop2@local' }, update: {}, create: { email: 'shop2@local', password: passwordHash, name: 'shop2', role: 'SHOP' } }),
    prisma.user.upsert({ where: { email: 'shop3@local' }, update: {}, create: { email: 'shop3@local', password: passwordHash, name: 'shop3', role: 'SHOP' } }),
    prisma.user.upsert({ where: { email: 'shop4@local' }, update: {}, create: { email: 'shop4@local', password: passwordHash, name: 'shop4', role: 'SHOP' } }),
    prisma.user.upsert({ where: { email: 'shop5@local' }, update: {}, create: { email: 'shop5@local', password: passwordHash, name: 'shop5', role: 'SHOP' } }),
    prisma.user.upsert({ where: { email: 'shop6@local' }, update: {}, create: { email: 'shop6@local', password: passwordHash, name: 'shop6', role: 'SHOP' } }),
  ]);

  // Create 6 demo shops, each owned by a different shop user
  const shops = await Promise.all(
    shopOwners.map((owner, i) =>
      prisma.shop.upsert({
        where: { ownerId: owner.id },
        update: {},
        create: { name: `Demo Shop ${i + 1}`, ownerId: owner.id },
      })
    )
  );

  // Create 200 demo products across 6 shops
  const categories = [
    { name: 'Men Fashion', q: 'men' },
    { name: 'Phones & Accessories', q: 'phone' },
    { name: 'Electronics', q: 'electronics' },
    { name: 'Computers & Laptops', q: 'laptop' },
    { name: 'Cameras & Photo', q: 'camera' },
    { name: 'Watches', q: 'watch' },
    { name: 'Men Shoes', q: 'shoes men' },
    { name: 'Home', q: 'home' },
    { name: 'Sports & Travel', q: 'sport' },
    { name: 'Automotive', q: 'auto' },
    { name: 'Women Fashion', q: 'women' },
    { name: 'Mom & Baby', q: 'baby' },
    { name: 'Home & Living', q: 'living' },
    { name: 'Beauty', q: 'beauty' },
    { name: 'Health', q: 'health' },
    { name: 'Women Shoes', q: 'shoes women' },
    { name: 'Bags', q: 'bag' },
    { name: 'Jewelry', q: 'jewelry' },
    { name: 'Grocery', q: 'grocery' },
    { name: 'Books', q: 'book' },
  ];

  const productPayloads = Array.from({ length: 200 }).map((_, i) => {
    const idx = i + 1;
    const cat = categories[i % categories.length];
    const base = cat.name;
    const title = `${base} - ${cat.q} #${idx}`;
    const description = `Demo ${cat.q} item number ${idx}`;
    // Pseudo-random VND price (~129.000 ~ 1.829.000 VND)
    const price = 129000 + ((i * 37000) % 1700000);
    const shop = shops[i % shops.length];
    const imgText = encodeURIComponent(cat.q.toUpperCase());
    const images = [
      `https://via.placeholder.com/600?text=${imgText}+1`,
      `https://via.placeholder.com/600?text=${imgText}+2`,
      `https://via.placeholder.com/600?text=${imgText}+3`,
    ];
    return prisma.product.create({
      data: {
        title,
        description,
        price,
        shopId: shop.id,
        imageUrl: images[0],
        images: { create: images.map((url, sortOrder) => ({ url, sortOrder })) },
      },
    });
  });
  const products = await prisma.$transaction(productPayloads);

  await prisma.cart.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      items: { create: [{ productId: products[0].id, quantity: 2 }] },
    },
  });

  const order = await prisma.order.create({
    data: {
      userId: user.id,
      shopId: shops[0].id,
      status: 'PAID',
      totalCents: products[0].price * 2 + products[1].price,
      items: {
        create: [
          { productId: products[0].id, price: products[0].price, quantity: 2 },
          { productId: products[1].id, price: products[1].price, quantity: 1 },
        ],
      },
      payment: { create: { provider: 'demo', status: 'PAID', ref: 'PMT-DEMO-1' } },
    },
  });

  console.log('Seeded:', {
    admin: admin.email,
    shops: shops.length,
    user: user.email,
    shopOwners: shopOwners.map((s) => s.email),
    products: products.length,
    order: order.id,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


