import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

const mockProductsService = {
  create: jest.fn(),
  findActive: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('ProductsController', () => {
  let controller: ProductsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);

    jest.clearAllMocks();
  });

  it('creates a product', async () => {
    const dto = { name: 'Ribeye' } as any;
    const created = { id: 1, ...dto };
    mockProductsService.create.mockResolvedValue(created);

    await expect(controller.create(dto)).resolves.toBe(created);
    expect(mockProductsService.create).toHaveBeenCalledWith(dto);
  });

  it('finds active products with query include', async () => {
    const products = [{ id: 1 }];
    const query = { select: 'categories,cuts' } as any;
    mockProductsService.findActive.mockResolvedValue(products);

    await expect(controller.findAll(query)).resolves.toBe(products);
    expect(mockProductsService.findActive).toHaveBeenCalledWith(
      'categories,cuts',
      1,
      10,
      undefined,
      undefined,
      undefined,
    );
  });

  it('finds a product by id', async () => {
    const product = { id: 1 };
    mockProductsService.findOne.mockResolvedValue(product);

    await expect(controller.findOne(1)).resolves.toBe(product);
    expect(mockProductsService.findOne).toHaveBeenCalledWith(1);
  });

  it('updates a product', async () => {
    const dto = { name: 'Updated' } as any;
    const updated = { id: 1, ...dto };
    mockProductsService.update.mockResolvedValue(updated);

    await expect(controller.update(1, dto)).resolves.toBe(updated);
    expect(mockProductsService.update).toHaveBeenCalledWith(1, dto);
  });

  it('removes a product', async () => {
    const removed = { id: 1 };
    mockProductsService.remove.mockResolvedValue(removed);

    await expect(controller.remove(1)).resolves.toBe(removed);
    expect(mockProductsService.remove).toHaveBeenCalledWith(1);
  });
});
