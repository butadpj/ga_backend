import { Role } from '@users/roles/role.enum';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { UserTwitchData } from './user-twitch-data';

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
}
