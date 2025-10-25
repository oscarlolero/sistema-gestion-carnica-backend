import { Test, TestingModule } from '@nestjs/testing';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';

const mockTicketsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('TicketsController', () => {
  let controller: TicketsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketsController],
      providers: [
        {
          provide: TicketsService,
          useValue: mockTicketsService,
        },
      ],
    }).compile();

    controller = module.get<TicketsController>(TicketsController);

    jest.clearAllMocks();
  });

  it('creates a ticket', async () => {
    const dto = { total: 10 } as any;
    const created = { id: 1 };
    mockTicketsService.create.mockResolvedValue(created);

    await expect(controller.create(dto)).resolves.toBe(created);
    expect(mockTicketsService.create).toHaveBeenCalledWith(dto);
  });

  it('returns all tickets', async () => {
    const tickets = [{ id: 1 }];
    mockTicketsService.findAll.mockResolvedValue(tickets);

    await expect(controller.findAll()).resolves.toBe(tickets);
    expect(mockTicketsService.findAll).toHaveBeenCalledWith();
  });

  it('returns a ticket by id', async () => {
    const ticket = { id: 1 };
    mockTicketsService.findOne.mockResolvedValue(ticket);

    await expect(controller.findOne(1)).resolves.toBe(ticket);
    expect(mockTicketsService.findOne).toHaveBeenCalledWith(1);
  });

  it('updates a ticket', async () => {
    const dto = { total: 15 } as any;
    const updated = { id: 1, total: 15 };
    mockTicketsService.update.mockResolvedValue(updated);

    await expect(controller.update(1, dto)).resolves.toBe(updated);
    expect(mockTicketsService.update).toHaveBeenCalledWith(1, dto);
  });

  it('removes a ticket', async () => {
    const removed = { id: 1 };
    mockTicketsService.remove.mockResolvedValue(removed);

    await expect(controller.remove(1)).resolves.toBe(removed);
    expect(mockTicketsService.remove).toHaveBeenCalledWith(1);
  });
});
