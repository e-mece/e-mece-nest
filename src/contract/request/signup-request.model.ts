import { ApiModelProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsEmail,
  Matches,
  MaxLength,
  MinLength,
  IsOptional,
  Length,
  IsString,
} from 'class-validator';

export class SignupRequest {
  @ApiModelProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiModelProperty()
  @IsNotEmpty()
  // alphanumeric characters and - are valid
  // you can change this as you like
  @Matches(RegExp('^[a-zA-Z0-9\\-]+$'))
  @MaxLength(20)
  username: string;

  @ApiModelProperty()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiModelProperty()
  @IsNotEmpty()
  @Matches(RegExp('^[A-Za-zıöüçğşİÖÜÇĞŞñÑáéíóúÁÉÍÓÚ ]+$'))
  @MaxLength(20)
  firstName: string;

  @ApiModelProperty()
  @IsNotEmpty()
  @Matches(RegExp('^[A-Za-zıöüçğşİÖÜÇĞŞñÑáéíóúÁÉÍÓÚ ]+$'))
  @MaxLength(20)
  lastName: string;

  @ApiModelProperty()
  @IsOptional()
  @IsNotEmpty()
  @Matches(RegExp('^[A-Za-zıöüçğşİÖÜÇĞŞñÑáéíóúÁÉÍÓÚ ]+$'))
  @MaxLength(20)
  middleName?: string;

  @ApiModelProperty()
  @IsString()
  @Length(11)
  TCKN: string;

  @ApiModelProperty()
  @IsString()
  @MaxLength(255)
  city: string;

  @ApiModelProperty()
  @IsString()
  @MaxLength(255)
  phone: string;
}
