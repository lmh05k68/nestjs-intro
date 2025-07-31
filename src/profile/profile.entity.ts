import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity'; 

@Entity({ name: 'profiles' })
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'first_name',
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  firstName: string;

  @Column({
    name: 'last_name',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  lastName: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  gender: string;

  @Column({
    name: 'date_of_birth',
    type: 'timestamp',
    nullable: true,
  })
  dateOfBirth: Date;

  @Column({
    type: 'text',
    nullable: true,
  })
  bio: string;

  @Column({
    name: 'profile_image',
    type: 'text',
    nullable: true,
  })
  profileImage: string;

  @OneToOne(() => User, (user) => user.profile, {onDelete: 'CASCADE'})
  @JoinColumn()
  user: User;
}