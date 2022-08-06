import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersYoutubeDataService } from '@users/services/users-youtube-data.service';
import { UsersService } from '@users/services/users.service';
import { StreamInterface } from '@youtube/interfaces/StreamInterface';
import { separateByComma } from '@utils/index';
import { YoutubeFetchService } from './youtube-fetch.service';

@Injectable()
export class YoutubeService {
  constructor(
    private usersService: UsersService,
    public usersYoutubeDataService: UsersYoutubeDataService,
    private youtubeFetchService: YoutubeFetchService,
  ) {}

  async processYoutubeAuth(code: string, email: string) {
    try {
      const { access_token } =
        await this.youtubeFetchService.fetchYoutubeOAuthToken(code);

      if (!access_token) throw new Error('Invalid or undefined access_token');

      await this.processUserYoutubeData(access_token, email);

      await this.processUserChannelInformation(access_token, email);

      this.usersYoutubeDataService.autoUnlinkYoutubeAccount(email);
    } catch (error) {
      throw error;
    }
  }

  async processUserYoutubeData(
    access_token: string,
    email: string,
  ): Promise<any> {
    try {
      const user = await this.usersService.findUser({ email });

      if (!user)
        throw new NotFoundException(
          "Error processing user's youtube data. User doesn't exist",
        );

      const {
        id: youtube_user_id,
        snippet,
        statistics,
      } = await this.youtubeFetchService.fetchUserYoutubeData(access_token);

      const youtubeData = {
        youtube_user_id,
        youtube_display_name: snippet.title,
        youtube_display_picture: snippet.thumbnails.medium.url,
        youtube_subscribers_count: statistics.subscriberCount,
      };

      const userHasExistingYoutubeAccount =
        await this.usersYoutubeDataService.hasExistingYoutubeAccount(user.id);

      if (!user.displayName)
        await this.usersService.updateUserInfo(user.id, {
          displayName: youtubeData.youtube_display_name,
        });

      if (userHasExistingYoutubeAccount) {
        return await this.usersYoutubeDataService.updateUserYoutubeData(
          user.id,
          youtubeData,
        );
      }

      return await this.usersYoutubeDataService.linkUserYoutubeData(
        user.id,
        youtubeData,
      );
    } catch (error) {
      throw error;
    }
  }

  async processTopGamingStreams({
    apiKey,
    games,
    streamCount,
  }: {
    apiKey: string;
    games: Array<string>;
    streamCount: number;
  }) {
    const topGamingStreams = await this.getTopLiveGames({
      apiKey,
      games,
      streamCount,
    });

    const mappedTopGamingStreams = topGamingStreams.map((gamingStream) => {
      const streams = gamingStream.streams.map((stream) => {
        return {
          id: stream.id,
          title: stream.title,
          thumbnail_url: stream.thumbnail_url,
          channel_name: stream.channel_name,
          viewer_count: stream.viewer_count,
        };
      });

      return { game: gamingStream.game, streams };
    });

    return mappedTopGamingStreams;
  }

  async processUserChannelInformation(access_token: string, email: string) {
    const user = await this.usersService.findUser({ email });

    if (!user)
      throw new NotFoundException(
        "Error processing user's twitch videos. User doesn't exist",
      );

    try {
      const subscribers =
        await this.youtubeFetchService.fetchChannelSubscribers(access_token);

      if (subscribers.length > 0) {
        this.usersYoutubeDataService.saveYoutubeSubscribers(
          user.id,
          subscribers,
        );
      }
    } catch (error) {
      throw error;
    }
  }

  async getTopLiveGames({
    apiKey,
    games,
    streamCount,
  }: {
    apiKey: string;
    games: Array<string>;
    streamCount: number;
  }): Promise<Array<{ game: string; streams: Array<StreamInterface> }>> {
    try {
      const topLiveGamesPromises = games.map(async (game) => {
        const searchStreams =
          await this.youtubeFetchService.fetchStreamsBySearchQuery({
            apiKey,
            query: game,
            streamCount,
          });

        const searchStreamIds = searchStreams.map((stream) => stream.id);

        const streamVideos =
          await this.youtubeFetchService.fetchStreamDetailsById(
            apiKey,
            separateByComma(searchStreamIds),
          );

        return { game, streams: streamVideos };
      });

      return await Promise.all(topLiveGamesPromises).then((result) => result);
    } catch (error) {
      throw error;
    }
  }

  async processSearchResults({
    query,
    apiKey,
    searchResultsCount,
    searchSuggestionsCount,
  }: {
    query: string;
    apiKey: string;
    searchResultsCount: number;
    searchSuggestionsCount: number;
  }) {
    const searchStreams =
      await this.youtubeFetchService.fetchStreamsBySearchQuery({
        apiKey,
        query,
        streamCount: searchResultsCount,
      });

    const searchStreamIds = searchStreams.map((stream) => stream.id);

    const streamVideos = await this.youtubeFetchService.fetchStreamDetailsById(
      apiKey,
      separateByComma(searchStreamIds),
    );

    const searchResults = await this.getSearchResults(
      query,
      apiKey,
      searchResultsCount,
    );

    const searchSuggestions = await this.getSearchSuggestions(
      query,
      apiKey,
      searchSuggestionsCount,
    );

    return {
      query,
      result: {
        streams: streamVideos,
        channels: searchResults.filter((channel) => !channel.is_live),
      },
      suggestions: {
        live: searchSuggestions.filter((channel) => channel.is_live),
        not_live: searchSuggestions.filter((channel) => !channel.is_live),
      },
    };
  }

  async getSearchResults(
    query: string,
    apiKey: string,
    searchResultsCount: number,
  ) {
    try {
      const searchResults = await this.youtubeFetchService.fetchSearchChannels(
        query,
        apiKey,
        searchResultsCount,
      );

      const mappedSearchResultsPromises = searchResults.map(async (channel) => {
        if (channel.is_live) {
          const liveStream =
            await this.youtubeFetchService.fetchStreamByChannel(
              channel.id,
              apiKey,
            );

          return {
            id: liveStream.id,
            title: liveStream.title,
            thumbnail_url: liveStream.thumbnail_url,
            channel_id: liveStream.channel_id,
            channel_name: liveStream.channel_name,
            viewer_count: liveStream.viewer_count,
            is_live: true,
          };
        }

        const notLiveResult: {
          id: string;
          thumbnail_url: string;
          channel_name: string;
          is_live: boolean;
          total_subscribers?: number;
          hidden_subscribers?: boolean;
        } = {
          id: channel.id,
          thumbnail_url: channel.thumbnail_url,
          channel_name: channel.title,
          is_live: false,
        };

        const { subscribersCount, subscribersAreHidden } =
          await this.youtubeFetchService.fetchChannelTotalSubscribers(
            channel.id,
            apiKey,
          );

        if (subscribersAreHidden) {
          notLiveResult.total_subscribers = null;
          notLiveResult.hidden_subscribers = true;
        } else {
          notLiveResult.total_subscribers = subscribersCount;
          notLiveResult.hidden_subscribers = false;
        }

        return notLiveResult;
      });

      const mappedSearchResults = await Promise.all(
        mappedSearchResultsPromises,
      ).then((result) => result);

      return mappedSearchResults;
    } catch (error) {
      throw error;
    }
  }

  async getSearchSuggestions(
    query: string,
    apiKey: string,
    searchSuggestionsCount: number,
  ) {
    const searchSuggestions =
      await this.youtubeFetchService.fetchSearchChannels(
        query,
        apiKey,
        searchSuggestionsCount,
      );

    const mappedSearchSuggestionsPromises = searchSuggestions.map(
      async (channel) => {
        if (channel.is_live) {
          const liveStream =
            await this.youtubeFetchService.fetchStreamByChannel(
              channel.id,
              apiKey,
            );

          return {
            id: liveStream.id,
            thumbnail_url: channel.thumbnail_url,
            channel_name: channel.title,
            is_live: true,
          };
        }

        return {
          id: channel.id,
          thumbnail_url: channel.thumbnail_url,
          channel_name: channel.title,
          is_live: false,
        };
      },
    );

    const mappedSearchSuggestions = await Promise.all(
      mappedSearchSuggestionsPromises,
    ).then((result) => result);

    return mappedSearchSuggestions;
  }
}
