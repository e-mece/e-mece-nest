import { Event } from '../models/event.model';

export class GetEventsResponse {
  total?: number;
  pageTotal?: number;
  constructor(public events: Event[]) {}
}
