import { IsNotEmpty } from 'class-validator';

export class LoginUserDTO {
  id?: number;

  @IsNotEmpty()
  readonly email: string;

  @IsNotEmpty()
  readonly password: string;

  access_token?: string;
}
