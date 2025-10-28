import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Product, Cut } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllCuts(): Promise<Cut[]> {
    return this.prisma.cut.findMany();
  }

  async findAllCategories() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    return this.prisma.product.create({
      data: {
        ...this.mapCreateData(createProductDto),
        categories: createProductDto.categories
          ? {
              create: createProductDto.categories.map((cat) => ({
                categoryId: cat.categoryId,
              })),
            }
          : undefined,
        cuts: createProductDto.cuts
          ? {
              create: createProductDto.cuts.map((cut) => ({
                cutId: cut.cutId,
                pricePerKg: this.mapDecimalInput(cut.pricePerKg),
                pricePerUnit: this.mapDecimalInput(cut.pricePerUnit),
              })),
            }
          : undefined,
      },
    });
  }

  async findAll(): Promise<Product[]> {
    return this.prisma.product.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findActive(
    select?: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    sortBy?: 'createdAt' | 'updatedAt' | 'name' | 'isActive',
    order?: 'asc' | 'desc',
  ): Promise<{
    data: Product[];
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

    // Build include options based on select parameter
    const includeOptions: Prisma.ProductInclude = {};

    if (select) {
      const selectArray = select.split(',').map((item) => item.trim());

      if (selectArray.includes('categories')) {
        includeOptions.categories = {
          select: {
            categoryId: true,
          },
        };
      }

      if (selectArray.includes('cuts')) {
        includeOptions.cuts = {
          select: {
            cutId: true,
            pricePerKg: true,
            pricePerUnit: true,
            cut: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        };
      }
    }

    // Build where clause with search functionality
    const whereClause: Prisma.ProductWhereInput = {
      isActive: true,
    };

    if (search && search.trim()) {
      whereClause.OR = [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { sku: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    // Build orderBy clause
    const orderByField = sortBy || 'name';
    const orderDirection = order || 'asc';
    const orderBy: Prisma.ProductOrderByWithRelationInput = {
      [orderByField]: orderDirection,
    };

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where: whereClause,
        include: includeOptions,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.product.count({
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

  async findOne(id: number): Promise<Product> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        sku: true,
        barcode: true,
        imageUrl: true,
        pricePerKg: true,
        pricePerUnit: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        categories: {
          select: {
            categoryId: true,
          },
        },
        cuts: {
          select: {
            cutId: true,
            pricePerKg: true,
            pricePerUnit: true,
            cut: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    return product;
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    await this.ensureExists(id);

    return this.prisma.product.update({
      where: { id },
      data: {
        ...this.mapUpdateData(updateProductDto),
        categories: updateProductDto.categories
          ? {
              deleteMany: {},
              create: updateProductDto.categories.map((cat) => ({
                categoryId: cat.categoryId,
              })),
            }
          : undefined,
        cuts: updateProductDto.cuts
          ? {
              deleteMany: {},
              create: updateProductDto.cuts.map((cut) => ({
                cutId: cut.cutId,
                pricePerKg: this.mapDecimalInput(cut.pricePerKg),
                pricePerUnit: this.mapDecimalInput(cut.pricePerUnit),
              })),
            }
          : undefined,
      },
    });
  }

  async remove(id: number): Promise<Product> {
    await this.ensureExists(id);

    return this.prisma.product.delete({
      where: { id },
    });
  }

  private async ensureExists(id: number) {
    const exists = await this.prisma.product.count({ where: { id } });

    if (!exists) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
  }

  private mapCreateData(
    dto: CreateProductDto,
  ): Prisma.ProductUncheckedCreateInput {
    const data: Prisma.ProductUncheckedCreateInput = {
      name: dto.name,
    };

    if (dto.description !== undefined) {
      data.description = dto.description ?? null;
    }

    if (dto.sku !== undefined) {
      data.sku = dto.sku ?? null;
    }

    if (dto.barcode !== undefined) {
      data.barcode = dto.barcode ?? null;
    }

    if (dto.imageUrl !== undefined) {
      data.imageUrl = dto.imageUrl ?? null;
    }

    if (dto.isActive !== undefined) {
      data.isActive = dto.isActive;
    }

    const pricePerKg = this.mapDecimalInput(dto.pricePerKg);
    if (pricePerKg !== undefined) {
      data.pricePerKg = pricePerKg;
    }

    const pricePerUnit = this.mapDecimalInput(dto.pricePerUnit);
    if (pricePerUnit !== undefined) {
      data.pricePerUnit = pricePerUnit;
    }

    return data;
  }

  private mapUpdateData(
    dto: UpdateProductDto,
  ): Prisma.ProductUncheckedUpdateInput {
    const data: Prisma.ProductUncheckedUpdateInput = {};

    if (dto.name !== undefined) {
      data.name = dto.name;
    }

    if (dto.description !== undefined) {
      data.description = dto.description ?? null;
    }

    if (dto.sku !== undefined) {
      data.sku = dto.sku ?? null;
    }

    if (dto.barcode !== undefined) {
      data.barcode = dto.barcode ?? null;
    }

    if (dto.imageUrl !== undefined) {
      data.imageUrl = dto.imageUrl ?? null;
    }

    if (dto.isActive !== undefined) {
      data.isActive = dto.isActive;
    }

    const pricePerKg = this.mapDecimalInput(dto.pricePerKg);
    if (pricePerKg !== undefined) {
      data.pricePerKg = pricePerKg;
    }

    const pricePerUnit = this.mapDecimalInput(dto.pricePerUnit);
    if (pricePerUnit !== undefined) {
      data.pricePerUnit = pricePerUnit;
    }

    return data;
  }

  private mapDecimalInput(value: number | null | undefined) {
    if (value === undefined) {
      return undefined;
    }

    if (value === null || value === 0) {
      return null;
    }

    return new Prisma.Decimal(value);
  }
}
