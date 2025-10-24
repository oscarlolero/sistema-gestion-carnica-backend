import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const nonNegativeNumber = z.number().nonnegative();

export const createProductSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(500).nullish(),
  barcode: z.string().min(1).max(128).nullish(),
  pricePerKg: nonNegativeNumber.nullish(),
  pricePerUnit: nonNegativeNumber.nullish(),
  isActive: z.boolean().optional(),
  baseUnitId: z.number().int().positive(),
});

export class CreateProductDto extends createZodDto(createProductSchema) {}
