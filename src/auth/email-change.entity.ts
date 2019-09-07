import { Entity, PrimaryColumn, Column, Unique, Index } from 'typeorm';

@Entity('email-change')
@Unique('unique_email-change_userId', ['userId'])
@Index('index_email-change_userId', ['userId'])
export class EmailChange {
  @PrimaryColumn('char', { length: 21 })
  token: string;

  @Column('text')
  newEmail: string;

  @Column('int')
  userId: number;

  @Column('timestamp')
  validUntil: Date;
}
