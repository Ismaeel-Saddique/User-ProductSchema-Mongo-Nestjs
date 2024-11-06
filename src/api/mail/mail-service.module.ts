import { Module } from '@nestjs/common';
import { MailService } from './mail-service.service';

@Module({
  providers: [MailService],
  exports: [MailService]
})
export class MailServiceModule {}
