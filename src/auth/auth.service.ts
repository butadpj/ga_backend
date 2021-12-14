import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginUserDTO } from '../users/dto';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { map } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private httpService: HttpService,
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

  async login(user: any): Promise<any> {
    const payload = { email: user.email };

    return {
      email: payload.email,
      access_token: this.jwtService.sign(payload),
    };
  }

  async getUserTwitchAccessToken(code: string, email: string): Promise<any> {
    const redirectUri = `${process.env.HOST}:${process.env.PORT}/login`;

    const res = this.httpService.post(
      `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&code=${code}&grant_type=authorization_code&redirect_uri=${redirectUri}`,
    );
    const { access_token } = await res
      .pipe(map((response) => response.data))
      .toPromise();

    return this.getTwitchUserData(access_token, email);
  }

  async getTwitchUserData(access_token, email): Promise<any> {
    const res = this.httpService.get(`https://api.twitch.tv/helix/users`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Client-Id': process.env.TWITCH_CLIENT_ID,
      },
    });

    const {
      id: twitch_user_id,
      display_name: twitch_display_name,
      profile_image_url: twitch_display_picture,
      email: twitch_email,
    } = await res.pipe(map((response) => response.data.data[0])).toPromise();

    return this.usersService.createTwitchUserData({
      twitch_user_id,
      twitch_display_name,
      twitch_display_picture,
      twitch_email,
      user_email: email,
    });
  }
}
