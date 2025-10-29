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

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    userId?: number,
    startDate?: string,
    endDate?: string,
    sortBy?: 'date' | 'createdAt' | 'updatedAt' | 'total',
    order?: 'asc' | 'desc',
  ): Promise<{
    data: TicketWithRelations[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const skip = (page - 1) * limit;

    const whereClause: Prisma.TicketWhereInput = {};

    if (search && search.trim()) {
      whereClause.OR = [
        { paymentType: { contains: search.trim(), mode: 'insensitive' } },
        {
          items: {
            some: {
              product: {
                name: { contains: search.trim(), mode: 'insensitive' },
              },
            },
          },
        },
      ];
    }

    if (userId !== undefined) {
      whereClause.userId = userId;
    }

    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) {
        whereClause.date.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.date.lte = new Date(endDate);
      }
    }

    const orderByField = sortBy || 'date';
    const orderDirection = order || 'desc';
    const orderBy: Prisma.TicketOrderByWithRelationInput = {
      [orderByField]: orderDirection,
    };

    const [data, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where: whereClause,
        include: ticketInclude,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.ticket.count({
        where: whereClause,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
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
      unit: item.unit,
    };
  }

  private mapDecimalInput(value: number | undefined) {
    if (value === undefined) {
      return undefined;
    }

    return new Prisma.Decimal(value);
  }

  async getDailySummary(date?: string): Promise<{
    date: string;
    totalSales: number;
    totalTickets: number;
    items: Array<{
      productName: string;
      cutName: string | null;
      quantity: number;
      unit: string;
      totalAmount: number;
    }>;
  }> {
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const tickets = await this.prisma.ticket.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: ticketInclude,
    });

    const totalSales = tickets.reduce(
      (sum, ticket) => sum + Number(ticket.total),
      0,
    );
    const totalTickets = tickets.length;

    // Aggregate items by product and cut
    const itemsMap = new Map<
      string,
      {
        productName: string;
        cutName: string | null;
        quantity: number;
        unit: string;
        totalAmount: number;
      }
    >();

    tickets.forEach((ticket) => {
      ticket.items.forEach((item) => {
        const unit: string = item.unit || 'kg';
        const key = `${item.productId}-${item.cutId || 'null'}-${unit}`;
        const existing = itemsMap.get(key);

        if (existing) {
          existing.quantity += Number(item.quantity);
          existing.totalAmount += Number(item.subtotal);
        } else {
          itemsMap.set(key, {
            productName: item.product.name,
            cutName: item.cut?.name || null,
            quantity: Number(item.quantity),
            unit,
            totalAmount: Number(item.subtotal),
          });
        }
      });
    });

    const items = Array.from(itemsMap.values()).sort(
      (a, b) => b.totalAmount - a.totalAmount,
    );

    return {
      date: targetDate.toISOString(),
      totalSales,
      totalTickets,
      items,
    };
  }
}
