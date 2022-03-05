import { PublicFile } from '@files/entity/public-file';
import { UserTwitchData } from '@twitch/entity/user-twitch-data';
import { Role } from '@users/roles/role.enum';
import { UserYoutubeData } from '@youtube/entity/user-youtube-data';

export class UserDTO {
  readonly id?: number;
  readonly email?: string;
  readonly password?: string;
  readonly role?: Role[];
  readonly displayName?: string;
  profilePicture?: PublicFile;
  twitch_data: UserTwitchData;
  youtube_data: UserYoutubeData;
  isEmailConfirmed: boolean;
}
