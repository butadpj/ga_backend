import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { UserTwitchSubscribers } from './user-twitch-subscribers';
import { UserTwitchVideo } from './user-twitch-video.entity';
import { User } from '@users/entity/user.entity';

@Entity()
export class UserTwitchData {
  @PrimaryGeneratedColumn()
  id: number;

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

  @OneToOne(() => User, (user) => user.twitch_data, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @OneToMany(
    () => UserTwitchVideo,
    (twitch_videos) => twitch_videos.twitch_data,
  )
  twitch_videos: UserTwitchVideo[];

  @OneToMany(
    () => UserTwitchSubscribers,
    (twitch_subscribers) => twitch_subscribers.twitch_data,
    { onDelete: 'CASCADE' },
  )
  twitch_subscribers: UserTwitchSubscribers[];
}
