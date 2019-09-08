import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from './event.entity';
import { Repository, getConnection } from 'typeorm';
import {
  CreateEventRequest,
  Event as IEvent,
  UpdateEventRequest,
  GetEventResponse,
  GetCityLeaderboardResponse,
  CityLeader,
  GetEventsResponse,
} from '../contract';
import {
  toEventEntity,
  toEventModel,
  updateEventEntityFromModel,
} from './event.mapper';
import { isNullOrUndefined } from 'util';
import { UserEvent } from './user-event.entity';
import { toUserModel } from '../user/user.mapper';
import { PaginationOptionsInterface } from '../paginate';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(UserEvent)
    private readonly userEventRepository: Repository<UserEvent>,
  ) {}

  public async getEventWithNParticipantsAndCreator(
    eventId: number,
    participantLimit: number,
  ): Promise<GetEventResponse> {
    const eventEntity = await this.eventRepository.findOne(eventId, {
      relations: ['creator'],
    });

    if (isNullOrUndefined(eventEntity)) {
      throw new NotFoundException();
    }

    let count = 0;
    const participants = await this.userEventRepository
      .findAndCount({
        where: { eventId },
        relations: ['user'],
        order: { created: 'DESC' },
        take: participantLimit,
      })
      .then((userEvents: [UserEvent[], number]) => {
        count = userEvents[1];
        return userEvents[0].map(userEvent => toUserModel(userEvent.user));
      });

    const eventModel = toEventModel(eventEntity);
    eventModel.participantCount = count;

    return new GetEventResponse(
      eventModel,
      toUserModel(eventEntity.creator),
      participants,
    );
  }

  public async updateEvent(
    updateEventRequest: UpdateEventRequest,
    userId: number,
  ): Promise<void> {
    const eventEntity = await this.eventRepository.findOne(
      updateEventRequest.event.id,
    );

    if (isNullOrUndefined(eventEntity)) {
      throw new NotFoundException();
    }

    if (eventEntity.creatorId !== userId) {
      throw new UnauthorizedException();
    }

    updateEventEntityFromModel(eventEntity, updateEventRequest.event);
    // TODO: validate
    try {
      await this.eventRepository.update(eventEntity.id, eventEntity);
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  public async enrollToEvent(eventId: number, userId: number): Promise<void> {
    const userEvent = new UserEvent();
    userEvent.userId = userId;
    userEvent.eventId = eventId;
    try {
      await this.userEventRepository.insert(userEvent);
    } catch (err) {
      throw new ConflictException();
    }
  }

  public async approveEventParticipation(
    eventId: number,
    creatorId: number,
    userId: number,
  ): Promise<void> {
    const eventEntity = await this.eventRepository.findOne(eventId);
    if (isNullOrUndefined(eventEntity)) {
      throw new NotFoundException();
    }
    if (eventEntity.creatorId !== creatorId) {
      throw new UnauthorizedException();
    }

    // check date
    const oneHourBeforeStart = new Date(eventEntity.startDate.getDate());
    oneHourBeforeStart.setHours(oneHourBeforeStart.getHours() - 1);

    const oneHourAfterEnd = new Date(eventEntity.endDate.getDate());
    oneHourAfterEnd.setHours(oneHourAfterEnd.getHours() + 1);

    const currentTime = new Date();

    if (oneHourBeforeStart < currentTime && currentTime < oneHourAfterEnd) {
      const userEventEntity = await this.userEventRepository.findOne({
        userId,
        eventId,
      });

      if (isNullOrUndefined(userEventEntity)) {
        throw new NotFoundException();
      }

      userEventEntity.approved = true;

      try {
        await this.userEventRepository.update(
          { userId, eventId },
          userEventEntity,
        );
      } catch (err) {
        throw new InternalServerErrorException();
      }
    } else {
      throw new ForbiddenException();
    }
  }

  async paginate(
    options: PaginationOptionsInterface,
  ): Promise<GetEventsResponse> {
    const [results, total] = await this.eventRepository.findAndCount({
      where: {
        approved: true,
        isCancelled: false,
        startDate: date => date > new Date(),
      },
      take: options.limit,
      skip: options.page, // think this needs to be page * limit
      order: { startDate: 'ASC' },
    });

    const eventModels = results.map(eE => toEventModel(eE));

    const result = new GetEventsResponse(eventModels);

    result.total = total;
    result.pageTotal = Math.floor(total / options.limit);

    return result;
  }

  public async createEvent(
    createEventRequest: CreateEventRequest,
    userId: number,
    isApproved: boolean,
  ): Promise<IEvent> {
    const newEvent = toEventEntity(createEventRequest.event);
    newEvent.creatorId = userId;
    newEvent.approved = isApproved;
    if (isApproved) {
      newEvent.approverId = userId;
    }
    try {
      await this.eventRepository.insert(newEvent);
      return toEventModel(newEvent);
    } catch (err) {
      // TODO: err also returns pwd hash :)
      throw new BadRequestException(err);
    }
  }

  public async getTopNCities(
    limit: number,
  ): Promise<GetCityLeaderboardResponse> {
    let creationPoints: Array<{ city: string; spts: number }> = null;

    creationPoints = await getConnection()
      .createEntityManager()
      .query(
        // tslint:disable-next-line: max-line-length
        `SELECT city, sum(pts) as spts FROM (SELECT e.city as city, 2 * SUM(e.point) as pts FROM event e WHERE e.approved = TRUE GROUP BY city UNION SELECT e.city as city, SUM(e.point) AS pts FROM event e, \`user-event\` ue WHERE e.id=ue.eventId and ue.approved = TRUE GROUP BY city ) as tbl  GROUP BY city HAVING spts IS NOT NULL ORDER BY spts DESC LIMIT ${limit};`,
      );

    return new GetCityLeaderboardResponse(
      creationPoints.map(cP => new CityLeader(cP.city, cP.spts)),
    );
  }

  public async cancelEvent(eventId: number, userId: number) {
    const eventEntity = await this.eventRepository.findOne(eventId);
    if (isNullOrUndefined(eventEntity)) {
      throw new NotFoundException();
    }
    if (eventEntity.creatorId !== userId) {
      throw new UnauthorizedException();
    }
    eventEntity.isCancelled = true;
    try {
      await this.eventRepository.update(eventId, eventEntity);
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }
}
