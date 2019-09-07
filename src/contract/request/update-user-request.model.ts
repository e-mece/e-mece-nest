import { ApiModelProperty } from '@nestjs/swagger';
import { User } from '../models/user.model';

export class UpdateUserRequest {
  @ApiModelProperty()
  user: User;
}
