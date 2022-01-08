import { Role } from '@users/roles/role.enum';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UserTwitchSubscribers } from './user-twitch-subscribers';
import { UserTwitchVideo } from './user-twitch-video.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({ type: 'enum', enum: Role, default: Role.User })
  role?: Role[];

  @Column({ default: false })
  isEmailConfirmed: boolean;

  @Column({ nullable: true })
  twitch_user_id: string;

  @Column({ nullable: true })
  twitch_display_name: string;

  @Column({ nullable: true })
  twitch_email: string;

  @Column({ nullable: true })
  twitch_display_picture: string;

  @Column({ nullable: true })
  twitch_followers_count: number;

  @Column({ nullable: true })
  twitch_subscribers_count: number;

  @Column({ nullable: true })
  twitch_channel_qualified: boolean;

  @OneToMany(() => UserTwitchVideo, (twitch_videos) => twitch_videos.user)
  twitch_videos: UserTwitchVideo[];

  @OneToMany(
    () => UserTwitchSubscribers,
    (twitch_subscribers) => twitch_subscribers.user,
  )
  twitch_subscribers: UserTwitchSubscribers[];
}
