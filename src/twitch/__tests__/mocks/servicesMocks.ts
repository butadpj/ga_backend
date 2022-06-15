export class TwitchFetchServiceMock {
  async fetchAppAccessToken() {
    return {
      access_token: 'rfx2uswqe8l4g1mkagrvg5tv0ks3',
    };
  }

  async fetchTwitchOAuthToken() {
    return {
      access_token: 'rfx2uswqe8l4g1mkagrvg5tv0ks3',
      expires_in: 14124,
      refresh_token: '5b93chm6hdve3mycz05zfzatkfdenfspp1h1ar2xxdalen01',
      scope: ['channel:moderate', 'chat:edit', 'chat:read'],
      token_type: 'bearer',
    };
  }

  async fetchTopGames() {
    return [
      {
        id: '493057',
        name: "PLAYERUNKNOWN'S BATTLEGROUNDS",
        box_art_url:
          'https://static-cdn.jtvnw.net/ttv-boxart/PLAYERUNKNOWN%27S%20BATTLEGROUNDS-{width}x{height}.jpg',
      },
      {
        id: '493058',
        name: 'VALORANT',
        box_art_url:
          'https://static-cdn.jtvnw.net/ttv-boxart/PLAYERUNKNOWN%27S%20BATTLEGROUNDS-{width}x{height}.jpg',
      },
      {
        id: '493059',
        name: 'LEAGUE OF LEGENDS',
        box_art_url:
          'https://static-cdn.jtvnw.net/ttv-boxart/PLAYERUNKNOWN%27S%20BATTLEGROUNDS-{width}x{height}.jpg',
      },
    ];
  }

  async fetchTopGamingStreams(
    game_id: string,
    access_token: string,
    streamCounts: number,
  ) {
    const getStreamsBasedOnStreamCount = new Array(streamCounts).fill({
      id: 'streamid123',
      user_login: 'streamer_name',
      user_name: 'Streamer_Name',
      title: 'Stream title',
      viewer_count: 999,
      thumbnail_url: 'thumbnail.jpg',
    });

    return getStreamsBasedOnStreamCount;
  }

  async fetchUserTwitchData() {
    return 'mock function return';
  }

  async fetchUserTwitchVideos() {
    return 'mock function return';
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
        id: 'stream-id',
        is_live: true,
        broadcaster_login: 'channel1',
        thumbnail_url: 'stream-thumbnail url',
        display_name: 'channel1',
      },
      {
        id: 'stream-id',
        is_live: true,
        broadcaster_login: 'channel2',
        thumbnail_url: 'stream-thumbnail url',
        display_name: 'channel2',
      },
      {
        id: 'channel-id',
        is_live: false,
        broadcaster_login: 'channel3',
        thumbnail_url: 'stream-thumbnail url',
        display_name: 'channel3',
      },
      {
        id: 'channel-id',
        is_live: false,
        broadcaster_login: 'channel4',
        thumbnail_url: 'stream-thumbnail url',
        display_name: 'channel4',
      },
    ];
  }

  async fetchStreamsBySearchQuery(
    query: string,
    access_token: string,
    searchResultsCount: number,
  ) {
    const getStreamsBasedOnStreamCount = new Array(searchResultsCount).fill({
      id: 'streamid123',
      user_login: 'guy-on-twitch',
    });

    return getStreamsBasedOnStreamCount;
  }

  async fetchStreamDetailsByUser(user_login: string, access_token: string) {
    return {
      id: 'stream-id',
      title: 'stream-title',
      thumbnail_url: 'stream-thumbnail url',
      user_name: user_login,
      viewer_count: 999,
    };
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

export class UsersTwitchDataServiceMock {
  async getUserTwitchData(userId: number) {
    return userId;
  }

  async hasExistingTwitchAccount() {
    return true;
  }

  async updateUserTwitchData() {
    return true;
  }

  async autoUnlinkTwitchAccount() {
    return true;
  }

  async saveTwitchVideos() {
    return true;
  }
}
