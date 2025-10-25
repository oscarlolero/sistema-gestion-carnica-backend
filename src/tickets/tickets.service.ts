import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

const ticketInclude = {
  items: {
    include: {
      product: true,
      cut: true,
    },
  },
  user: true,
} as const;

type TicketWithRelations = Prisma.TicketGetPayload<{
  include: typeof ticketInclude;
}>;

@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTicketDto: CreateTicketDto): Promise<TicketWithRelations> {
    return this.prisma.ticket.create({
      data: this.mapCreateData(createTicketDto),
      include: ticketInclude,
    });
  }

  async findAll(): Promise<TicketWithRelations[]> {
    return this.prisma.ticket.findMany({
      include: ticketInclude,
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: number): Promise<TicketWithRelations> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: ticketInclude,
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with id ${id} not found`);
    }

    return ticket;
  }

  async update(
    id: number,
    updateTicketDto: UpdateTicketDto,
  ): Promise<TicketWithRelations> {
    await this.ensureExists(id);

    return this.prisma.ticket.update({
      where: { id },
      data: this.mapUpdateData(updateTicketDto),
      include: ticketInclude,
    });
  }

  async remove(id: number): Promise<TicketWithRelations> {
    await this.ensureExists(id);

    return this.prisma.ticket.delete({
      where: { id },
      include: ticketInclude,
    });
  }

  private async ensureExists(id: number) {
    const exists = await this.prisma.ticket.count({ where: { id } });

    if (!exists) {
      throw new NotFoundException(`Ticket with id ${id} not found`);
    }
  }

  private mapCreateData(dto: CreateTicketDto): Prisma.TicketCreateInput {
    const data: Prisma.TicketCreateInput = {
      paymentType: dto.paymentType,
      total: this.mapDecimalInput(dto.total)!,
      items: {
        create: dto.items.map((item) => this.mapTicketItemInput(item)),
      },
    };

    if (dto.date !== undefined) {
      data.date = dto.date;
    }

    if (dto.printed !== undefined) {
      data.printed = dto.printed;
    }

    if (dto.userId !== undefined) {
      data.user = {
        connect: { id: dto.userId },
      };
    }

    return data;
  }

  private mapUpdateData(dto: UpdateTicketDto): Prisma.TicketUpdateInput {
    const data: Prisma.TicketUpdateInput = {};

    if (dto.date !== undefined) {
      data.date = dto.date;
    }

    if (dto.total !== undefined) {
      data.total = this.mapDecimalInput(dto.total);
    }

    if (dto.paymentType !== undefined) {
      data.paymentType = dto.paymentType;
    }

    if (dto.printed !== undefined) {
      data.printed = dto.printed;
    }

    if (dto.userId !== undefined) {
      data.user = { connect: { id: dto.userId } };
    }

    if (dto.items !== undefined) {
      data.items = {
        deleteMany: {},
        create: dto.items.map((item) => this.mapTicketItemInput(item)),
      };
    }

    return data;
  }

  private mapTicketItemInput(
    item: CreateTicketDto['items'][number],
  ): Prisma.TicketItemCreateWithoutTicketInput {
    return {
      product: { connect: { id: item.productId } },
      cut: item.cutId ? { connect: { id: item.cutId } } : undefined,
      quantity: this.mapDecimalInput(item.quantity)!,
      unitPrice: this.mapDecimalInput(item.unitPrice)!,
      subtotal: this.mapDecimalInput(item.subtotal)!,
    };
  }

  private mapDecimalInput(value: number | undefined) {
    if (value === undefined) {
      return undefined;
    }

    return new Prisma.Decimal(value);
  }
}
