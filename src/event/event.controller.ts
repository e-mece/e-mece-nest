import {
  Controller,
  HttpCode,
  Post,
  UseGuards,
  Body,
  Put,
  Param,
  ParseIntPipe,
  UnauthorizedException,
  Delete,
  Get,
  HttpStatus,
} from '@nestjs/common';
import { EventService } from './event.service';
import { AuthGuard } from '@nestjs/passport';
import { Usr } from '../user/user.decorator';
import { User } from '../user/user.entity';
import {
  CreateEventRequest,
  CreateEventResponse,
  UserType,
  UpdateEventRequest,
  GetEventResponse,
} from '../contract';
import { ApiUseTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiUseTags('event')
@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @ApiBearerAuth()
  @Post()
  @HttpCode(HttpStatus.CREATED)
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

  @ApiBearerAuth()
  @Post('enroll/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard())
  async enrollToEvent(
    @Param('id', ParseIntPipe) id: number,
    @Usr() user: User,
  ): Promise<void> {
    await this.eventService.enrollToEvent(id, user.id);
  }

  @ApiBearerAuth()
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard())
  async updateEvent(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRequest: UpdateEventRequest,
    @Usr() user: User,
  ): Promise<void> {
    if (id !== updateRequest.event.id) {
      throw new UnauthorizedException();
    }
    await this.eventService.updateEvent(updateRequest, user.id);
  }

  @ApiBearerAuth()
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard())
  async cancelEvent(
    @Param('id', ParseIntPipe) id: number,
    @Usr() user: User,
  ): Promise<void> {
    await this.eventService.cancelEvent(id, user.id);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getEventWithParticipants(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<GetEventResponse> {
    return await this.eventService.getEventWithNParticipantsAndCreator(id, 3);
  }
}
