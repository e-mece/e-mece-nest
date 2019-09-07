import { Event } from '../models/event.model';
import { ApiModelProperty } from '@nestjs/swagger';

export class UpdateEventRequest {
  @ApiModelProperty()
  event: Event;
}
