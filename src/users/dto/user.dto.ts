import { UserTwitchSubscribers } from '@users/entity/user-twitch-subscribers';
import { UserTwitchVideo } from '@users/entity/user-twitch-video.entity';
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
  readonly twitch_followers_count: number;
  readonly twitch_subscribers_count: number;
  readonly twitch_channel_qualified: boolean;
  twitch_videos: UserTwitchVideo[];
  twitch_subscribers: UserTwitchSubscribers[];
  isEmailConfirmed: boolean;
}
