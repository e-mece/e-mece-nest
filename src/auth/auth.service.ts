import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import {
  SignupRequest,
  ChangeEmailRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
} from '../contract';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './jwt-payload.interface';
import { User } from '../user/user.entity';
import { JwtService } from '@nestjs/jwt';
import { LoginRequest } from '../contract';
import { isNullOrUndefined } from 'util';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailVerification } from './email-verification.entity';
import { Repository } from 'typeorm';
import { MailSenderService } from '../mail-sender/mail-sender.service';
import 'nanoid';
import nanoid = require('nanoid');
import { EmailChange } from './email-change.entity';
import { PasswordReset } from './password-reset.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(EmailVerification)
    private readonly emailVerificationRepository: Repository<EmailVerification>,
    @InjectRepository(EmailChange)
    private readonly emailChangeRepository: Repository<EmailChange>,
    @InjectRepository(PasswordReset)
    private readonly passwordResetRepository: Repository<PasswordReset>,
    private readonly mailSenderService: MailSenderService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(signupRequest: SignupRequest): Promise<void> {
    const createdUser = await this.userService.createUser(
      signupRequest,
      await bcrypt.hash(signupRequest.password, 10),
    );

    const token = nanoid();

    const emailVerification = new EmailVerification();
    emailVerification.token = token;
    emailVerification.userId = createdUser.id;
    // valid for 2 days
    const twoDaysLater = new Date();
    twoDaysLater.setDate(twoDaysLater.getDate() + 2);
    emailVerification.validUntil = twoDaysLater;

    try {
      this.emailVerificationRepository.insert(emailVerification);
    } catch (err) {
      Logger.error(JSON.stringify(err));
      throw new InternalServerErrorException(err);
    }

    await this.mailSenderService.sendVerifyEmailMail(
      signupRequest.firstName,
      signupRequest.email,
      token,
    );
  }

  async resendVerificationMail(
    name: string,
    email: string,
    userId: number,
  ): Promise<void> {
    const emailVerification = await this.emailVerificationRepository.findOne({
      where: { userId },
    });

    if (isNullOrUndefined(emailVerification)) {
      Logger.log(
        `User with id ${userId} called resend verification without a valid email verification`,
      );
      throw new NotFoundException();
    }

    // update validUntil to 2 days later
    const twoDaysLater = new Date();
    twoDaysLater.setDate(twoDaysLater.getDate() + 2);
    emailVerification.validUntil = twoDaysLater;

    await this.emailVerificationRepository.update(
      emailVerification.token,
      emailVerification,
    );

    await this.mailSenderService.sendVerifyEmailMail(
      name,
      email,
      emailVerification.token,
    );
  }

  async verifyEmail(token: string): Promise<void> {
    const emailVerification = await this.emailVerificationRepository.findOne(
      token,
    );

    if (emailVerification && emailVerification.validUntil > new Date()) {
      const userEntity = await this.userService.getUserEntityById(
        emailVerification.userId,
      );
      userEntity.emailVerified = true;
      await this.userService.updateUser(userEntity);
      await this.emailVerificationRepository.delete(emailVerification);
    } else {
      Logger.log(`Verify email called with invalid email token ${token}`);
      throw new NotFoundException();
    }
  }

  async sendChangeEmailMail(
    changeEmailRequest: ChangeEmailRequest,
    userId: number,
    name: string,
    oldEmail: string,
  ): Promise<void> {
    // Check whether email is in use
    const userEntity = await this.userService.getUserEntityByUsername(
      changeEmailRequest.newEmail,
    );
    if (userEntity !== undefined) {
      Logger.log(
        `User with id ${userId} tried to change its email to already used ${
          changeEmailRequest.newEmail
        }`,
      );
      throw new ConflictException();
    }

    // Invalidate old token if exists
    const oldEmailChangeEntity = await this.emailChangeRepository.findOne({
      userId,
    });
    if (oldEmailChangeEntity !== undefined) {
      await this.emailChangeRepository.delete(oldEmailChangeEntity);
      Logger.log(
        `Email change token ${oldEmailChangeEntity.token} is invalidated`,
      );
    }

    const token = nanoid();
    const emailChange = new EmailChange();
    emailChange.token = token;
    emailChange.userId = userId;
    // valid for 2 days
    const twoDaysLater = new Date();
    twoDaysLater.setDate(twoDaysLater.getDate() + 2);
    emailChange.validUntil = twoDaysLater;
    try {
      this.emailChangeRepository.insert(emailChange);
    } catch (err) {
      Logger.error(JSON.stringify(err));
      throw new InternalServerErrorException(err);
    }

    await this.mailSenderService.sendChangeEmailMail(name, oldEmail, token);
  }

  async changeEmail(token: string): Promise<void> {
    const emailChange = await this.emailChangeRepository.findOne(token);
    if (emailChange && emailChange.validUntil > new Date()) {
      const userEntity = await this.userService.getUserEntityById(
        emailChange.userId,
      );
      userEntity.email = emailChange.newEmail;
      await this.userService.updateUser(userEntity);
      await this.emailChangeRepository.delete(emailChange);
    } else {
      Logger.log(`Invalid email change token ${token} is rejected.`);
      throw new NotFoundException();
    }
  }

  async sendResetPasswordMail(email: string): Promise<void> {
    const userEntity = await this.userService.getUserEntityByUsername(email);
    if (isNullOrUndefined(userEntity)) {
      throw new NotFoundException();
    }

    const userId = userEntity.id;
    // Invalidate old token if exists
    const oldResetPasswordEntity = await this.passwordResetRepository.findOne({
      userId,
    });
    if (oldResetPasswordEntity !== undefined) {
      await this.passwordResetRepository.delete(oldResetPasswordEntity);
      Logger.log(
        `Password reset token ${oldResetPasswordEntity.token} is invalidated`,
      );
    }
    const token = nanoid();
    const passwordReset = new PasswordReset();
    passwordReset.token = token;
    passwordReset.userId = userId;
    // valid for 2 days
    const twoDaysLater = new Date();
    twoDaysLater.setDate(twoDaysLater.getDate() + 2);
    passwordReset.validUntil = twoDaysLater;
    try {
      this.emailChangeRepository.insert(passwordReset);
    } catch (err) {
      Logger.error(JSON.stringify(err));
      throw new InternalServerErrorException(err);
    }

    this.mailSenderService.sendResetPasswordMail(
      userEntity.firstName,
      userEntity.email,
      token,
    );
  }

  async resetPassword(
    resetPasswordRequest: ResetPasswordRequest,
  ): Promise<void> {
    const passwordResetEntity = await this.passwordResetRepository.findOne(
      resetPasswordRequest.token,
    );

    if (passwordResetEntity && passwordResetEntity.validUntil > new Date()) {
      await this.userService.updatePassword(
        passwordResetEntity.userId,
        await bcrypt.hash(resetPasswordRequest.newPassword, 10),
      );
      await this.passwordResetRepository.delete(passwordResetEntity);
    } else {
      Logger.log(
        `Invalid reset password token ${
          resetPasswordRequest.newPassword
        } is rejected`,
      );
      throw new NotFoundException();
    }
  }

  async changePassword(
    changePasswordRequest: ChangePasswordRequest,
    userId: number,
    name: string,
    email: string,
  ) {
    await this.userService.updatePassword(
      userId,
      await bcrypt.hash(changePasswordRequest.newPassword, 10),
    );

    await this.mailSenderService.sendPasswordChangeInfoMail(name, email);
  }

  async validateUser(payload: JwtPayload): Promise<User> {
    const userEntity = await this.userService.getUserEntityById(payload.id);
    if (
      userEntity !== undefined &&
      userEntity.email === payload.email &&
      userEntity.username === payload.username
    ) {
      return userEntity;
    } else {
      throw new UnauthorizedException();
    }
  }

  async login(loginRequest: LoginRequest): Promise<string> {
    const userEntity = await this.userService.getUserEntityByUsernameOrEmail(
      loginRequest.identifier,
    );

    if (
      isNullOrUndefined(userEntity) ||
      !bcrypt.compareSync(loginRequest.password, userEntity.passwordHash)
    ) {
      throw new UnauthorizedException();
    }

    const payload: JwtPayload = {
      id: userEntity.id,
      email: userEntity.email,
      username: userEntity.username,
    };

    return await this.jwtService.signAsync(payload);
  }
}
