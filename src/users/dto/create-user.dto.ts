import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class CreateUserDTO {
  @IsEmail({}, { message: 'Pleaese enter a valid email' })
  @IsNotEmpty()
  email: string;

  @Length(8, 50, { message: 'Password should be 8 characters minimum' })
  @IsNotEmpty()
  password: string;
}
