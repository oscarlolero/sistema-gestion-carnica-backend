import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createUserSchema = z
  .object({
    name: z.string().min(1).max(100),
  })
  .strict();

export class CreateUserDto extends createZodDto(createUserSchema) {}
