import { Entity, PrimaryColumn, Column, Unique, Index } from 'typeorm';

@Entity('password-reset')
@Unique('unique_password-reset_userId', ['userId'])
@Index('index_password-reset_userId', ['userId'])
export class PasswordReset {
  @PrimaryColumn('char', { length: 21 })
  token: string;

  @Column('int')
  userId: number;

  @Column('timestamp')
  validUntil: Date;
}
