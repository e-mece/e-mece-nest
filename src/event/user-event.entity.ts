import { Entity, Column, PrimaryColumn, ManyToOne } from 'typeorm';
import { User } from '../user/user.entity';
import { Event } from './event.entity';

@Entity('user-event')
export class UserEvent {
  @PrimaryColumn()
  userId: number;
  @PrimaryColumn()
  eventId: number;

  @Column('boolean', { default: true })
  active: boolean;

  @Column('timestamp', { default: () => `now()` })
  created: Date;

  @Column('timestamp', { default: () => `now()` })
  modified: Date;

  @ManyToOne(type => User, user => user.events, {
    primary: true,
    onDelete: 'CASCADE',
  })
  user: User;

  @ManyToOne(type => Event, event => event.participants, {
    primary: true,
    onDelete: 'CASCADE',
  })
  event: Event;
}
