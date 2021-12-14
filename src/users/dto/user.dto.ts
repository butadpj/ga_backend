import { Role } from '@users/roles/role.enum';

export class UserDTO {
  readonly id?: number;
  readonly email?: string;
  readonly password?: string;
  readonly role?: Role[];
  readonly twitch_user_id?: string;
  readonly twitch_display_name?: string;
  readonly twitch_email?: string;
  readonly twitch_display_picture?: string;
}
