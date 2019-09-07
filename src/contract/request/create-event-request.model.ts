import { ApiModelProperty } from '@nestjs/swagger';
import { Event } from '../models/event.model';

export class CreateEventRequest {
  @ApiModelProperty()
  event: Event;
}
