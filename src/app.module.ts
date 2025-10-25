import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { TicketsModule } from './tickets/tickets.module';

@Module({
  imports: [ProductsModule, TicketsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
