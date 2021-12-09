import { Role } from '@users/roles/role.enum';

export class UserDTO {
  readonly id: number;
  readonly email: string;
  readonly password: string;
  readonly role?: Role[];
}
