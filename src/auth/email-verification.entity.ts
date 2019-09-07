import { Entity, PrimaryColumn, Column, Unique, Index } from 'typeorm';

@Entity('email-verification')
@Unique('unique_email-verification_userId', ['userId'])
@Index('index_email-verification_userId', ['userId'])
export class EmailVerification {
  @PrimaryColumn('char', { length: 21 })
  token: string;

  @Column('int')
  userId: number;

  @Column('timestamp')
  validUntil: Date;
}
