import { forwardRef, MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PassportModules } from 'src/passport/passport.module';
import { SchemaModule } from 'src/schemas/schema.module';

@Module({
  imports: [
   SchemaModule,
   PassportModules
  ],
  providers: [UserService],
  controllers: [UserController],
  exports:[UserService]
})

export class UserModule {}
