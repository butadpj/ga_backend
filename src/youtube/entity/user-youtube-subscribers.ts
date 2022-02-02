import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserYoutubeData } from './user-youtube-data';

@Entity()
export class UserYoutubeSubscribers {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  youtube_user_id: string;

  @Column()
  subscriber_id: string;

  @Column()
  subscriber_name: string;

  @Column()
  subscriber_display_picture: string;

  @ManyToOne(
    () => UserYoutubeData,
    (twitch_data) => twitch_data.youtube_subscribers,
    { onDelete: 'CASCADE' },
  )
  youtube_data: UserYoutubeData;
}
