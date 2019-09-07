import { UserType } from '../enums/user-type.enum';

export class User {
  id?: number;
  username?: string;
  email?: string;
  passwordHash?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  image?: string;
  emailVerified?: boolean;
  birthDate?: Date;
  registrationDate?: Date;
  TCKN?: string;
  city?: string;
  phone?: string;
  type?: UserType;
}
