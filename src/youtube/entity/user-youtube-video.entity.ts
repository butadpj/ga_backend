import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserYoutubeData } from './user-youtube-data';

@Entity()
export class UserYoutubeVideo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  youtube_user_id: string;

  @Column({ nullable: true })
  video_id?: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ type: 'timestamptz' })
  created_at: Date;

  @Column({ type: 'timestamptz' })
  published_at: Date;

  @Column()
  url: string;

  @Column()
  thumbnail_url: string;

  @Column()
  view_count: number;

  @Column()
  type: string;

  @Column()
  duration: string;

  @ManyToOne(() => UserYoutubeData, (twitch_data) => twitch_data.youtube_videos)
  youtube_data: UserYoutubeData;
}
