import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDTO, LoginUserDTO, UserDTO } from '../users/dto';
import { UsersService } from '@users/services/users.service';
import { UsersTwitchDataService } from '@users/services/users-twitch-data.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private usersTwitchDataService: UsersTwitchDataService,
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
      isEmailConfirmed: user.isEmailConfirmed,
    };

    const hasTwitch =
      await this.usersTwitchDataService.hasExistingTwitchAccount(user.id);

    if (hasTwitch)
      this.usersTwitchDataService.autoUnlinkTwitchAccount(user.email);

    return {
      ...payload,
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(credentials: CreateUserDTO): Promise<any> {
    return await this.usersService.createUser(credentials);
  }
}
