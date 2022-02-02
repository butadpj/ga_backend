import { HttpService } from '@nestjs/axios';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { UsersService } from '@users/users.service';
import { map } from 'rxjs';
import { separateByComma } from '../utils';

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
    private httpService: HttpService,
    private usersService: UsersService,
  ) {}

  async processYoutubeAuth(code: string, email: string) {
    const access_token = await this.getUserOAuthToken(code);
    if (!access_token) throw new Error('Invalid or undefined access_token');

    // return await this.searchLiveVideos(access_token, 'valorant');
  }

  async getUserOAuthToken(code: string): Promise<any> {
    let redirectUri = `${process.env.HOST}/youtube/auth`;

    if (process.env.NODE_ENV === 'development')
      redirectUri = `${process.env.HOST}:${process.env.PORT}/youtube/auth`;

    const res = this.httpService.post(
      `https://oauth2.googleapis.com/token?client_id=${process.env.YOUTUBE_CLIENT_ID}&client_secret=${process.env.YOUTUBE_CLIENT_SECRET}&code=${code}&grant_type=authorization_code&redirect_uri=${redirectUri}`,
    );
    const data = await res.pipe(map((response) => response.data)).toPromise();

    return data.access_token;
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

  async searchLiveVideos(api_key: string, query: string): Promise<any> {
    const searchedVideo = this.httpService.get(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&eventType=live&maxResults=8&order=viewCount&key=${api_key}`,
    );

    const data = await searchedVideo
      .pipe(map((response) => response.data))
      .toPromise();

    return data;
  }

  async getTopLiveGames(
    api_key: string,
    games: Array<string>,
  ): Promise<Array<{ game: string; streams: any }>> {
    try {
      const topLiveGamesPromises = games.map(async (game) => {
        const searchedLiveStreams = await this.searchLiveVideos(api_key, game);

        const streamVideoIDs = await searchedLiveStreams.items.map(
          (stream: any) => stream.id.videoId,
        );

        const streamVideos = await this.getVideoDetailsById(
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

  async getVideoDetailsById(api_key: string, video_id: string) {
    const part = separateByComma(['snippet', 'liveStreamingDetails']);

    const streamVideoDetailsResponse = this.httpService.get(
      `https://www.googleapis.com/youtube/v3/videos?part=${part}&id=${video_id}&key=${api_key}`,
    );

    const streamVideoDetailsData = await streamVideoDetailsResponse
      .pipe(map((response) => response.data))
      .toPromise();

    return streamVideoDetailsData.items;
  }
}
