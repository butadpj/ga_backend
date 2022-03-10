import { ForbiddenException, Injectable } from '@nestjs/common';
import { UsersYoutubeDataService } from '@users/services/users-youtube-data.service';
import { UsersService } from '@users/services/users.service';
import { separateByComma } from 'src/utils';
import { YoutubeFetchService } from './youtube-fetch.service';

const gameNames = [
  'Garena Free Fire',
  'Minecraft',
  'Apex Legends',
  'GTA V',
  'Mobile Legends: Bang Bang',
  'Pokémon Legends: Arceus',
  'Battlegrounds Mobile India',
  'Fortnite',
  'Roblox',
  'Lineage W',
  'Valorant',
  'Garena Free Fire MAX',
  'World of Tanks',
  'Gates of Olympus Slot Pragmatic',
  'Maple Story',
  'Scary Teacher 3D',
  'PUBG MOBILE',
];

@Injectable()
export class YoutubeService {
  constructor(
    private usersService: UsersService,
    private usersYoutubeDataService: UsersYoutubeDataService,
    private youtubeFetchService: YoutubeFetchService,
  ) {}

  async processYoutubeAuth(code: string, email: string) {
    const access_token = await this.youtubeFetchService.fetchYoutubeOAuthToken(
      code,
    );
    if (!access_token) throw new Error('Invalid or undefined access_token');

    await this.processUserYoutubeData(access_token, email);

    await this.processUserChannelInformation(access_token, email);

    this.usersYoutubeDataService.autoUnlinkYoutubeAccount(email);
  }

  async processUserYoutubeData(
    access_token: string,
    email: string,
  ): Promise<any> {
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

    const user = await this.usersService.findUser({ email });

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
      email,
      youtubeData,
    );
  }

  async processTopGamingStreams(api_key: string) {
    const topGamingStreams = await this.getTopLiveGames(api_key, gameNames);

    return topGamingStreams.map((gamingStream) => {
      const streams = gamingStream.streams.map((stream: any) => {
        return {
          id: stream.id,
          title: stream.snippet.title,
          thumbnail_url: stream.snippet.thumbnails.medium.url,
          channel_name: stream.snippet.channelTitle,
          viewer_count: stream.liveStreamingDetails.concurrentViewers,
        };
      });

      return { game: gamingStream.game, streams };
    });
  }

  async processUserChannelInformation(access_token: string, email: string) {
    const user = await this.usersService.findUser({ email });

    const subscribers = await this.youtubeFetchService.fetchChannelSubscribers(
      access_token,
    );

    if (subscribers.length > 0) {
      this.usersYoutubeDataService.saveTwitchSubscribers(user.id, subscribers);
    }
  }

  async getTopLiveGames(
    api_key: string,
    games: Array<string>,
  ): Promise<Array<{ game: string; streams: any }>> {
    try {
      const topLiveGamesPromises = games.map(async (game) => {
        const searchedLiveStreams =
          await this.youtubeFetchService.fetchLiveVideosBySearchQuery(
            api_key,
            game,
          );

        const streamVideoIDs = await searchedLiveStreams.items.map(
          (stream: any) => stream.id.videoId,
        );

        const streamVideos =
          await this.youtubeFetchService.fetchVideoDetailsById(
            api_key,
            separateByComma(streamVideoIDs),
          );

        return { game, streams: streamVideos };
      });

      return await Promise.all(topLiveGamesPromises).then((result) => result);
    } catch (error) {
      console.log(error.response.data.error.message);
      if (error.response) {
        throw new ForbiddenException(
          {
            statusCode: 403,
            message: 'Quota limit reached',
          },
          'quotaExceeded',
        );
      }
      throw new Error(error.message);
    }
  }
}
