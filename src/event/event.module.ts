import { Module } from '@nestjs/common';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './event.entity';
import { UserEvent } from './user-event.entity';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, UserEvent]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [EventController],
  providers: [EventService],
})
export class EventModule {}
