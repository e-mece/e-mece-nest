import { User } from '../models/user.model';
import { Event } from '../models/event.model';

export class GetUserResponse {
  constructor(
    public user: User,
    public createdEvents: Event[],
    public registeredEvents: Event[],
  ) {}
}
