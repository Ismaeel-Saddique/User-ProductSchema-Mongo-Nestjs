import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './api/user/user.module';
import { PassportModules } from './passport/passport.module';
import { ProductModule } from './api/product/product.module';
import { SchemaModule } from './schemas/schema.module';
import { MailServiceModule } from './api/mail/mail-service.module';
import { MailService } from './api/mail/mail-service.service';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/nest'),
    UserModule,
    PassportModules,
    ProductModule,
    SchemaModule,
    MailServiceModule
  ],
  controllers: [AppController],
  providers: [AppService, MailService],
})
export class AppModule {}
