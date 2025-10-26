import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TicketsService } from './tickets.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TicketsService', () => {
  let service: TicketsService;
  const prismaTicket = {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  } satisfies Record<string, jest.Mock>;

  beforeEach(() => {
    jest.clearAllMocks();
    const prisma = {
      ticket: prismaTicket,
    } as unknown as PrismaService;

    service = new TicketsService(prisma);
  });

  it('creates a ticket with nested relations mapped', async () => {
    const dto = {
      paymentType: 'cash',
      total: 150,
      items: [
        {
          productId: 1,
          cutId: 2,
          quantity: 3,
          unitPrice: 50,
          subtotal: 150,
        },
      ],
      printed: true,
      userId: 7,
    } as any;

    const expected = { id: 1 } as any;
    prismaTicket.create.mockResolvedValue(expected);

    const result = await service.create(dto);

    expect(result).toBe(expected);
    expect(prismaTicket.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          total: expect.any(Prisma.Decimal),
          user: { connect: { id: dto.userId } },
          items: {
            create: [
              expect.objectContaining({
                product: { connect: { id: dto.items[0].productId } },
                cut: { connect: { id: dto.items[0].cutId } },
                unitPrice: expect.any(Prisma.Decimal),
                subtotal: expect.any(Prisma.Decimal),
              }),
            ],
          },
        }),
      }),
    );
  });

  it('returns all tickets with pagination', async () => {
    const tickets = [{ id: 1 }, { id: 2 }];
    prismaTicket.findMany.mockResolvedValue(tickets);
    prismaTicket.count.mockResolvedValue(2);

    const result = await service.findAll();

    expect(result.data).toBe(tickets);
    expect(result.pagination).toEqual({
      page: 1,
      limit: 10,
      total: 2,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    });
    expect(prismaTicket.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { date: 'desc' } }),
    );
  });

  it('throws when ticket is not found on findOne', async () => {
    prismaTicket.findUnique.mockResolvedValue(null);

    await expect(service.findOne(99)).rejects.toBeInstanceOf(NotFoundException);
    expect(prismaTicket.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 99 } }),
    );
  });

  it('updates ticket after ensuring it exists', async () => {
    const dto = { paymentType: 'card' } as any;
    const updated = { id: 1, paymentType: dto.paymentType } as any;

    prismaTicket.count.mockResolvedValue(1);
    prismaTicket.update.mockResolvedValue(updated);

    const result = await service.update(1, dto);

    expect(result).toBe(updated);
    expect(prismaTicket.count).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(prismaTicket.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 1 },
        data: expect.objectContaining({ paymentType: dto.paymentType }),
      }),
    );
  });

  it('removes ticket after ensuring it exists', async () => {
    const removed = { id: 1 } as any;
    prismaTicket.count.mockResolvedValue(1);
    prismaTicket.delete.mockResolvedValue(removed);

    const result = await service.remove(1);

    expect(result).toBe(removed);
    expect(prismaTicket.count).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(prismaTicket.delete).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 1 } }),
    );
  });
});
