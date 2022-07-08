import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { SearchChannelsInterface } from '@youtube/interfaces/SearchChannelsInterface';
import { lastValueFrom } from 'rxjs';
import { separateByComma } from '@utils/index';
import { StreamInterface } from '@youtube/interfaces/StreamInterface';

@Injectable()
export class YoutubeFetchService {
  constructor(private httpService: HttpService) {}

  async fetchUserYoutubeData(access_token: string): Promise<any> {
    try {
      const part = separateByComma(['snippet', 'statistics']);
      const { data: userYoutubeData } = await lastValueFrom(
        this.httpService.get(
          `https://www.googleapis.com/youtube/v3/channels?part=${part}&mine=true`,
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          },
        ),
      );

      return userYoutubeData.items[0];
    } catch (error) {
      if (error.response.data) {
        if (error.response.data.error.code === 403)
          throw new ForbiddenException('Quota limit reached');

        if (
          error.response.data.error.message ===
          'API key not valid. Please pass a valid API key.'
        ) {
          throw new BadRequestException('Api key is not valid');
        }
      }
    }
  }

  async fetchChannelSubscribers(access_token: string): Promise<any> {
    try {
      const part = separateByComma(['subscriberSnippet']);

      const { data: channelSubscribers } = await lastValueFrom(
        this.httpService.get(
          `https://www.googleapis.com/youtube/v3/subscriptions?part=${part}&mySubscribers=true&maxResults=10`,
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          },
        ),
      );

      const mappedChannelSubscribers = channelSubscribers.items.map(
        ({ subscriberSnippet }: any) => {
          return {
            subscriber_id: subscriberSnippet.channelId,
            subscriber_name: subscriberSnippet.title,
            subscriber_display_picture: subscriberSnippet.thumbnails.medium.url,
          };
        },
      );

      return mappedChannelSubscribers;
    } catch (error) {
      if (error.response.data) {
        if (error.response.data.error.code === 403)
          throw new ForbiddenException('Quota limit reached');

        if (
          error.response.data.error.message ===
          'API key not valid. Please pass a valid API key.'
        ) {
          throw new BadRequestException('Api key is not valid');
        }
      }
    }
  }

  async fetchStreamsBySearchQuery({
    apiKey,
    query,
    streamCount,
  }: {
    apiKey: string;
    query: string;
    streamCount: number;
  }): Promise<Array<{ id: string; channel_name: string }>> {
    try {
      const { data: searchStreams } = await lastValueFrom(
        this.httpService.get(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&eventType=live&maxResults=${streamCount}&order=viewCount&key=${apiKey}`,
        ),
      );

      const mappedSearchStreams = searchStreams.items.map(({ id, snippet }) => {
        return {
          id: id.videoId,
          channel_name: snippet.channelTitle,
        };
      });

      return mappedSearchStreams;
    } catch (error) {
      if (error.response?.data) {
        if (error.response.data.error.code === 403)
          throw new ForbiddenException('Quota limit reached');

        if (
          error.response.data.error.message ===
          'API key not valid. Please pass a valid API key.'
        ) {
          throw new BadRequestException('Api key is not valid');
        }
      }
    }
  }

  async fetchStreamDetailsById(
    apiKey: string,
    video_id: string,
  ): Promise<Array<StreamInterface>> {
    try {
      const part = separateByComma(['id', 'snippet', 'liveStreamingDetails']);

      const { data: streamDetails } = await lastValueFrom(
        this.httpService.get(
          `https://www.googleapis.com/youtube/v3/videos?part=${part}&id=${video_id}&key=${apiKey}`,
        ),
      );

      const mappedStreamDetails = streamDetails.items.map(
        ({ id, snippet, liveStreamingDetails }) => {
          return {
            id,
            title: snippet.title,
            thumbnail_url: snippet.thumbnails.medium.url,
            channel_id: snippet.channelId,
            channel_name: snippet.channelTitle,
            viewer_count: liveStreamingDetails.concurrentViewers,
          };
        },
      );

      return mappedStreamDetails;
    } catch (error) {
      if (error.response.data) {
        if (error.response.data.error.code === 403)
          throw new ForbiddenException('Quota limit reached');

        if (
          error.response.data.error.message ===
          'API key not valid. Please pass a valid API key.'
        ) {
          throw new BadRequestException('Api key is not valid');
        }
      }
    }
  }

  async fetchSearchChannels(
    query: string,
    apiKey: string,
    resultsCount: number,
  ): Promise<Array<SearchChannelsInterface>> {
    try {
      const { data: searchChannels } = await lastValueFrom(
        this.httpService.get(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=channel&channelType=any&maxResults=${resultsCount}&key=${apiKey}`,
        ),
      );

      const mappedSearchChannels = searchChannels.items.map(({ snippet }) => {
        const isLiveMapper = {
          live: true,
          upcoming: false,
          none: false,
        };

        return {
          title: snippet.title,
          id: snippet.channelId,
          is_live: isLiveMapper[snippet.liveBroadcastContent],
          thumbnail_url: snippet.thumbnails.default.url,
        };
      });

      return mappedSearchChannels;
    } catch (error) {
      if (error.response.data) {
        if (error.response.data.error.code === 403)
          throw new ForbiddenException('Quota limit reached');

        if (
          error.response.data.error.message ===
          'API key not valid. Please pass a valid API key.'
        ) {
          throw new BadRequestException('Api key is not valid');
        }
      }
    }
  }

  async fetchStreamByChannel(
    channelId: string,
    apiKey: string,
  ): Promise<StreamInterface> {
    try {
      const { data: stream } = await lastValueFrom(
        this.httpService.get(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&channelId=${channelId}&eventType=live&key=${apiKey}`,
        ),
      );

      if (stream.items.length === 0) {
        throw new BadRequestException(`Channel-${channelId} is not live`);
      }

      const videoId = stream.items[0].id.videoId;

      const streamByChannel = await this.fetchStreamDetailsById(
        apiKey,
        videoId,
      );

      return streamByChannel[0];
    } catch (error) {
      if (error.response.data) {
        if (error.response.data.error.code === 403)
          throw new ForbiddenException('Quota limit reached');

        if (
          error.response.data.error.message ===
          'API key not valid. Please pass a valid API key.'
        ) {
          throw new BadRequestException('Api key is not valid');
        }
      }

      throw error;
    }
  }

  async fetchChannelTotalSubscribers(
    channelId: string,
    apiKey: string,
  ): Promise<{ subscribersCount?: number; subscribersAreHidden: boolean }> {
    try {
      const { data: channelTotalSubscribers } = await lastValueFrom(
        this.httpService.get(
          `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${apiKey}`,
        ),
      );

      if (channelTotalSubscribers.items[0].statistics.hiddenSubscriberCount)
        return {
          subscribersAreHidden: true,
        };

      return {
        subscribersCount: Number(
          channelTotalSubscribers.items[0].statistics.subscriberCount,
        ),
        subscribersAreHidden: false,
      };
    } catch (error) {
      if (error.response.data) {
        if (error.response.data.error.code === 403)
          throw new ForbiddenException('Quota limit reached');

        if (
          error.response.data.error.message ===
          'API key not valid. Please pass a valid API key.'
        ) {
          throw new BadRequestException('Api key is not valid');
        }
      }
    }
  }

  async fetchYoutubeOAuthToken(code: string): Promise<any> {
    try {
      let redirectUri = `${process.env.HOST}/youtube/auth`;

      if (process.env.NODE_ENV === 'development')
        redirectUri = `${process.env.HOST}:${process.env.PORT}/youtube/auth`;

      const { data: OAuthToken } = await lastValueFrom(
        this.httpService.post(
          `https://oauth2.googleapis.com/token?client_id=${process.env.GOOGLE_CLIENT_ID}&client_secret=${process.env.GOOGLE_CLIENT_SECRET}&code=${code}&grant_type=authorization_code&redirect_uri=${redirectUri}`,
        ),
      );

      return OAuthToken;
    } catch (error) {
      if (error.response.data) {
        if (error.response.data.error.code === 403)
          throw new ForbiddenException('Quota limit reached');

        if (
          error.response.data.error.message ===
          'API key not valid. Please pass a valid API key.'
        ) {
          throw new BadRequestException('Api key is not valid');
        }
      }
    }
  }
}
