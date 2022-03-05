import { PublicFile } from '@files/entity/public-file';
import { Role } from '@users/roles/role.enum';

export class UpdateUserDTO {
  email?: string;
  password?: string;
  role?: Role[];
  displayName?: string;
  profilePicture?: PublicFile;
  isEmailConfirmed?: boolean;
}
