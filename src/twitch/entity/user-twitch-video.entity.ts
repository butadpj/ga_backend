import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserTwitchData } from './user-twitch-data';

@Entity()
export class UserTwitchVideo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  twitch_id: string;

  @Column({ nullable: true })
  twitch_stream_id?: string;

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
  viewable: string;

  @Column()
  view_count: number;

  @Column()
  type: string;

  @Column()
  duration: string;

  @ManyToOne(() => UserTwitchData, (twitch_data) => twitch_data.twitch_videos)
  twitch_data: UserTwitchData;
}
