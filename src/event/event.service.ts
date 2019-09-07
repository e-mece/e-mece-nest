import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from './event.entity';
import { Repository } from 'typeorm';
import {
  CreateEventRequest,
  Event as IEvent,
  UpdateEventRequest,
} from '../contract';
import {
  toEventEntity,
  toEventModel,
  updateEventEntityFromModel,
} from './event.mapper';
import { isNullOrUndefined } from 'util';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

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
      this.eventRepository.insert(newEvent);
      return toEventModel(newEvent);
    } catch (err) {
      // TODO: err also returns pwd hash :)
      throw new BadRequestException(err);
    }
  }
}
