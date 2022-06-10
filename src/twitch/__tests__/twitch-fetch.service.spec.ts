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

  test('Should throw an error if twitch app_access_token is invalid or has expired', async () => {
    const topGamesError = async () =>
      await twitchFetchService.fetchTopGames(invalidAccessToken);

    const topGamingStreamsError = async () =>
      await twitchFetchService.fetchTopGamingStreams(
        'dsad',
        invalidAccessToken,
        3,
      );

    const fetchSearchChannelsError = async () => {
      await twitchFetchService.fetchSearchChannels(
        'TenZ',
        invalidAccessToken,
        3,
      );
    };

    expect(topGamesError).rejects.toThrow(
      'TWITCH_APP_ACCESS_TOKEN has expired or is invalid',
    );

    expect(topGamingStreamsError).rejects.toThrow(
      'TWITCH_APP_ACCESS_TOKEN has expired or is invalid',
    );

    expect(fetchSearchChannelsError).rejects.toThrow(
      'TWITCH_APP_ACCESS_TOKEN has expired or is invalid',
    );
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
});
