import { Role } from '@users/roles/role.enum';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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

  @Column({ nullable: true })
  twitch_user_id: string;

  @Column({ nullable: true })
  twitch_display_name: string;

  @Column({ nullable: true })
  twitch_email: string;

  @Column({ nullable: true })
  twitch_display_picture: string;
}
