import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from './event.entity';
import { Repository } from 'typeorm';
import { CreateEventRequest, Event as IEvent } from '../contract';
import { toEventEntity, toEventModel } from './event.mapper';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

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
