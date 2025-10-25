import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Product } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

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
      orderBy: { createdAt: 'desc' },
    });
  }

  async findActive(include?: string): Promise<Product[]> {
    const includeOptions: Prisma.ProductInclude = {};

    if (include) {
      const includeArray = include.split(',').map((item) => item.trim());

      if (includeArray.includes('categories')) {
        includeOptions.categories = {
          include: {
            category: true,
          },
        };
      }

      if (includeArray.includes('cuts')) {
        includeOptions.cuts = {
          include: {
            cut: true,
          },
        };
      }
    }

    return this.prisma.product.findMany({
      where: {
        isActive: true,
      },
      include: includeOptions,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        cuts: {
          include: {
            cut: true,
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
      baseUnitId: dto.baseUnitId,
    };

    if (dto.description !== undefined) {
      data.description = dto.description ?? null;
    }

    if (dto.barcode !== undefined) {
      data.barcode = dto.barcode ?? null;
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

    if (dto.barcode !== undefined) {
      data.barcode = dto.barcode ?? null;
    }

    if (dto.baseUnitId !== undefined) {
      data.baseUnitId = dto.baseUnitId;
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

    if (value === null) {
      return null;
    }

    return new Prisma.Decimal(value);
  }
}
