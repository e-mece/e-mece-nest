import { User as IUser } from '../contract';
import { Entity, Unique, Index, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('user')
@Unique('unique_user_username', ['username'])
@Unique('unique_user_email', ['email'])
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

  @Column('text')
  firstName: string;

  @Column('text')
  lastName: string;

  @Column('text', { nullable: true })
  middleName?: string;

  @Column('text', { nullable: true })
  image?: string;

  @Column('boolean', { default: false })
  emailVerified: boolean;

  @Column('date', { nullable: true })
  birthDate?: Date;

  @Column('date')
  registrationDate: Date;

  @Column('char', { length: 11 })
  TCKN: string;

  @Column()
  city: string;

  @Column('text')
  phone: string;
}
