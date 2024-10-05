import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { SchemaModule } from 'src/schemas/schema.module';

@Module({
  imports: [SchemaModule],
  controllers: [ProductController],
  providers: [ProductService]
})
export class ProductModule {}
