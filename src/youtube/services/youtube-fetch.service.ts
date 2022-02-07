import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { map } from 'rxjs';
import { separateByComma } from 'src/utils';

@Injectable()
export class YoutubeFetchService {
  constructor(private httpService: HttpService) {}

  async fetchUserYoutubeData(access_token: string): Promise<any> {
    try {
      const part = separateByComma(['snippet', 'statistics']);
      const res = this.httpService.get(
        `https://www.googleapis.com/youtube/v3/channels?part=${part}&mine=true`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        },
      );

      return await res
        .pipe(map((response) => response.data.items[0]))
        .toPromise();
    } catch (error) {
      console.log(error.response.data);
    }
  }

  async fetchLiveVideosBySearchQuery(
    api_key: string,
    query: string,
  ): Promise<any> {
    const searchedVideo = this.httpService.get(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&eventType=live&maxResults=8&order=viewCount&key=${api_key}`,
    );

    const data = await searchedVideo
      .pipe(map((response) => response.data))
      .toPromise();

    return data;
  }

  async fetchVideoDetailsById(api_key: string, video_id: string) {
    const part = separateByComma(['snippet', 'liveStreamingDetails']);

    const streamVideoDetailsResponse = this.httpService.get(
      `https://www.googleapis.com/youtube/v3/videos?part=${part}&id=${video_id}&key=${api_key}`,
    );

    const streamVideoDetailsData = await streamVideoDetailsResponse
      .pipe(map((response) => response.data))
      .toPromise();

    return streamVideoDetailsData.items;
  }

  async fetchChannelSubscribers(access_token: string): Promise<any> {
    try {
      const part = separateByComma(['subscriberSnippet']);

      const res = this.httpService.get(
        `https://www.googleapis.com/youtube/v3/subscriptions?part=${part}&mySubscribers=true&maxResults=10`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        },
      );

      const subscribersData = await res
        .pipe(map((response) => response.data.items))
        .toPromise();

      return subscribersData.map(({ subscriberSnippet }: any) => {
        return {
          subscriber_id: subscriberSnippet.channelId,
          subscriber_name: subscriberSnippet.title,
          subscriber_display_picture: subscriberSnippet.thumbnails.medium.url,
        };
      });
    } catch (error) {
      console.log(error);
    }
  }

  async fetchYoutubeOAuthToken(code: string): Promise<any> {
    let redirectUri = `${process.env.HOST}/youtube/auth`;

    if (process.env.NODE_ENV === 'development')
      redirectUri = `${process.env.HOST}:${process.env.PORT}/youtube/auth`;

    const res = this.httpService.post(
      `https://oauth2.googleapis.com/token?client_id=${process.env.YOUTUBE_CLIENT_ID}&client_secret=${process.env.YOUTUBE_CLIENT_SECRET}&code=${code}&grant_type=authorization_code&redirect_uri=${redirectUri}`,
    );
    const data = await res.pipe(map((response) => response.data)).toPromise();

    return data.access_token;
  }
}
