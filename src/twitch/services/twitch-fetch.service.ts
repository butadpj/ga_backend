/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SearchChannelInterface } from '@twitch/interfaces/SearchChannelsInterface';
import { StreamInterface } from '@twitch/interfaces/StreamInterface';

import { lastValueFrom } from 'rxjs';

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

    const { data: userTwitchData } = await lastValueFrom(
      this.httpService.get(url, {
        headers: {
          Authorization: headerToken,
          'Client-Id': process.env.TWITCH_CLIENT_ID,
        },
      }),
    );

    const {
      id: twitch_user_id,
      display_name: twitch_display_name,
      profile_image_url: twitch_display_picture,
      email: twitch_email,
    } = userTwitchData.data[0];

    return {
      twitch_user_id,
      twitch_display_name,
      twitch_display_picture,
      twitch_email,
    };
  }

  async fetchUserTwitchVideos({ access_token, twitch_user_id }): Promise<any> {
    const { data: userTwitchVideos } = await lastValueFrom(
      this.httpService.get(
        `https://api.twitch.tv/helix/videos?user_id=${twitch_user_id}`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
            'Client-Id': process.env.TWITCH_CLIENT_ID,
          },
        },
      ),
    );

    return userTwitchVideos.data;
  }

  async fetchChannelSubscribers(
    access_token: string,
    broadcaster_id: string,
  ): Promise<any> {
    try {
      const { data: channelSubscribers } = await lastValueFrom(
        this.httpService.get(
          `https://api.twitch.tv/helix/subscriptions?broadcaster_id=${broadcaster_id}&first=10`,
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
              'Client-Id': process.env.TWITCH_CLIENT_ID,
            },
          },
        ),
      );

      const { data, total } = channelSubscribers;

      // const { data, total } = mockSubscribers;

      const mappedChannelSubscribersPromises = data.map(
        async (subscriber: any) => {
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
        },
      );

      const subscribers = await Promise.all(
        mappedChannelSubscribersPromises,
      ).then((result) => result);

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

  async fetchTopGames(
    access_token: string,
  ): Promise<Array<{ id: string; name: string }>> {
    try {
      const { data: topGames } = await lastValueFrom(
        this.httpService.get(`https://api.twitch.tv/helix/games/top`, {
          headers: {
            Authorization: `Bearer ${access_token}`,
            'Client-Id': process.env.TWITCH_CLIENT_ID,
          },
        }),
      );

      return topGames.data.map((game: any) => {
        return {
          id: game.id,
          name: game.name,
        };
      });
    } catch (error) {
      if (error.response.data) {
        if (error.response.data.status === 401) {
          throw new UnauthorizedException(error.response.data.message);
        }
      }

      throw error;
    }
  }

  async fetchTopGamingStreams(
    game_id: string,
    access_token: string,
    streamCount: number,
  ): Promise<Array<StreamInterface>> {
    try {
      const { data: topGamingStreams } = await lastValueFrom(
        this.httpService.get(
          `https://api.twitch.tv/helix/streams?game_id=${game_id}&first=${streamCount}`,
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
              'Client-Id': process.env.TWITCH_CLIENT_ID,
            },
          },
        ),
      );

      return topGamingStreams.data;
    } catch (error) {
      if (error.response.data) {
        if (error.response.data.status === 401) {
          throw new UnauthorizedException(error.response.data.message);
        }
      }

      throw error;
    }
  }

  async fetchStreamsBySearchQuery(
    query: string,
    access_token: string,
    resultsCount: number,
  ): Promise<Array<{ id: string; user_login: string }>> {
    try {
      const { data: searchStreams } = await lastValueFrom(
        this.httpService.get(
          `https://api.twitch.tv/helix/search/channels?query=${query}&live_only=true&first=${resultsCount}`,
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
              'Client-Id': process.env.TWITCH_CLIENT_ID,
            },
          },
        ),
      );

      const mappedSearchedStreams = searchStreams.data.map((stream: any) => {
        return {
          id: stream.id,
          user_login: stream.broadcaster_login,
        };
      });

      return mappedSearchedStreams;
    } catch (error) {
      if (error.response.data) {
        if (error.response.data.status === 401) {
          throw new UnauthorizedException(error.response.data.message);
        }
      }

      throw error;
    }
  }

  async fetchSearchChannels(
    query: string,
    access_token: string,
    resultCount: number,
  ): Promise<Array<SearchChannelInterface>> {
    try {
      const { data: searchChannels } = await lastValueFrom(
        this.httpService.get(
          `https://api.twitch.tv/helix/search/channels?query=${query}&first=${resultCount}`,
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
              'Client-Id': process.env.TWITCH_CLIENT_ID,
            },
          },
        ),
      );

      return searchChannels.data;
    } catch (error) {
      if (error.response.data) {
        if (error.response.data.status === 401) {
          throw new UnauthorizedException(error.response.data.message);
        }
      }

      throw error;
    }
  }

  async fetchStreamDetailsByUser(
    user_login: string,
    access_token: string,
  ): Promise<StreamInterface> {
    try {
      const { data: streamByUser } = await lastValueFrom(
        this.httpService.get(
          `https://api.twitch.tv/helix/streams?user_login=${user_login}&first=1`,
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
              'Client-Id': process.env.TWITCH_CLIENT_ID,
            },
          },
        ),
      );

      const stream = streamByUser.data[0];

      if (!stream) {
        throw new BadRequestException(`User-${user_login} is not live`);
      }

      return {
        id: stream.id,
        user_login: stream.user_login,
        user_name: stream.user_name,
        title: stream.title,
        viewer_count: stream.viewer_count,
        thumbnail_url: stream.thumbnail_url,
      };
    } catch (error) {
      if (error.response.data) {
        if (error.response.data.status === 401) {
          throw new UnauthorizedException(error.response.data.message);
        }
      }

      throw error;
    }
  }

  async fetchUserTotalFollowers(access_token: string, user_id: string) {
    try {
      const { data: followers } = await lastValueFrom(
        this.httpService.get(
          `https://api.twitch.tv/helix/users/follows?to_id=${user_id}`,
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
              'Client-Id': process.env.TWITCH_CLIENT_ID,
            },
          },
        ),
      );

      return followers.total;
    } catch (error) {
      if (error.response.data) {
        if (error.response.data.status === 401) {
          throw new UnauthorizedException(error.response.data.message);
        }
      }

      throw error;
    }
  }

  async fetchTwitchOAuthToken(code: string): Promise<any> {
    try {
      let redirectUri = `${process.env.HOST}/twitch/auth`;

      if (process.env.NODE_ENV === 'development')
        redirectUri = `${process.env.HOST}:${process.env.PORT}/twitch/auth`;

      const { data: OAuthToken } = await lastValueFrom(
        this.httpService.post(
          `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&code=${code}&grant_type=authorization_code&redirect_uri=${redirectUri}`,
        ),
      );

      return OAuthToken;
    } catch (error) {
      const axiosError = error.response?.data;

      console.error(axiosError);
    }
  }

  async fetchAppAccessToken(): Promise<{
    access_token: string;
    expires_in: number;
    token_type: string;
  }> {
    const { data } = await lastValueFrom(
      this.httpService.post(
        `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
      ),
    );

    return data;
  }
}
