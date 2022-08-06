import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersTwitchDataService } from '@users/services/users-twitch-data.service';
import { UsersService } from '@users/services/users.service';
import { TwitchFetchService } from './twitch-fetch.service';

@Injectable()
export class TwitchService {
  constructor(
    private usersService: UsersService,
    public usersTwitchDataService: UsersTwitchDataService,

    private twitchFetchService: TwitchFetchService,
  ) {}

  async getAppAccessToken() {
    const { access_token } =
      await this.twitchFetchService.fetchAppAccessToken();

    return access_token;
  }

  async processTwitchAuth(code: string, email: string): Promise<any> {
    try {
      const { access_token } =
        await this.twitchFetchService.fetchTwitchOAuthToken(code);

      if (!access_token) throw new Error('Invalid or undefined access_token');

      const { twitch_user_id } = await this.processUserTwitchData(
        access_token,
        email,
      );

      // await this.processUserTwitchVideos(access_token, email, twitch_user_id);

      await this.processUserChannelInformation(
        access_token,
        email,
        twitch_user_id,
      );

      this.usersTwitchDataService.autoUnlinkTwitchAccount(email);
    } catch (error) {
      throw error;
    }
  }

  async processUserTwitchData(access_token: string, email: string) {
    const user = await this.usersService.findUser({ email });

    if (!user)
      throw new NotFoundException(
        "Error processing user's twitch data. User doesn't exist",
      );

    const {
      twitch_user_id,
      twitch_display_name,
      twitch_display_picture,
      twitch_email,
    } = await this.twitchFetchService.fetchUserTwitchData({ access_token });

    const twitchData = {
      twitch_user_id,
      twitch_display_name,
      twitch_display_picture,
      twitch_email,
    };

    if (!user.displayName)
      await this.usersService.updateUserInfo(user.id, {
        displayName: twitch_display_name,
      });

    const userHasExistingTwitchAccount =
      await this.usersTwitchDataService.hasExistingTwitchAccount(user.id);

    if (userHasExistingTwitchAccount) {
      return await this.usersTwitchDataService.updateUserTwitchData(
        user.id,
        twitchData,
      );
    }

    return await this.usersTwitchDataService.linkUserTwitchData(
      user.id,
      twitchData,
    );
  }

  async processUserTwitchVideos(
    access_token: string,
    email: string,
    twitch_user_id: string,
  ) {
    const user = await this.usersService.findUser({ email });

    if (!user)
      throw new NotFoundException(
        "Error processing user's twitch videos. User doesn't exist",
      );

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
    const followersCount =
      await this.twitchFetchService.fetchUserTotalFollowers(
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

    if (!user)
      throw new NotFoundException(
        "Error processing user's channel's subscribers. User doesn't exist",
      );

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

  async processTopGamingStreams({
    access_token,
    streamCount,
  }: {
    access_token: string;
    streamCount?: number;
  }) {
    try {
      const topGames = await this.twitchFetchService.fetchTopGames(
        access_token,
      );

      const game_streams = topGames.map(async (game: any) => {
        const streams = await this.twitchFetchService.fetchTopGamingStreams(
          game.id,
          access_token,
          streamCount,
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

  async processSearchResults({
    query,
    access_token,
    searchResultsCount,
    searchSuggestionsCount,
  }: {
    query: string;
    access_token: string;
    searchResultsCount: number;
    searchSuggestionsCount: number;
  }) {
    const searchStreams =
      await this.twitchFetchService.fetchStreamsBySearchQuery(
        query,
        access_token,
        searchResultsCount,
      );

    const streamVideosPromises = searchStreams.map(async (stream) => {
      return await this.twitchFetchService.fetchStreamDetailsByUser(
        stream.user_login,
        access_token,
      );
    });

    const streamVideos = await Promise.all(streamVideosPromises).then(
      (result) => result,
    );

    const searchResults = await this.twitchFetchService.fetchSearchChannels(
      query,
      access_token,
      searchResultsCount,
    );

    const searchSuggestions = await this.twitchFetchService.fetchSearchChannels(
      query,
      access_token,
      searchSuggestionsCount,
    );

    const mappedSearchResultsPromises = searchResults.map(async (channel) => {
      if (channel.is_live) {
        const liveStream =
          await this.twitchFetchService.fetchStreamDetailsByUser(
            channel.broadcaster_login,
            access_token,
          );

        return {
          id: liveStream.id,
          title: liveStream.title,
          thumbnail_url: liveStream.thumbnail_url,
          user_name: liveStream.user_name,
          viewer_count: liveStream.viewer_count,
          is_live: true,
        };
      }

      const channelTotalFollowers =
        await this.twitchFetchService.fetchUserTotalFollowers(
          access_token,
          channel.id,
        );

      return {
        id: channel.id,
        thumbnail_url: channel.thumbnail_url,
        user_name: channel.display_name,
        total_followers: channelTotalFollowers,
        is_live: false,
      };
    });

    const mappedSearchSuggestionsPromises = searchSuggestions.map(
      async (channel) => {
        if (channel.is_live) {
          return {
            id: channel.id,
            thumbnail_url: channel.thumbnail_url,
            user_name: channel.display_name,
            is_live: true,
          };
        }

        return {
          id: channel.id,
          thumbnail_url: channel.thumbnail_url,
          user_name: channel.display_name,
          is_live: false,
        };
      },
    );

    const mappedSearchResults = await Promise.all(
      mappedSearchResultsPromises,
    ).then((result) => result);

    const mappedSearchSuggestions = await Promise.all(
      mappedSearchSuggestionsPromises,
    ).then((result) => result);

    return {
      query,
      result: {
        streams: streamVideos,
        channels: mappedSearchResults.filter((channel) => !channel.is_live),
      },
      suggestions: {
        live: mappedSearchSuggestions.filter((channel) => channel.is_live),
        not_live: mappedSearchSuggestions.filter((channel) => !channel.is_live),
      },
    };
  }
}
