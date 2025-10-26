import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const queryProductsSchema = z.object({
  select: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'name', 'isActive']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

export class QueryProductsDto extends createZodDto(queryProductsSchema) {}
