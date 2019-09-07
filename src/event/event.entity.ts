import {
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Event as IEvent } from '../contract';
import { UserEvent } from './user-event.entity';
import { User } from '../user/user.entity';

@Entity('event')
@Index('index_event_city', ['city'], { fulltext: true })
export class Event implements IEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('nvarchar', { length: 255 })
  title: string;

  @Column('varchar', { length: 4095 })
  description: string;

  @Column()
  city: string;

  @Column('varchar', { length: 2047 })
  address: string;

  @Column('double')
  latitude: number;

  @Column('double')
  longitude: number;

  @Column('timestamp', { default: () => `now()` })
  startDate: Date;

  @Column('timestamp', { default: () => `now()` })
  endDate: Date;

  @Column('int')
  quota: number;

  @Column('varchar', { nullable: true, length: 511 })
  image?: string;

  @Column('boolean', { default: false })
  approved: boolean;

  @Column('int', { nullable: true })
  point: number;

  @Column('timestamp', { default: () => `now()` })
  created: Date;

  @Column('timestamp', { default: () => `now()`, onUpdate: `now()` })
  modified: Date;

  @Column('boolean', { default: false })
  isCancelled: boolean;

  @OneToMany(type => UserEvent, userEvent => userEvent.event)
  participants!: UserEvent[];

  creatorId: number;
  @ManyToOne(type => User, user => user.createdEvents, { nullable: false })
  creator: User;

  approverId: number;
  @ManyToOne(type => User, user => user.approvedEvents, { nullable: true })
  approver: User;
}
