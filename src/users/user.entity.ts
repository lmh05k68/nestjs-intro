import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn, // Đã import
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Profile } from '../profile/profile.entity';
import { Tweet } from '../tweet/tweet.entity'; // Đã import Tweet entity
@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 24,
    nullable: false,
    unique: true,
  })
  username: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
    unique: true,
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  password: string;

  @OneToOne(() => Profile, (profile) => profile.user, {
    cascade:['insert'],
    onDelete: 'CASCADE'
  })
  profile?: Profile;

  @OneToMany(() => Tweet, (tweet) => tweet.user)
  tweets: Tweet[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp' })
  deletedAt: Date;
}