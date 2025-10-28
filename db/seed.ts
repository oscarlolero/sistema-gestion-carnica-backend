// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // 1️⃣ Create or reuse base units
  const kg = await prisma.unit.upsert({
    where: { name: 'Kilogramo' },
    update: {},
    create: { name: 'Kilogramo', abbreviation: 'kg', conversionFactor: 1.0 },
  });

  const pza = await prisma.unit.upsert({
    where: { name: 'Pieza' },
    update: {},
    create: { name: 'Pieza', abbreviation: 'pza', conversionFactor: 0.5 },
  });

  // 2️⃣ Create cuts
  await prisma.cut.createMany({
    data: [
      { name: 'Entera', description: 'Corte completo sin modificar' },
      { name: 'Sacada', description: 'Corte con hueso removido' },
      { name: 'Rodajas', description: 'Cortado en rodajas delgadas' },
      { name: 'Cruz', description: 'Corte transversal' },
      { name: 'En Cuatro', description: 'Dividido en cuatro partes' },
      { name: 'Tapa', description: 'Solo la parte superior' },
      { name: 'Filete', description: 'Corte fino y tierno' },
      { name: 'Cubos', description: 'Cortado en cubos pequeños' },
    ],
    skipDuplicates: true,
  });

  // 3️⃣ Create categories
  await prisma.category.createMany({
    data: [
      { name: 'Cajas de Menudo', description: 'Productos de menudencia' },
      { name: 'Viscera Blanca', description: 'Vísceras blancas del animal' },
      { name: 'Viscera Roja', description: 'Vísceras rojas del animal' },
      { name: 'Bolsas', description: 'Bolsas y empaques' },
      { name: 'Carnes Premium', description: 'Cortes de alta calidad' },
      { name: 'Carnes Regulares', description: 'Cortes estándar' },
    ],
    skipDuplicates: true,
  });

  // 4️⃣ Create users
  const user1 = await prisma.user.upsert({
    where: { email: 'oscar@carniceria.com' },
    update: {},
    create: {
      name: 'Oscar Montes',
      email: 'oscar@carniceria.com',
      role: 'admin',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'maria@carniceria.com' },
    update: {},
    create: {
      name: 'María González',
      email: 'maria@carniceria.com',
      role: 'vendedor',
    },
  });

  // 5️⃣ Create 5 creative products
  const products = await Promise.all([
    // Product 1: Premium Beef Rib
    prisma.product.create({
      data: {
        name: 'Costilla de Res Premium',
        description: 'Costilla de res de primera calidad, perfecta para asar',
        barcode: '1234567890001',
        pricePerKg: 280.0,
        baseUnitId: kg.id,
        categories: {
          create: [
            { category: { connect: { name: 'Carnes Premium' } } },
            { category: { connect: { name: 'Viscera Roja' } } },
          ],
        },
        cuts: {
          create: [
            { cut: { connect: { name: 'Entera' } }, pricePerKg: 280.0 },
            { cut: { connect: { name: 'Rodajas' } }, pricePerKg: 300.0 },
          ],
        },
      },
    }),

    // Product 2: Chicken Breast
    prisma.product.create({
      data: {
        name: 'Pechuga de Pollo Orgánica',
        description: 'Pechuga de pollo orgánico, libre de hormonas',
        barcode: '1234567890002',
        pricePerKg: 120.0,
        baseUnitId: kg.id,
        categories: {
          create: [{ category: { connect: { name: 'Carnes Regulares' } } }],
        },
        cuts: {
          create: [
            { cut: { connect: { name: 'Filete' } }, pricePerKg: 140.0 },
            { cut: { connect: { name: 'Cubos' } }, pricePerKg: 130.0 },
          ],
        },
      },
    }),

    // Product 3: Pork Chops
    prisma.product.create({
      data: {
        name: 'Chuletas de Cerdo',
        description: 'Chuletas de cerdo frescas, ideales para la parrilla',
        barcode: '1234567890003',
        pricePerKg: 95.0,
        baseUnitId: kg.id,
        categories: {
          create: [{ category: { connect: { name: 'Carnes Regulares' } } }],
        },
        cuts: {
          create: [
            { cut: { connect: { name: 'Entera' } }, pricePerKg: 95.0 },
            { cut: { connect: { name: 'En Cuatro' } }, pricePerKg: 100.0 },
          ],
        },
      },
    }),

    // Product 4: Beef Liver
    prisma.product.create({
      data: {
        name: 'Hígado de Res',
        description: 'Hígado de res fresco, rico en hierro',
        barcode: '1234567890004',
        pricePerKg: 45.0,
        baseUnitId: kg.id,
        categories: {
          create: [
            { category: { connect: { name: 'Viscera Roja' } } },
            { category: { connect: { name: 'Cajas de Menudo' } } },
          ],
        },
        cuts: {
          create: [
            { cut: { connect: { name: 'Rodajas' } }, pricePerKg: 50.0 },
            { cut: { connect: { name: 'Cubos' } }, pricePerKg: 48.0 },
          ],
        },
      },
    }),

    // Product 5: Plastic Bags
    prisma.product.create({
      data: {
        name: 'Bolsas Plásticas Medianas',
        description: 'Bolsas plásticas medianas para empaque de carnes',
        barcode: '1234567890005',
        pricePerUnit: 0.5,
        baseUnitId: pza.id,
        categories: {
          create: [{ category: { connect: { name: 'Bolsas' } } }],
        },
      },
    }),
  ]);

  // 6️⃣ Create 5 realistic tickets
  const tickets = await Promise.all([
    // Ticket 1: Large order with premium beef
    prisma.ticket.create({
      data: {
        date: new Date('2024-01-15T10:30:00Z'),
        total: 1250.0,
        paymentType: 'Efectivo',
        userId: user1.id,
        printed: true,
        items: {
          create: [
            {
              productId: products[0].id,
              cutId: (await prisma.cut.findUnique({
                where: { name: 'Entera' },
              }))!.id,
              quantity: 2.5,
              unitPrice: 280.0,
              subtotal: 700.0,
            },
            {
              productId: products[1].id,
              cutId: (await prisma.cut.findUnique({
                where: { name: 'Filete' },
              }))!.id,
              quantity: 1.0,
              unitPrice: 140.0,
              subtotal: 140.0,
            },
            {
              productId: products[4].id,
              quantity: 20,
              unitPrice: 0.5,
              subtotal: 10.0,
            },
          ],
        },
      },
    }),

    // Ticket 2: Regular family order
    prisma.ticket.create({
      data: {
        date: new Date('2024-01-15T14:20:00Z'),
        total: 380.0,
        paymentType: 'Tarjeta',
        userId: user2.id,
        printed: true,
        items: {
          create: [
            {
              productId: products[2].id,
              cutId: (await prisma.cut.findUnique({
                where: { name: 'Entera' },
              }))!.id,
              quantity: 2.0,
              unitPrice: 95.0,
              subtotal: 190.0,
            },
            {
              productId: products[1].id,
              cutId: (await prisma.cut.findUnique({
                where: { name: 'Cubos' },
              }))!.id,
              quantity: 1.5,
              unitPrice: 130.0,
              subtotal: 195.0,
            },
          ],
        },
      },
    }),

    // Ticket 3: Organ meats order
    prisma.ticket.create({
      data: {
        date: new Date('2024-01-16T09:15:00Z'),
        total: 150.0,
        paymentType: 'Efectivo',
        userId: user1.id,
        printed: false,
        items: {
          create: [
            {
              productId: products[3].id,
              cutId: (await prisma.cut.findUnique({
                where: { name: 'Rodajas' },
              }))!.id,
              quantity: 2.0,
              unitPrice: 50.0,
              subtotal: 100.0,
            },
            {
              productId: products[4].id,
              quantity: 100,
              unitPrice: 0.5,
              subtotal: 50.0,
            },
          ],
        },
      },
    }),

    // Ticket 4: Small order
    prisma.ticket.create({
      data: {
        date: new Date('2024-01-16T16:45:00Z'),
        total: 95.0,
        paymentType: 'Efectivo',
        userId: user2.id,
        printed: true,
        items: {
          create: [
            {
              productId: products[2].id,
              cutId: (await prisma.cut.findUnique({
                where: { name: 'En Cuatro' },
              }))!.id,
              quantity: 1.0,
              unitPrice: 100.0,
              subtotal: 100.0,
            },
          ],
        },
      },
    }),

    // Ticket 5: Mixed order
    prisma.ticket.create({
      data: {
        date: new Date('2024-01-17T11:30:00Z'),
        total: 420.0,
        paymentType: 'Tarjeta',
        userId: user1.id,
        printed: true,
        items: {
          create: [
            {
              productId: products[0].id,
              cutId: (await prisma.cut.findUnique({
                where: { name: 'Rodajas' },
              }))!.id,
              quantity: 1.0,
              unitPrice: 300.0,
              subtotal: 300.0,
            },
            {
              productId: products[3].id,
              cutId: (await prisma.cut.findUnique({
                where: { name: 'Cubos' },
              }))!.id,
              quantity: 2.5,
              unitPrice: 48.0,
              subtotal: 120.0,
            },
          ],
        },
      },
    }),
  ]);

  console.log('✅ Seed completed successfully');
  console.log(
    `Created ${products.length} products and ${tickets.length} tickets`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
