import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { TicketsModule } from './tickets/tickets.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';

@Module({
  imports: [ProductsModule, TicketsModule, CloudinaryModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
