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
  Query,
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
  GetCityLeaderboardResponse,
  GetEventsResponse,
} from '../contract';
import { ApiUseTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiUseTags('event')
@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get('geo/:lat/:long')
  @HttpCode(HttpStatus.OK)
  async getClosestEvents(
    @Param('lat', ParseIntPipe) lat: number,
    @Param('long', ParseIntPipe) long: number,
  ): Promise<GetEventsResponse> {
    return await this.eventService.getClosestNEvents(lat, long, 5);
  }

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
  @Post(':id/enroll')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard())
  async enrollToEvent(
    @Param('id', ParseIntPipe) id: number,
    @Usr() user: User,
  ): Promise<void> {
    await this.eventService.enrollToEvent(id, user.id);
  }

  @ApiBearerAuth()
  @Post(':id/approve/:userId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard())
  async approveEventParticipation(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Usr() user: User,
  ): Promise<void> {
    await this.eventService.approveEventParticipation(id, user.id, userId);
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

  @Get()
  @HttpCode(HttpStatus.OK)
  async getEventsHomePage(
    @Query('limit') limit: string,
    @Query('page') page: string,
  ): Promise<GetEventsResponse> {
    limit = limit || '10';
    page = page || '0';
    return await this.eventService.paginate({
      limit: parseInt(limit, 10),
      page: parseInt(page, 10),
    });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getEventWithParticipants(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<GetEventResponse> {
    return await this.eventService.getEventWithNParticipantsAndCreator(id, 3);
  }

  @Get('leaderboard/city')
  @HttpCode(HttpStatus.OK)
  async getCitywiseLeaderBoard(): Promise<GetCityLeaderboardResponse> {
    return await this.eventService.getTopNCities(20);
  }
}
