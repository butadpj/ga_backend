import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { UserYoutubeSubscribers } from './user-youtube-subscribers';
import { UserYoutubeVideo } from './user-youtube-video.entity';
import { User } from '@users/entity/user.entity';

@Entity()
export class UserYoutubeData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  youtube_user_id: string;

  @Column({ nullable: true })
  youtube_display_name: string;

  @Column({ nullable: true })
  youtube_email: string;

  @Column({ nullable: true })
  youtube_display_picture: string;

  @Column({ nullable: true })
  youtube_subscribers_count: number;

  @OneToOne(() => User, (user) => user.youtube_data, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @OneToMany(
    () => UserYoutubeVideo,
    (youtube_videos) => youtube_videos.youtube_data,
  )
  youtube_videos: UserYoutubeVideo[];

  @OneToMany(
    () => UserYoutubeSubscribers,
    (youtube_subscribers) => youtube_subscribers.youtube_data,
    { onDelete: 'CASCADE' },
  )
  youtube_subscribers: UserYoutubeSubscribers[];
}
