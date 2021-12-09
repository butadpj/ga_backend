import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginUserDTO } from '../users/dto';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(credentials: LoginUserDTO): Promise<LoginUserDTO> {
    const user = await this.usersService.findUser(credentials.email);

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

  async login(user: any) {
    const payload = { email: user.email };

    return {
      email: payload.email,
      access_token: this.jwtService.sign(payload),
    };
  }
}
