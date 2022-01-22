/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { UsersService } from '@users/users.service';
import { map } from 'rxjs';
import { mockSubscribers } from 'src/utils/mockData';

@Injectable()
export class TwitchService {
  constructor(
    private httpService: HttpService,
    private usersService: UsersService,
  ) {}

  async processTwitchAuth(code: string, email: string): Promise<any> {
    const access_token = await this.getUserOAuthToken(code);
    if (!access_token) throw new Error('Invalid or undefined access_token');

    const { twitch_user_id } = await this.processUserTwitchData(
      access_token,
      email,
    );

    await this.processUserTwitchVideos(access_token, email, twitch_user_id);

    await this.processUserChannelInformation(
      access_token,
      email,
      twitch_user_id,
    );

    this.usersService.autoUnlinkTwitchAccount(email);
  }

  async processUserTwitchData(access_token: string, email: string) {
    const {
      twitch_user_id,
      twitch_display_name,
      twitch_display_picture,
      twitch_email,
    } = await this.getTwitchUserData({ access_token });

    const user = await this.usersService.findUser({ email });

    const userHasExistingTwitchAccount =
      await this.usersService.hasExistingTwitchAccount(user.id);

    if (userHasExistingTwitchAccount) {
      return await this.usersService.updateTwitchUserData(email, {
        twitch_user_id,
        twitch_display_name,
        twitch_display_picture,
        twitch_email,
      });
    }

    return await this.usersService.linkTwitchUserData(email, {
      twitch_user_id,
      twitch_display_name,
      twitch_display_picture,
      twitch_email,
    });
  }

  async processUserTwitchVideos(
    access_token: string,
    email: string,
    twitch_user_id: string,
  ) {
    const user = await this.usersService.findUser({ email });

    const videos = await this.getTwitchUserVideos({
      access_token,
      twitch_user_id,
    });

    if (videos.length > 0) {
      return await this.usersService.createTwitchVideos(user.id, videos);
    }
  }

  async processUserChannelInformation(
    access_token: string,
    email: string,
    twitch_user_id: string,
  ) {
    const followersCount = await this.getUserFollowers(
      access_token,
      twitch_user_id,
    );

    await this.processUserTwitchSubscribers(
      access_token,
      email,
      twitch_user_id,
      followersCount,
    );
  }

  async processUserTwitchSubscribers(
    access_token: string,
    email: string,
    twitch_user_id: string,
    followersCount: number,
  ): Promise<any> {
    const user = await this.usersService.findUser({ email });

    const {
      error,
      total: subscribersCount,
      subscribers,
    } = await this.getChannelSubscribers(access_token, twitch_user_id);

    if (error && error === 'channel not qualified') {
      return await this.usersService.updateTwitchUserData(email, {
        twitch_channel_qualified: false,
        twitch_followers_count: followersCount,
      });
    }

    await this.usersService.updateTwitchUserData(email, {
      twitch_channel_qualified: true,
      twitch_subscribers_count: subscribersCount,
      twitch_followers_count: followersCount,
    });

    if (subscribersCount > 0) {
      this.usersService.createTwitchSubscribers(user.id, subscribers);
    }
  }

  async processTopGamingStreams(access_token: string) {
    const topGames = await this.getTopGames(access_token);

    const game_streams = await topGames.map(async (game: any) => {
      const streams = await this.getTopGamingStreams(game.id, access_token);
      return {
        game: game.name,
        streams,
      };
    });

    // Wait for all game_streams to be fetched completely then return them
    return await Promise.all(game_streams).then((result) => result);
  }

  async getUserOAuthToken(code: string): Promise<any> {
    let redirectUri = `${process.env.HOST}/twitch/auth`;

    if (process.env.NODE_ENV === 'development')
      redirectUri = `${process.env.HOST}:${process.env.PORT}/twitch/auth`;

    const res = this.httpService.post(
      `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&code=${code}&grant_type=authorization_code&redirect_uri=${redirectUri}`,
    );
    const data = await res.pipe(map((response) => response.data)).toPromise();

    return data.access_token;
  }

  async getTwitchUserData({
    access_token,
    user_id,
  }: {
    access_token?: string;
    user_id?: string;
  }): Promise<any> {
    let url = `https://api.twitch.tv/helix/users?id=${user_id}`;
    let headerToken = `Bearer ${process.env.TWITCH_APP_ACCESS_TOKEN}`;

    if (access_token) {
      url = `https://api.twitch.tv/helix/users`;
      headerToken = `Bearer ${access_token}`;
    }

    const res = this.httpService.get(url, {
      headers: {
        Authorization: headerToken,
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

  async getTopGames(access_token: string) {
    const res = this.httpService.get(`https://api.twitch.tv/helix/games/top`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Client-Id': process.env.TWITCH_CLIENT_ID,
      },
    });

    const top_games = await res
      .pipe(map((response) => response.data.data))
      .toPromise();

    return top_games.map((game: any) => {
      return {
        id: game.id,
        name: game.name,
      };
    });
  }

  async getTopGamingStreams(game_id: string, access_token: string) {
    const streamCount = 8;
    const res = this.httpService.get(
      `https://api.twitch.tv/helix/streams?game_id=${game_id}&first=${streamCount}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Client-Id': process.env.TWITCH_CLIENT_ID,
        },
      },
    );

    const top_gaming_streams = await res
      .pipe(map((response) => response.data.data))
      .toPromise();

    return top_gaming_streams;
  }

  async getUserFollowers(access_token: string, user_id: string) {
    try {
      const res = this.httpService.get(
        `https://api.twitch.tv/helix/users/follows?to_id=${user_id}`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
            'Client-Id': process.env.TWITCH_CLIENT_ID,
          },
        },
      );

      const totalFollowers = await res
        .pipe(map((response) => response.data.total))
        .toPromise();

      return totalFollowers;
    } catch (error) {
      console.log(error.response.data);
      return error.response.data.message;
    }
  }

  async getChannelSubscribers(
    access_token: string,
    broadcaster_id: string,
  ): Promise<any> {
    try {
      const res = this.httpService.get(
        `https://api.twitch.tv/helix/subscriptions?broadcaster_id=${broadcaster_id}&first=10`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
            'Client-Id': process.env.TWITCH_CLIENT_ID,
          },
        },
      );

      const { data, total } = await res
        .pipe(map((response) => response.data))
        .toPromise();

      // const { data, total } = mockSubscribers;

      const subscribersPromise = data.map(async (subscriber: any) => {
        const { twitch_display_picture } = await this.getTwitchUserData({
          user_id: subscriber.user_id,
        });

        return {
          twitch_id: subscriber.broadcaster_id,
          subscriber_id: subscriber.user_id,
          subscriber_name: subscriber.user_name,
          subscriber_display_picture: twitch_display_picture,
          is_gift: subscriber.is_gift,
        };
      });

      const subscribers = await Promise.all(subscribersPromise).then(
        (result) => result,
      );

      return {
        subscribers,
        total,
      };
    } catch (error) {
      console.log(error.response.data);
      return {
        error: 'channel not qualified',
      };
    }
  }
}
