import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const nonNegativeNumber = z.number().nonnegative();

const categorySchema = z.object({
  categoryId: z.number().int().positive(),
});

const cutSchema = z
  .object({
    cutId: z.number().int().positive(),
    pricePerKg: nonNegativeNumber.nullish(),
    pricePerUnit: nonNegativeNumber.nullish(),
  })
  .refine(
    (data) =>
      (data.pricePerKg !== null && data.pricePerKg !== undefined) ||
      (data.pricePerUnit !== null && data.pricePerUnit !== undefined),
    {
      message:
        'At least one price (pricePerKg or pricePerUnit) must be provided for each cut',
      path: ['pricePerKg', 'pricePerUnit'],
    },
  );

export const createProductSchema = z
  .object({
    name: z.string().min(1).max(255),
    description: z.string().max(500).nullish(),
    sku: z.string().min(1).max(128).nullish(),
    barcode: z.string().min(1).max(128).nullish(),
    pricePerKg: nonNegativeNumber.nullish(),
    pricePerUnit: nonNegativeNumber.nullish(),
    isActive: z.boolean().optional(),
    baseUnitId: z.number().int().positive(),
    categories: z.array(categorySchema).optional(),
    cuts: z.array(cutSchema).optional(),
  })
  .strict()
  .refine(
    (data) =>
      (data.pricePerKg !== null && data.pricePerKg !== undefined) ||
      (data.pricePerUnit !== null && data.pricePerUnit !== undefined),
    {
      message:
        'At least one price (pricePerKg or pricePerUnit) must be provided',
      path: ['pricePerKg', 'pricePerUnit'],
    },
  );

export class CreateProductDto extends createZodDto(createProductSchema) {}
