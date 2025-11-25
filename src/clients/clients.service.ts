import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { name: string }) {
    return this.prisma.client.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.client.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }
}
