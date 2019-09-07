import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from './event.entity';
import { Repository } from 'typeorm';
import {
  CreateEventRequest,
  Event as IEvent,
  UpdateEventRequest,
  GetEventResponse,
} from '../contract';
import {
  toEventEntity,
  toEventModel,
  updateEventEntityFromModel,
} from './event.mapper';
import { isNullOrUndefined } from 'util';
import { UserEvent } from './user-event.entity';
import { toUserModel } from '../user/user.mapper';

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

    // there is also findAndCount if needed for pagination
    const participants = await this.userEventRepository
      .find({
        where: { eventId },
        relations: ['user'],
        order: { created: 'DESC' },
        take: participantLimit,
      })
      .then((userEvents: UserEvent[]) =>
        userEvents.map(userEvent => toUserModel(userEvent.user)),
      );

    return new GetEventResponse(
      toEventModel(eventEntity),
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
