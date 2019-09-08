import { User as IUser, UserType } from '../contract';
import {
  Entity,
  Unique,
  Index,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { UserEvent } from '../event/user-event.entity';
import { Event } from '../event/event.entity';

@Entity('user')
@Unique('unique_user_username', ['username'])
@Unique('unique_user_email', ['email'])
@Unique('unique_user_phone', ['phone'])
@Unique('unique_user_TCKN', ['TCKN'])
@Index('index_user_username', ['username'], { fulltext: true })
@Index('index_user_email', ['email'], { fulltext: true })
@Index('index_user_city', ['city'], { fulltext: true })
export class User implements IUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  email: string;

  @Column('text')
  passwordHash: string;

  @Column('nvarchar', { length: 255 })
  firstName: string;

  @Column('nvarchar', { length: 255 })
  lastName: string;

  @Column('varchar', { nullable: true, length: 255 })
  middleName?: string;

  @Column('mediumtext', { nullable: true })
  image?: string;

  @Column('boolean', { default: false })
  emailVerified: boolean;

  @Column('date', { nullable: true })
  birthDate?: Date;

  @Column('timestamp', { default: () => `now()` })
  created: Date;

  @Column('timestamp', { default: () => `now()`, onUpdate: `now()` })
  modified: Date;

  @Column('char', { length: 11 })
  TCKN: string;

  @Column()
  city: string;

  @Column()
  phone: string;

  @Column('tinyint', { default: UserType.User })
  type: UserType;

  @OneToMany(type => UserEvent, userEvent => userEvent.user)
  events!: UserEvent[];

  @OneToMany(type => Event, event => event.creator)
  createdEvents: UserEvent[];

  @OneToMany(type => Event, event => event.approver)
  approvedEvents: UserEvent[];
}
