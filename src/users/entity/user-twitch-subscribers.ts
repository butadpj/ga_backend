import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

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

  @ManyToOne(() => User, (user) => user.twitch_subscribers)
  user: User;
}
