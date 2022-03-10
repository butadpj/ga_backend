import { Injectable } from '@nestjs/common';
import { UsersTwitchDataService } from '@users/services/users-twitch-data.service';
import { UsersService } from '@users/services/users.service';
import { TwitchFetchService } from './twitch-fetch.service';

@Injectable()
export class TwitchService {
  constructor(
    private usersService: UsersService,
    private usersTwitchDataService: UsersTwitchDataService,

    private twitchFetchService: TwitchFetchService,
  ) {}

  async processTwitchAuth(code: string, email: string): Promise<any> {
    const access_token = await this.twitchFetchService.fetchTwitchOAuthToken(
      code,
    );
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

    this.usersTwitchDataService.autoUnlinkTwitchAccount(email);
  }

  async processUserTwitchData(access_token: string, email: string) {
    const {
      twitch_user_id,
      twitch_display_name,
      twitch_display_picture,
      twitch_email,
    } = await this.twitchFetchService.fetchUserTwitchData({ access_token });

    const user = await this.usersService.findUser({ email });

    if (!user.displayName)
      await this.usersService.updateUserInfo(user.id, {
        displayName: twitch_display_name,
      });

    const userHasExistingTwitchAccount =
      await this.usersTwitchDataService.hasExistingTwitchAccount(user.id);

    if (userHasExistingTwitchAccount) {
      return await this.usersTwitchDataService.updateUserTwitchData(user.id, {
        twitch_user_id,
        twitch_display_name,
        twitch_display_picture,
        twitch_email,
      });
    }

    return await this.usersTwitchDataService.linkUserTwitchData(email, {
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

    const videos = await this.twitchFetchService.fetchUserTwitchVideos({
      access_token,
      twitch_user_id,
    });

    if (videos.length > 0) {
      return await this.usersTwitchDataService.saveTwitchVideos(
        user.id,
        videos,
      );
    }
  }

  async processUserChannelInformation(
    access_token: string,
    email: string,
    twitch_user_id: string,
  ) {
    const followersCount = await this.twitchFetchService.fetchUserFollowers(
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
    } = await this.twitchFetchService.fetchChannelSubscribers(
      access_token,
      twitch_user_id,
    );

    if (error && error === 'channel not qualified') {
      return await this.usersTwitchDataService.updateUserTwitchData(user.id, {
        twitch_channel_qualified: false,
        twitch_followers_count: followersCount,
      });
    }

    await this.usersTwitchDataService.updateUserTwitchData(user.id, {
      twitch_channel_qualified: true,
      twitch_subscribers_count: subscribersCount,
      twitch_followers_count: followersCount,
    });

    if (subscribersCount > 0) {
      this.usersTwitchDataService.saveTwitchSubscribers(user.id, subscribers);
    }
  }

  async processTopGamingStreams(access_token: string) {
    try {
      const topGames = await this.twitchFetchService.fetchTopGames(
        access_token,
      );

      const game_streams = await topGames.map(async (game: any) => {
        const streams = await this.twitchFetchService.fetchTopGamingStreams(
          game.id,
          access_token,
        );
        return {
          game: game.name,
          streams,
        };
      });

      // Wait for all game_streams to be fetched completely then return them
      return await Promise.all(game_streams).then((result) => result);
    } catch (error) {
      console.log(error.response);
    }
  }
}
