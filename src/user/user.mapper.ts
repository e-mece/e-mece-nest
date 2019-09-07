import { User as IUser } from '../contract';
import { User } from './user.entity';

export function toUserEntity(userModel: IUser): User {
  const userEntity = new User();
  userEntity.id = userModel.id;
  userEntity.username = userModel.username;
  userEntity.email = userModel.email;
  userEntity.firstName = userModel.firstName;
  userEntity.lastName = userModel.lastName;
  userEntity.middleName = userModel.middleName;
  userEntity.image = userModel.image;
  userEntity.emailVerified = userModel.emailVerified;
  userEntity.birthDate = userModel.birthDate;
  userEntity.registrationDate = userModel.registrationDate;
  userEntity.TCKN = userModel.TCKN;
  userEntity.city = userModel.city;
  userEntity.phone = userModel.phone;
  userEntity.type = userModel.type;
  return userEntity;
}

export function toUserModel(userEntity: User): IUser {
  const userModel = new User();
  userModel.id = userEntity.id;
  userModel.username = userEntity.username;
  userModel.email = userEntity.email;
  userModel.firstName = userEntity.firstName;
  userModel.lastName = userEntity.lastName;
  userModel.middleName = userEntity.middleName;
  userModel.image = userEntity.image;
  userModel.emailVerified = userEntity.emailVerified;
  userModel.birthDate = userEntity.birthDate;
  userModel.registrationDate = userEntity.registrationDate;
  userModel.TCKN = userEntity.TCKN;
  userModel.city = userEntity.city;
  userModel.phone = userEntity.phone;
  userModel.type = userEntity.type;
  return userModel;
}

/**
 * Updates userEntity's fields with userModel's defined field values.
 * Ignores relations. Does not update some fields' values (id, email,
 * emailVerified, registrationDate, TCKN, type) on purpose.
 * @param userEntity Entity to update fields
 * @param userModel Model that contains new values
 */
export function updateUserEntityFromModel(
  userEntity: User,
  userModel: IUser,
): void {
  // id cannot change
  if (userModel.username !== undefined) {
    userEntity.username = userModel.username;
  }
  // email update is separated
  // email verification is separated
  if (userModel.firstName !== undefined) {
    userEntity.firstName = userModel.firstName;
  }
  if (userModel.lastName !== undefined) {
    userEntity.lastName = userModel.lastName;
  }
  if (userModel.middleName !== undefined) {
    userEntity.middleName = userModel.middleName;
  }
  if (userModel.image !== undefined) {
    userEntity.image = userModel.image;
  }
  if (userModel.birthDate !== undefined) {
    userEntity.birthDate = userModel.birthDate;
  }
  // registrationDate can't be updated
  // TCKN cannot be updated
  if (userModel.city !== undefined) {
    userEntity.city = userModel.city;
  }
  if (userModel.phone !== undefined) {
    userEntity.phone = userModel.phone;
  }
  // type cannot be updated
}
