import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ProductsService', () => {
  let service: ProductsService;
  const prismaProduct = {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  } satisfies Record<string, jest.Mock>;

  beforeEach(() => {
    jest.clearAllMocks();
    const prisma = {
      product: prismaProduct,
    } as unknown as PrismaService;

    service = new ProductsService(prisma);
  });

  it('creates a product with mapped nested relations', async () => {
    const dto = {
      name: 'Ribeye',
      pricePerKg: 250,
      pricePerUnit: null,
      categories: [{ categoryId: 10 }],
      cuts: [
        {
          cutId: 5,
          pricePerKg: 300,
          pricePerUnit: undefined,
        },
      ],
    } as any;

    const expected = { id: 1, name: dto.name } as any;
    prismaProduct.create.mockResolvedValue(expected);

    const result = await service.create(dto);

    expect(result).toBe(expected);
    expect(prismaProduct.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: dto.name,
          pricePerKg: expect.any(Prisma.Decimal),
          categories: {
            create: [{ categoryId: dto.categories[0].categoryId }],
          },
          cuts: {
            create: [
              expect.objectContaining({
                cutId: dto.cuts[0].cutId,
                pricePerKg: expect.any(Prisma.Decimal),
              }),
            ],
          },
        }),
      }),
    );
  });

  it('throws when product is not found on findOne', async () => {
    prismaProduct.findUnique.mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(prismaProduct.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 999 } }),
    );
  });

  it('updates a product after ensuring it exists', async () => {
    const dto = { name: 'Updated' } as any;
    const updatedProduct = { id: 1, name: dto.name } as any;

    prismaProduct.count.mockResolvedValue(1);
    prismaProduct.update.mockResolvedValue(updatedProduct);

    const result = await service.update(1, dto);

    expect(result).toBe(updatedProduct);
    expect(prismaProduct.count).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(prismaProduct.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 1 },
        data: expect.objectContaining({ name: dto.name }),
      }),
    );
  });
});
