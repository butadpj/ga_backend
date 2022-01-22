import { UserTwitchData } from '@users/entity/user-twitch-data';
import { Role } from '@users/roles/role.enum';

export class UserDTO {
  readonly id?: number;
  readonly email?: string;
  readonly password?: string;
  readonly role?: Role[];
  twitch_data: UserTwitchData;
  isEmailConfirmed: boolean;
}
