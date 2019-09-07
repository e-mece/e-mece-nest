import { Event as IEvent } from '../contract';
import { Event } from './event.entity';

export function toEventEntity(eventModel: IEvent): Event {
  const eventEntity = new Event();
  eventEntity.id = eventModel.id;
  eventEntity.title = eventModel.title;
  eventEntity.description = eventModel.description;
  eventEntity.city = eventModel.city;
  eventEntity.address = eventModel.address;
  eventEntity.latitude = eventModel.latitude;
  eventEntity.longitude = eventModel.longitude;
  eventEntity.startDate = eventModel.startDate;
  eventEntity.endDate = eventModel.endDate;
  eventEntity.quota = eventModel.quota;
  eventEntity.image = eventModel.image;
  eventEntity.approved = eventModel.approved;
  eventEntity.point = eventModel.point;
  eventEntity.created = eventModel.created;
  eventEntity.modified = eventModel.modified;
  return eventEntity;
}

export function toEventModel(eventEntity: Event): IEvent {
  const eventModel = new IEvent();
  eventModel.id = eventEntity.id;
  eventModel.title = eventEntity.title;
  eventModel.description = eventEntity.description;
  eventModel.city = eventEntity.city;
  eventModel.address = eventEntity.address;
  eventModel.latitude = eventEntity.latitude;
  eventModel.longitude = eventEntity.longitude;
  eventModel.startDate = eventEntity.startDate;
  eventModel.endDate = eventEntity.endDate;
  eventModel.quota = eventEntity.quota;
  eventModel.image = eventEntity.image;
  eventModel.approved = eventEntity.approved;
  eventModel.point = eventEntity.point;
  eventModel.created = eventEntity.created;
  eventModel.modified = eventEntity.modified;
  return eventModel;
}

/**
 * Updates userEntity's fields with userModel's defined field values.
 * Ignores relations. Does not update some fields' values (id, approved,
 * point, created) on purpose.
 * @param eventEntity Entity to update fields
 * @param eventModel Model that contains new values
 */
export function updateEventEntityFromModel(
  eventEntity: Event,
  eventModel: IEvent,
): void {
  // id cannot be updated
  if (eventModel.title !== undefined) {
    eventEntity.title = eventModel.title;
  }
  if (eventModel.description !== undefined) {
    eventEntity.description = eventModel.description;
  }
  if (eventModel.city !== undefined) {
    eventEntity.city = eventModel.city;
  }
  if (eventModel.address !== undefined) {
    eventEntity.address = eventModel.address;
  }
  if (eventModel.latitude !== undefined) {
    eventEntity.latitude = eventModel.latitude;
  }
  if (eventModel.longitude !== undefined) {
    eventEntity.longitude = eventModel.longitude;
  }
  if (eventModel.startDate !== undefined) {
    eventEntity.startDate = eventModel.startDate;
  }
  if (eventModel.endDate !== undefined) {
    eventEntity.endDate = eventModel.endDate;
  }
  if (eventModel.quota !== undefined) {
    eventEntity.quota = eventModel.quota;
  }
  if (eventModel.image !== undefined) {
    eventEntity.image = eventModel.image;
  }
  if (eventModel.modified !== undefined) {
    eventEntity.modified = eventModel.modified;
  }
}
