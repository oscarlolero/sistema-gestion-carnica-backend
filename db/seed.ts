// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // 1️⃣ Create only required cuts
  await prisma.cut.createMany({
    data: [
      { name: 'Por Mitad', description: 'Dividido por la mitad' },
      { name: 'En Cuatro', description: 'Dividido en cuatro partes' },
      { name: 'Rodajas', description: 'Cortado en rodajas delgadas' },
      { name: 'Cruz', description: 'Corte transversal' },
      { name: 'Sacada', description: 'Tripa sacada' },
      { name: 'Sin Tapa', description: 'Corte de cabeza sin tapa' },
    ],
    skipDuplicates: true,
  });

  // 2️⃣ Create only required categories
  await prisma.category.createMany({
    data: [
      { name: 'Cajas de Menudo', description: 'Productos de menudencia' },
      { name: 'Viscera Blanca', description: 'Vísceras blancas del animal' },
      { name: 'Viscera Roja', description: 'Vísceras rojas del animal' },
    ],
    skipDuplicates: true,
  });

  // 3️⃣ Create products for Cajas de Menudo
  await prisma.product.createMany({
    data: [
      {
        name: 'Menudo National',
        description: 'Caja de menudo National',
        pricePerKg: 60,
      },
      {
        name: 'Menudo Excel',
        description: 'Caja de menudo Excel',
        pricePerKg: 62,
      },
      {
        name: 'Menudo Washington',
        description: 'Caja de menudo Washington',
        pricePerKg: 65,
      },
      {
        name: 'Menudo Canadian',
        description: 'Caja de menudo Canadian',
        pricePerKg: 65,
      },
    ],
    skipDuplicates: true,
  });

  const cajas = await prisma.category.findUnique({
    where: { name: 'Cajas de Menudo' },
  });
  const visceraBlanca = await prisma.category.findUnique({
    where: { name: 'Viscera Blanca' },
  });
  const visceraRoja = await prisma.category.findUnique({
    where: { name: 'Viscera Roja' },
  });

  // Link Cajas de Menudo products to category and cuts (Por Mitad, En Cuatro)
  const mitadCut = await prisma.cut.findUnique({
    where: { name: 'Por Mitad' },
  });
  const cuatroCut = await prisma.cut.findUnique({
    where: { name: 'En Cuatro' },
  });

  const cajasProducts = await prisma.product.findMany({
    where: {
      name: {
        in: [
          'Menudo National',
          'Menudo Excel',
          'Menudo Washington',
          'Menudo Canadian',
        ],
      },
    },
  });

  for (const p of cajasProducts) {
    const base = Number(p.pricePerKg != null ? Number(p.pricePerKg) : 60);
    await prisma.product.update({
      where: { id: p.id },
      data: {
        categories: cajas
          ? { create: [{ category: { connect: { name: 'Cajas de Menudo' } } }] }
          : undefined,
        cuts: {
          create: [
            { cutId: mitadCut!.id, pricePerKg: base },
            { cutId: cuatroCut!.id, pricePerKg: base + 2 },
          ],
        },
      },
    });
  }

  // 4️⃣ Create products for Viscera Blanca
  await prisma.product.createMany({
    data: [
      {
        name: 'Panza',
        description: 'Panza',
        pricePerKg: 50,
      },
      {
        name: 'Libro',
        description: 'Libro',
        pricePerKg: 52,
      },
      {
        name: 'Pata morena',
        description: 'Pata morena',
        pricePerKg: 40,
      },
      {
        name: 'Pata blanca',
        description: 'Pata blanca',
        pricePerKg: 42,
      },
      {
        name: 'Tripa',
        description: 'Tripa',
        pricePerKg: 55,
      },
      {
        name: 'Tripa de rastro',
        description: 'Tripa de rastro',
        pricePerKg: 54,
      },
      {
        name: 'Quajo',
        description: 'Quajo',
        pricePerKg: 48,
      },
      {
        name: 'Teleco',
        description: 'Teleco (blanca)',
        pricePerKg: 46,
      },
    ],
    skipDuplicates: true,
  });

  const rodajasCut = await prisma.cut.findUnique({
    where: { name: 'Rodajas' },
  });
  const cruzCut = await prisma.cut.findUnique({
    where: { name: 'Cruz' },
  });
  const sacadaCut = await prisma.cut.findUnique({
    where: { name: 'Sacada' },
  });

  const patasYTripas = await prisma.product.findMany({
    where: {
      name: { in: ['Pata morena', 'Pata blanca', 'Tripa', 'Tripa de rastro'] },
    },
  });

  for (const p of patasYTripas) {
    const base = Number(p.pricePerKg != null ? Number(p.pricePerKg) : 0);
    const cutsToCreate = p.name.includes('Pata')
      ? [
          { cutId: rodajasCut!.id, pricePerKg: base + 2 },
          { cutId: cruzCut!.id, pricePerKg: base + 2 },
        ]
      : [{ cutId: sacadaCut!.id, pricePerKg: base + 3 }];

    await prisma.product.update({
      where: { id: p.id },
      data: {
        categories: visceraBlanca
          ? { create: [{ category: { connect: { name: 'Viscera Blanca' } } }] }
          : undefined,
        cuts: { create: cutsToCreate },
      },
    });
  }

  // Link the rest of Viscera Blanca products to category (without cuts)
  const vbRest = await prisma.product.findMany({
    where: { name: { in: ['Panza', 'Libro', 'Quajo', 'Teleco'] } },
  });
  for (const p of vbRest) {
    await prisma.product.update({
      where: { id: p.id },
      data: {
        categories: visceraBlanca
          ? { create: [{ category: { connect: { name: 'Viscera Blanca' } } }] }
          : undefined,
      },
    });
  }

  // 5️⃣ Create products for Viscera Roja
  await prisma.product.createMany({
    data: [
      {
        name: 'Cabeza',
        description: 'Cabeza de res',
        pricePerKg: 58,
      },
      {
        name: 'Cabeza de rastro',
        description: 'Cabeza de rastro',
        pricePerKg: 56,
      },
      {
        name: 'Cabeza sin lengua',
        description: 'Cabeza sin lengua',
        pricePerKg: 55,
      },
      {
        name: 'Higado',
        description: 'Hígado',
        pricePerKg: 48,
      },
      {
        name: 'Corazon',
        description: 'Corazón',
        pricePerKg: 52,
      },
      {
        name: 'Lengua',
        description: 'Lengua',
        pricePerKg: 90,
      },
      {
        name: 'Bofe',
        description: 'Bofe',
        pricePerKg: 35,
      },
      {
        name: 'Teleco',
        description: 'Teleco (roja)',
        pricePerKg: 46,
      },
    ],
    skipDuplicates: true,
  });

  const sinTapaCut = await prisma.cut.findUnique({
    where: { name: 'Sin Tapa' },
  });

  const cabezas = await prisma.product.findMany({
    where: {
      name: { in: ['Cabeza', 'Cabeza de rastro', 'Cabeza sin lengua'] },
    },
  });

  for (const p of cabezas) {
    await prisma.product.update({
      where: { id: p.id },
      data: {
        categories: visceraRoja
          ? { create: [{ category: { connect: { name: 'Viscera Roja' } } }] }
          : undefined,
        cuts: {
          create: [
            {
              cutId: cuatroCut!.id,
              pricePerKg:
                (p.pricePerKg != null ? Number(p.pricePerKg) : 56) + 2,
            },
            {
              cutId: sinTapaCut!.id,
              pricePerKg:
                (p.pricePerKg != null ? Number(p.pricePerKg) : 56) + 3,
            },
          ],
        },
      },
    });
  }

  // Link the rest of Viscera Roja products to category (without cuts)
  const vrRest = await prisma.product.findMany({
    where: { name: { in: ['Higado', 'Corazon', 'Lengua', 'Bofe', 'Teleco'] } },
  });
  for (const p of vrRest) {
    await prisma.product.update({
      where: { id: p.id },
      data: {
        categories: visceraRoja
          ? { create: [{ category: { connect: { name: 'Viscera Roja' } } }] }
          : undefined,
      },
    });
  }

  console.log(
    '✅ Seed completed successfully (categorías, productos y cortes especificados)',
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
