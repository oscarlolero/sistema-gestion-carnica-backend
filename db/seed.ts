// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // 1️⃣ Create or reuse base units
  const kg = await prisma.unit.upsert({
    where: { name: 'Kilogramo' },
    update: {},
    create: { name: 'Kilogramo', abbreviation: 'kg' },
  });

  const pza = await prisma.unit.upsert({
    where: { name: 'Pieza' },
    update: {},
    create: { name: 'Pieza', abbreviation: 'pza' },
  });

  // 2️⃣ Create cuts
  await prisma.cut.createMany({
    data: [
      { name: 'Entera' },
      { name: 'Sacada' },
      { name: 'Rodajas' },
      { name: 'Cruz' },
      { name: 'En Cuatro' },
      { name: 'Tapa' },
    ],
    skipDuplicates: true,
  });

  // 3️⃣ Create categories
  await prisma.category.createMany({
    data: [
      { name: 'Cajas de Menudo' },
      { name: 'Viscera Blanca' },
      { name: 'Viscera Roja' },
      { name: 'Bolsas' },
    ],
    skipDuplicates: true,
  });

  // 4️⃣ Create sample product — now kg is defined ✅
  await prisma.product.create({
    data: {
      name: 'Beef Rib',
      barcode: '12345678901123',
      pricePerKg: 180.0,
      baseUnitId: kg.id, // ✅ kg exists
      categories: {
        create: [{ category: { connect: { name: 'Viscera Roja' } } }],
      },
      cuts: {
        create: [{ cut: { connect: { name: 'Entera' } } }],
      },
    },
  });

  await prisma.product.create({
    data: {
      name: 'Bolsa',
      barcode: '12345678901225',
      pricePerUnit: 5.0,
      baseUnitId: pza.id, // ✅ pza exists
      categories: {
        create: [{ category: { connect: { name: 'Bolsas' } } }],
      },
    },
  });

  console.log('✅ Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
