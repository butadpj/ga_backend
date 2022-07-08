export class YoutubeFetchServiceMock {
  async fetchYoutubeOAuthToken() {
    return {
      access_token: 'rfx2uswqe8l4g1mkagrvg5tv0ks3',
      expires_in: 14124,
      refresh_token: '5b93chm6hdve3mycz05zfzatkfdenfspp1h1ar2xxdalen01',
      scope: ['channel:moderate', 'chat:edit', 'chat:read'],
      token_type: 'bearer',
    };
  }

  async fetchStreamsBySearchQuery({ streamCount }: { streamCount: number }) {
    const getStreamsBasedOnStreamCount = new Array(streamCount).fill({
      id: 'streamid123',
      channel_name: 'guy-on-youtube',
    });

    return getStreamsBasedOnStreamCount;
  }

  async fetchStreamDetailsById(apiKey: string, video_id: string) {
    const streams = video_id.split(',');

    const streamDetails = [];

    for (let i = 0; i < streams.length; i++) {
      streamDetails.push({
        id: 'stream-id',
        title: 'stream-title',
        thumbnail_url: 'channel-thumbnail.jpg',
        channel_name: 'channel',
        channel_id: 'channel-id',
        viewer_count: 999,
      });
    }
    return streamDetails;
  }

  async fetchUserYoutubeData() {
    return {
      id: 'user-id',
      snippet: {
        title: 'some guy in youtube',
        thumbnails: {
          medium: {
            url: 'image-url',
          },
        },
      },
      statistics: {
        subscriberCount: 999,
      },
    };
  }

  async fetchUserTotalFollowers() {
    return 999;
  }

  async fetchChannelSubscribers() {
    return 'mock function return';
  }

  async fetchSearchChannels() {
    return [
      {
        id: 'channel-id',
        is_live: true,
        title: 'channel',
        thumbnail_url: 'channel-thumbnail.jpg',
      },
      {
        id: 'channel-id',
        is_live: true,
        title: 'channel',
        thumbnail_url: 'channel-thumbnail.jpg',
      },
      {
        id: 'channel-id',
        is_live: false,
        title: 'channel',
        thumbnail_url: 'channel-thumbnail.jpg',
      },
      {
        id: 'channel-id',
        is_live: false,
        title: 'channel',
        thumbnail_url: 'channel-thumbnail.jpg',
      },
    ];
  }

  async fetchStreamByChannel() {
    return {
      id: 'stream-id',
      title: 'stream-title',
      thumbnail_url: 'channel-thumbnail.jpg',
      channel_name: 'channel',
      channel_id: 'channel-id',
      viewer_count: 999,
    };
  }

  async fetchChannelTotalSubscribers() {
    return { subscribersCount: 999, subscribersAreHidden: false };
  }
}

export class UsersServiceMock {
  async allUsers() {
    return [{ id: 1, name: 'user1' }];
  }

  async findUser() {
    return 'user';
  }

  async updateUserInfo() {
    return 'user';
  }
}

export class UsersYoutubeDataServiceMock {
  async getUserYoutubeData(userId: number) {
    return userId;
  }

  async hasExistingYoutubeAccount() {
    return true;
  }

  async updateUserYoutubeData() {
    return true;
  }

  async autoUnlinkYoutubeAccount() {
    return true;
  }

  async saveYoutubeSubscribers() {
    return true;
  }
}
