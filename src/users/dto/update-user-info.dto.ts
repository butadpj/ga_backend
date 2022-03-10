import { PublicFile } from '@files/entity/public-file';

export class UpdateUserInfoDTO {
  displayName?: string;
  profilePicture?: PublicFile;
}
