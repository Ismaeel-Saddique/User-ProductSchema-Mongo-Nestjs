import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { SchemaModule } from 'src/schemas/schema.module';
import { MailServiceModule } from '../mail/mail-service.module';

@Module({
  imports: [SchemaModule, MailServiceModule],
  controllers: [ProductController],
  providers: [ProductService]
})
export class ProductModule {}
