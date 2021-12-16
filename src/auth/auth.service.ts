import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginUserDTO, UserDTO } from '../users/dto';
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

  async getUserTwitchAccessToken(code: string, email: string): Promise<any> {
    const redirectUri = `${process.env.HOST}:${process.env.PORT}/login`;

    const res = this.httpService.post(
      `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&code=${code}&grant_type=authorization_code&redirect_uri=${redirectUri}`,
    );
    const { access_token } = await res
      .pipe(map((response) => response.data))
      .toPromise();

    const { id, twitch_user_id } = await this.getTwitchUserData(
      access_token,
      email,
    );

    this.getTwitchUserVideos({ userId: id, access_token, twitch_user_id });
  }

  async getTwitchUserData(access_token: string, email: string): Promise<any> {
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

    return this.usersService.updateTwitchUserData({
      twitch_user_id,
      twitch_display_name,
      twitch_display_picture,
      twitch_email,
      user_email: email,
    });
  }

  async getTwitchUserVideos({
    userId,
    access_token,
    twitch_user_id,
  }): Promise<any> {
    const res = this.httpService.get(
      `https://api.twitch.tv/helix/videos?user_id=${twitch_user_id}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Client-Id': process.env.TWITCH_CLIENT_ID,
        },
      },
    );

    const videos = await res
      .pipe(map((response) => response.data.data))
      .toPromise();

    // const videos = [
    //   {
    //     id: '335921245',
    //     stream_id: null,
    //     user_id: '141981764',
    //     user_login: 'twitchdev',
    //     user_name: 'TwitchDev',
    //     title: 'Twitch Developers 101',
    //     description:
    //       'Welcome to Twitch development! Here is a quick overview of our products and information to help you get started.',
    //     created_at: '2018-11-14T21:30:18Z',
    //     published_at: '2018-11-14T22:04:30Z',
    //     url: 'https://www.twitch.tv/videos/335921245',
    //     thumbnail_url:
    //       'https://static-cdn.jtvnw.net/cf_vods/d2nvs31859zcd8/twitchdev/335921245/ce0f3a7f-57a3-4152-bc06-0c6610189fb3/thumb/index-0000000000-%{width}x%{height}.jpg',
    //     viewable: 'public',
    //     view_count: 1863062,
    //     language: 'en',
    //     type: 'upload',
    //     duration: '3m21s',
    //     muted_segments: [
    //       {
    //         duration: 30,
    //         offset: 120,
    //       },
    //     ],
    //   },
    // ];

    if (videos.length > 0) {
      videos.map((video) => {
        const {
          user_id: twitch_id,
          stream_id: twitch_stream_id,
          title,
          description,
          url,
          thumbnail_url,
          viewable,
          view_count,
          type,
          duration,
          created_at,
          published_at,
        } = video;

        return this.usersService.createTwitchVideo(userId, {
          twitch_id,
          twitch_stream_id,
          title,
          description,
          url,
          thumbnail_url,
          viewable,
          view_count,
          type,
          duration,
          created_at,
          published_at,
        });
      });
    }
    return { message: `User has no twitch videos` };
  }
}
