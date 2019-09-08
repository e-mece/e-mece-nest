import { UserType } from '../enums/user-type.enum';
import { ApiModelProperty } from '@nestjs/swagger';

export class User {
  @ApiModelProperty()
  id?: number;
  @ApiModelProperty()
  username?: string;
  @ApiModelProperty()
  email?: string;
  @ApiModelProperty()
  passwordHash?: string;
  @ApiModelProperty()
  firstName?: string;
  @ApiModelProperty()
  lastName?: string;
  @ApiModelProperty()
  middleName?: string;
  @ApiModelProperty()
  image?: string;
  @ApiModelProperty()
  emailVerified?: boolean;
  @ApiModelProperty()
  birthDate?: Date;
  @ApiModelProperty()
  created?: Date;
  @ApiModelProperty()
  modified?: Date;
  @ApiModelProperty()
  TCKN?: string;
  @ApiModelProperty()
  city?: string;
  @ApiModelProperty()
  phone?: string;
  @ApiModelProperty()
  type?: UserType;
}
