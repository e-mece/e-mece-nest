import { Controller, HttpCode, Post, UseGuards, Body } from '@nestjs/common';
import { EventService } from './event.service';
import { AuthGuard } from '@nestjs/passport';
import { Usr } from '../user/user.decorator';
import { User } from '../user/user.entity';
import { CreateEventRequest, CreateEventResponse, UserType } from '../contract';
import { ApiUseTags } from '@nestjs/swagger';

@ApiUseTags('auth')
@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @HttpCode(201)
  @UseGuards(AuthGuard())
  async createEvent(
    @Body() createRequest: CreateEventRequest,
    @Usr() user: User,
  ): Promise<CreateEventResponse> {
    return new CreateEventResponse(
      await this.eventService.createEvent(
        createRequest,
        user.id,
        user.type === UserType.Organizator,
      ),
    );
  }
}
