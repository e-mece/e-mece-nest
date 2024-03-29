import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { MailSenderModule } from './mail-sender/mail-sender.module';
import { EventModule } from './event/event.module';

@Module({
  imports: [TypeOrmModule.forRoot(), UserModule, AuthModule, MailSenderModule, EventModule],
})
export class AppModule {}
