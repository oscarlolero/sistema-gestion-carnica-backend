import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const queryTicketsSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  userId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sortBy: z.enum(['date', 'createdAt', 'updatedAt', 'total']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

export class QueryTicketsDto extends createZodDto(queryTicketsSchema) {}
