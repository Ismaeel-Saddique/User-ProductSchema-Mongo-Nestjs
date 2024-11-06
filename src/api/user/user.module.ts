import { forwardRef, MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PassportModules } from 'src/passport/passport.module';
import { SchemaModule } from 'src/schemas/schema.module';
import { MailServiceModule } from '../mail/mail-service.module';
import { MailService } from '../mail/mail-service.service';

@Module({
  imports: [
   SchemaModule,
   PassportModules,
   MailServiceModule
  ],
  providers: [UserService],
  controllers: [UserController],
  exports:[UserService]
})

export class UserModule {}
