import { HttpModule } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { TwitchFetchService } from '@twitch/services/twitch-fetch.service';

describe('Twitch-fetch Service', () => {
  let twitchFetchService: TwitchFetchService;
  let app_access_token: string;

  const invalidAccessToken = 'ikn123eosadk@3slkdnahi';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        HttpModule.register({
          timeout: 5000,
          maxRedirects: 5,
        }),
      ],
      providers: [TwitchFetchService],
    }).compile();

    twitchFetchService = module.get<TwitchFetchService>(TwitchFetchService);

    const { access_token } = await twitchFetchService.fetchAppAccessToken();

    app_access_token = access_token;
  });

  describe('- Error handling,', () => {
    test('Should throw an Error if apiKey is not valid', () => {
      const searchStreamsError = async () =>
        twitchFetchService.fetchStreamsBySearchQuery(
          'query',
          invalidAccessToken,
          1,
        );

      const streamDetailsError = async () =>
        twitchFetchService.fetchStreamDetailsByUser(
          'streamer',
          invalidAccessToken,
        );

      const searchChannelsError = async () =>
        twitchFetchService.fetchSearchChannels('query', invalidAccessToken, 1);

      const streamDetailsByError = async () =>
        twitchFetchService.fetchStreamDetailsByUser(
          'streamer',
          invalidAccessToken,
        );

      const userTotalFollowersError = async () =>
        twitchFetchService.fetchUserTotalFollowers(
          invalidAccessToken,
          'user-id',
        );

      expect(searchStreamsError).rejects.toThrow('Invalid OAuth token');
      expect(streamDetailsError).rejects.toThrow('Invalid OAuth token');
      expect(searchChannelsError).rejects.toThrow('Invalid OAuth token');
      expect(streamDetailsByError).rejects.toThrow('Invalid OAuth token');
      expect(userTotalFollowersError).rejects.toThrow('Invalid OAuth token');
    });
  });

  describe('- fetchTopGames()', () => {
    test('Top games should have needed properties', async () => {
      const topGames = await twitchFetchService.fetchTopGames(app_access_token);

      topGames.forEach((game) => {
        expect(game).toHaveProperty('id');
        expect(game).toHaveProperty('name');
      });
    });
  });

  describe('- fetchTopGamingStreams()', () => {
    test('Top gaming streams should have needed properties', async () => {
      const streamCount = 3;

      const topGamingStreams = await twitchFetchService.fetchTopGamingStreams(
        '509658',
        app_access_token,
        streamCount,
      );

      topGamingStreams.forEach((stream) => {
        expect(stream).toHaveProperty('id');
        expect(stream).toHaveProperty('user_login');
        expect(stream).toHaveProperty('user_name');
        expect(stream).toHaveProperty('type', 'live');
        expect(stream).toHaveProperty('viewer_count');
      });

      expect(topGamingStreams.length).toEqual(streamCount);
    });
  });

  describe('- fetchSearchChannels()', () => {
    test('Search channels should have needed properties', async () => {
      const resultCount = 3;

      const searchChannels = await twitchFetchService.fetchSearchChannels(
        'TenZ',
        app_access_token,
        3,
      );

      searchChannels.forEach((channel) => {
        expect(channel).toHaveProperty('id');
        expect(channel).toHaveProperty('broadcaster_login');
        expect(channel).toHaveProperty('display_name');
        expect(channel).toHaveProperty('is_live');
        expect(channel).toHaveProperty('thumbnail_url');
      });

      expect(searchChannels.length).toEqual(resultCount);
    });
  });

  // Not consistent (channel might not be streaming at the moment)
  describe('- fetchStreamDetailsByUser()', () => {
    test('Stream by user should have needed properties', async () => {
      // If the test fails, change the liveStreamingUser to the
      // user_login of currently live streaming user
      const liveStreamingUser = 'asmongold';

      const streamByUser = await twitchFetchService.fetchStreamDetailsByUser(
        liveStreamingUser,
        app_access_token,
      );

      expect(streamByUser).toHaveProperty('id');
      expect(streamByUser).toHaveProperty('thumbnail_url');
      expect(streamByUser).toHaveProperty('title');
      expect(streamByUser).toHaveProperty('user_name');
      expect(streamByUser).toHaveProperty('user_login');
      expect(streamByUser).toHaveProperty('viewer_count');
    });
  });

  describe('- fetchAppAccessToken()', () => {
    test('Should have the needed properties', async () => {
      const token = await twitchFetchService.fetchAppAccessToken();

      expect(token).toHaveProperty('access_token');
      expect(token).toHaveProperty('expires_in');
      expect(token).toHaveProperty('token_type');
    });
  });
});
