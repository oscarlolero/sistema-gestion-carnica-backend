import { createZodDto } from 'nestjs-zod';
import { createTicketSchema } from './create-ticket.dto';

export const updateTicketSchema = createTicketSchema.partial();

export class UpdateTicketDto extends createZodDto(updateTicketSchema) {}
