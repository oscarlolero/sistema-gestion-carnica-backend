import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getSetting(key: string) {
    return await this.prisma.systemSetting.findUnique({
      where: { key },
    });
  }

  async setSetting(key: string, value: string, description?: string) {
    return await this.prisma.systemSetting.upsert({
      where: { key },
      update: { value, description },
      create: { key, value, description },
    });
  }

  async getAllSettings() {
    return await this.prisma.systemSetting.findMany();
  }
}
