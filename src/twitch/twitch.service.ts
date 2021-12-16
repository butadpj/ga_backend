import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { UsersService } from '@users/users.service';
import { map } from 'rxjs';

@Injectable()
export class TwitchService {
  constructor(
    private httpService: HttpService,
    private usersService: UsersService,
  ) {}

  async processTwitchAuth(code: string, email: string): Promise<any> {
    const access_token = await this.getUserTwitchAccessToken(code);
    if (!access_token) throw new Error('Invalid or undefined access_token');

    const { twitch_user_id } = await this.processUserTwitchData(
      access_token,
      email,
    );

    await this.processUserTwitchVideos(access_token, email, twitch_user_id);
  }

  async processUserTwitchData(access_token: string, email: string) {
    const {
      twitch_user_id,
      twitch_display_name,
      twitch_display_picture,
      twitch_email,
      user_email,
    } = await this.getTwitchUserData(access_token, email);

    return await this.usersService.updateTwitchUserData({
      twitch_user_id,
      twitch_display_name,
      twitch_display_picture,
      twitch_email,
      user_email,
    });
  }

  async processUserTwitchVideos(
    access_token: string,
    email: string,
    twitch_user_id: string,
  ) {
    const videos = await this.getTwitchUserVideos({
      access_token,
      twitch_user_id,
    });

    if (videos.length > 0) {
      videos.forEach((video: any) => {
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

        return this.usersService.createTwitchVideo(email, {
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

  async getUserTwitchAccessToken(code: string): Promise<any> {
    const redirectUri = `${process.env.HOST}:${process.env.PORT}/twitch-auth`;

    const res = this.httpService.post(
      `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&code=${code}&grant_type=authorization_code&redirect_uri=${redirectUri}`,
    );
    const { access_token } = await res
      .pipe(map((response) => response.data))
      .toPromise();

    return access_token;
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

    return {
      twitch_user_id,
      twitch_display_name,
      twitch_display_picture,
      twitch_email,
      user_email: email,
    };
  }

  async getTwitchUserVideos({ access_token, twitch_user_id }): Promise<any> {
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

    return videos;
  }
}
