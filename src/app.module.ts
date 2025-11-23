import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { TicketsModule } from './tickets/tickets.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { HealthModule } from './health/health.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [ProductsModule, TicketsModule, CloudinaryModule, HealthModule, UsersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
