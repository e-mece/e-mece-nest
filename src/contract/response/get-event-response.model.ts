import { Event } from '../models/event.model';
import { User } from '../models/user.model';

export class GetEventResponse {
  constructor(
    public event: Event,
    public creator: User,
    public participants: User[],
  ) {}
}
