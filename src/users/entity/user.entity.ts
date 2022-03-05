import { Role } from '@users/roles/role.enum';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { UserTwitchData } from '@twitch/entity/user-twitch-data';
import { UserYoutubeData } from '@youtube/entity/user-youtube-data';
import { PublicFile } from '@files/entity/public-file';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  displayName: string;

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({ type: 'enum', enum: Role, default: Role.User })
  role?: Role[];

  @Column({ default: false })
  isEmailConfirmed: boolean;

  @JoinColumn()
  @OneToOne(() => PublicFile, { eager: true, nullable: true })
  profilePicture: PublicFile;

  @OneToOne(() => UserTwitchData, (twitch_data) => twitch_data.user, {
    onDelete: 'CASCADE',
  })
  twitch_data: UserTwitchData;

  @OneToOne(() => UserYoutubeData, (youtube_data) => youtube_data.user, {
    onDelete: 'CASCADE',
  })
  youtube_data: UserYoutubeData;
}
