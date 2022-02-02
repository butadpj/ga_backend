import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserTwitchData } from './user-twitch-data';

@Entity()
export class UserTwitchSubscribers {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  twitch_id: string;

  @Column()
  subscriber_id: string;

  @Column()
  subscriber_name: string;

  @Column()
  subscriber_display_picture: string;

  @Column()
  is_gift: boolean;

  @ManyToOne(
    () => UserTwitchData,
    (twitch_data) => twitch_data.twitch_subscribers,
    { onDelete: 'CASCADE' },
  )
  twitch_data: UserTwitchData;
}
