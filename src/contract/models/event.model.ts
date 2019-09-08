import { ApiModelProperty } from '@nestjs/swagger';

export class Event {
  @ApiModelProperty()
  id?: number;
  @ApiModelProperty()
  title?: string;
  @ApiModelProperty()
  description?: string;
  @ApiModelProperty()
  city?: string;
  @ApiModelProperty()
  address?: string;
  @ApiModelProperty()
  latitude?: number;
  @ApiModelProperty()
  longitude?: number;
  @ApiModelProperty()
  startDate?: Date;
  @ApiModelProperty()
  endDate?: Date;
  @ApiModelProperty()
  quota?: number;
  @ApiModelProperty()
  image?: string;
  @ApiModelProperty()
  approved?: boolean;
  @ApiModelProperty()
  point?: number;
  @ApiModelProperty()
  created?: Date;
  @ApiModelProperty()
  modified?: Date;
  participationApproved?: boolean;
  participantCount?: number;
}
