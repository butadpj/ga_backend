import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginUserDTO, UserDTO } from '../users/dto';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(credentials: LoginUserDTO): Promise<UserDTO> {
    const user = await this.usersService.findUser({ email: credentials.email });

    if (user) {
      const isPasswordMatch = await bcrypt.compare(
        credentials.password,
        user.password,
      );

      if (isPasswordMatch) {
        return user;
      }

      throw new UnauthorizedException(
        {
          statusCode: 422,
          message: `Username or password didn't match`,
          error: 'Unauthorized exception',
        },
        'Wrong login credentials',
      );
    }
    throw new NotFoundException(
      {
        statusCode: 404,
        message: `User doesn't exist`,
        error: 'Not found exception',
      },
      'User not found',
    );
  }

  async login(user: any): Promise<any> {
    const payload = {
      userId: user.id,
      email: user.email,
    };

    return {
      ...payload,
      access_token: this.jwtService.sign(payload),
    };
  }
}
