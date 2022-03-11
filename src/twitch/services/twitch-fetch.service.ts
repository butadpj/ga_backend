/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

import { map } from 'rxjs';

import { mockSubscribers } from 'src/utils/mockData';

@Injectable()
export class TwitchFetchService {
  constructor(private httpService: HttpService) {}

  async fetchUserTwitchData({
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

  async fetchUserTwitchVideos({ access_token, twitch_user_id }): Promise<any> {
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

  async fetchUserFollowers(access_token: string, user_id: string) {
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

  async fetchChannelSubscribers(
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
        const { twitch_display_picture } = await this.fetchUserTwitchData({
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

  async fetchTopGames(access_token: string) {
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

  async fetchTopGamingStreams(game_id: string, access_token: string) {
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

  async fetchStreamByUser(
    user_login: string,
    access_token: string,
  ): Promise<any> {
    const result = this.httpService.get(
      `https://api.twitch.tv/helix/streams?user_login=${user_login}&first=1`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Client-Id': process.env.TWITCH_CLIENT_ID,
        },
      },
    );

    const streamByUser = await result
      .pipe(map((response) => response.data.data))
      .toPromise();

    return streamByUser[0];
  }

  async fetchSearchedLiveChannels(query: string, access_token: string) {
    const result = this.httpService.get(
      `https://api.twitch.tv/helix/search/channels?query=${query}&first=10&live_only=true`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Client-Id': process.env.TWITCH_CLIENT_ID,
        },
      },
    );

    return await result.pipe(map((response) => response.data.data)).toPromise();
  }

  async fetchTwitchOAuthToken(code: string): Promise<any> {
    let redirectUri = `${process.env.HOST}/twitch/auth`;

    if (process.env.NODE_ENV === 'development')
      redirectUri = `${process.env.HOST}:${process.env.PORT}/twitch/auth`;

    const res = this.httpService.post(
      `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&code=${code}&grant_type=authorization_code&redirect_uri=${redirectUri}`,
    );
    const data = await res.pipe(map((response) => response.data)).toPromise();

    return data.access_token;
  }
}
