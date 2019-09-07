import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { SignupRequest, GetLeaderboardResponse } from '../contract';
import { isNullOrUndefined } from 'util';
import { getConnection } from 'typeorm';
import { toUserModel } from './user.mapper';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  public async getUserEntityById(id: number): Promise<User> {
    return await this.userRepository.findOne(id);
  }

  public async getUserEntityByUsername(username: string): Promise<User> {
    username = username.toLowerCase();
    return await this.userRepository.findOne({ where: { username } });
  }

  public async getUserEntityByUsernameOrEmail(
    identifier: string,
  ): Promise<User> {
    identifier = identifier.toLowerCase();
    return await this.userRepository.findOne({
      where: [{ username: identifier }, { email: identifier }],
    });
  }

  public async createUser(
    signupRequest: SignupRequest,
    passwordHash: string,
  ): Promise<User> {
    const newUser = new User();
    newUser.username = signupRequest.username.toLowerCase();
    newUser.email = signupRequest.email.toLowerCase();
    newUser.passwordHash = passwordHash;
    newUser.firstName = signupRequest.firstName;
    newUser.lastName = signupRequest.lastName;
    newUser.middleName = signupRequest.middleName;
    newUser.TCKN = signupRequest.TCKN;
    newUser.city = signupRequest.city;
    newUser.phone = signupRequest.phone;
    try {
      // insert also updates id of newUser, we can directly return newUser
      await this.userRepository.insert(newUser);
      return newUser;
    } catch (err) {
      Logger.error(JSON.stringify(err));
      throw new ConflictException();
    }
  }

  public async updatePassword(
    userId: number,
    passwordHash: string,
  ): Promise<void> {
    const userEntity = await this.userRepository.findOne(userId);
    if (isNullOrUndefined(userEntity)) {
      Logger.warn(
        `Password chage of non-existend account with id ${userId} is rejected.`,
      );
      throw new NotFoundException();
    }

    userEntity.passwordHash = passwordHash;
    await this.userRepository.update(userEntity.id, userEntity);
  }

  public async updateUser(userEntity: User): Promise<void> {
    // TODO: Email update should be seperated
    // TODO: Add validation
    try {
      await this.userRepository.update(userEntity.id, userEntity);
    } catch (err) {
      Logger.warn(JSON.stringify(err));
      throw new BadRequestException();
    }
  }

  public async getLeaderBoard(limit: number): Promise<GetLeaderboardResponse> {
    let creationPoints: Array<{ uid: number; spts: number }> = null;

    creationPoints = await getConnection()
      .createEntityManager()
      .query(
        // tslint:disable-next-line: max-line-length
        `SELECT uid, sum(pts) as spts FROM (SELECT u.id as uid, 2 * SUM(e.point) as pts FROM user u, event e WHERE u.id=e.creatorId AND e.approved = TRUE GROUP BY u.id UNION SELECT u.id as uid, SUM(e.point) AS pts FROM user u, event e, \`user-event\` ue WHERE u.id=ue.userId and e.id=ue.eventId and ue.approved = TRUE GROUP BY u.id ) as tbl  GROUP BY uid HAVING spts IS NOT NULL ORDER BY spts DESC LIMIT ${limit};`,
      );

    const users = await this.userRepository.findByIds(
      creationPoints.map(cP => cP.uid),
    );

    return new GetLeaderboardResponse(users.map(user => toUserModel(user)));
  }
}
