import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const decimalSchema = z.number().nonnegative();

const ticketItemSchema = z
  .object({
    productId: z.number().int().positive(),
    cutId: z.number().int().positive().optional(),
    quantity: z.number().positive(),
    unitPrice: decimalSchema,
    subtotal: decimalSchema,
    unit: z.enum(['kg', 'pz']),
  })
  .strict();

export const createTicketSchema = z
  .object({
    date: z.coerce.date().optional(),
    total: decimalSchema,
    paymentType: z.string().min(1).max(100),
    userId: z.number().int().positive().optional(),
    clientId: z.number().int().positive().optional(),
    printed: z.boolean().optional(),
    items: z.array(ticketItemSchema).min(1),
  })
  .strict();

export class CreateTicketDto extends createZodDto(createTicketSchema) {}
