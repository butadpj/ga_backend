import { Role } from '@users/roles/role.enum';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { UserTwitchData } from '@twitch/entity/user-twitch-data';
import { UserYoutubeData } from '@youtube/entity/user-youtube-data';

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

  @OneToOne(() => UserTwitchData, (twitch_data) => twitch_data.user, {
    onDelete: 'CASCADE',
  })
  twitch_data: UserTwitchData;

  @OneToOne(() => UserYoutubeData, (youtube_data) => youtube_data.user, {
    onDelete: 'CASCADE',
  })
  youtube_data: UserYoutubeData;
}
