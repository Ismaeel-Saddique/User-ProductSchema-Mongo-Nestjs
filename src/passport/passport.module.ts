import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { UserModule } from 'src/api/user/user.module';
import { UserService } from 'src/api/user/user.service';
import { SchemaModule } from 'src/schemas/schema.module';

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy : 'jwt',
  }),
    JwtModule.register({
      secret: 'abc123', 
      signOptions: { expiresIn: '1d' },  
    }),
    forwardRef(() => UserModule), 
    SchemaModule
   ],
  providers: [JwtStrategy, UserService],
  exports: [ JwtModule, PassportModule]
})
export class PassportModules {}
