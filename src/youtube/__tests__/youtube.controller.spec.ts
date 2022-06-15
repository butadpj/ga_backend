import { YoutubeService } from '../services/youtube.service';
import { YoutubeFetchService } from '../services/youtube-fetch.service';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '@users/services/users.service';
import { UsersYoutubeDataService } from '@users/services/users-youtube-data.service';
import { searchResultsMock } from './mocks/searchResultsMock';
import {
  YoutubeFetchServiceMock,
  UsersServiceMock,
  UsersYoutubeDataServiceMock,
} from './mocks/servicesMocks';
import { YoutubeController } from '@youtube/youtube.controller';
import { topGamingStreamsMock } from './mocks/topGamingStreamsMock';

describe('Youtube Controller', () => {
  let youtubeController: YoutubeController;
  let youtubeService: YoutubeService;

  beforeEach(async () => {
    const YoutubeFetchServiceProvider = {
      provide: YoutubeFetchService,
      useClass: YoutubeFetchServiceMock,
    };

    const UsersYoutubeDataServiceProvider = {
      provide: UsersYoutubeDataService,
      useClass: UsersYoutubeDataServiceMock,
    };

    const UsersServiceProvider = {
      provide: UsersService,
      useClass: UsersServiceMock,
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [YoutubeController],
      providers: [
        YoutubeService,
        YoutubeFetchServiceProvider,
        UsersYoutubeDataServiceProvider,
        UsersServiceProvider,
      ],
    }).compile();

    youtubeController = module.get<YoutubeController>(YoutubeController);
    youtubeService = module.get<YoutubeService>(YoutubeService);
  });

  describe('- processYoutubeAuth()', () => {
    test(`Should throw an Error if email can't be found in state`, () => {
      const noEmailError = () => {
        youtubeController.processYoutubeAuth({
          code: 'valid-code',
          scope: 'scopes',
          state: 'state-no-email',
        });
      };

      expect(noEmailError).toThrow(
        'No email can be found in state. Email must be enclosed in ":email" and ":"',
      );
    });

    test('Should call processUserYoutubeData()', async () => {
      const spyProcessUserYoutubeData = jest.spyOn(
        youtubeService,
        'processUserYoutubeData',
      );

      await youtubeController.processYoutubeAuth({
        code: 'valid-code',
        scope: 'scopes',
        state: 'state:emailsample@email.com:',
      });

      expect(spyProcessUserYoutubeData).toHaveBeenCalled();
    });

    test('Should call processUserChannelInformation()', async () => {
      const spyProcessUserYoutubeData = jest.spyOn(
        youtubeService,
        'processUserChannelInformation',
      );

      await youtubeController.processYoutubeAuth({
        code: 'valid-code',
        scope: 'scopes',
        state: 'state:emailsample@email.com:',
      });

      expect(spyProcessUserYoutubeData).toHaveBeenCalled();
    });

    test('Should call autoUnlinkYoutubeAccount()', async () => {
      const spyProcessUserYoutubeData = jest.spyOn(
        youtubeService.usersYoutubeDataService,
        'autoUnlinkYoutubeAccount',
      );

      await youtubeController.processYoutubeAuth({
        code: 'valid-code',
        scope: 'scopes',
        state: 'state:emailsample@email.com:',
      });

      expect(spyProcessUserYoutubeData).toHaveBeenCalled();
    });
  });

  describe('- getTopGamingStreams()', () => {
    test('top gaming streams should be based on top games from gameNames[] array', async () => {
      youtubeController.setGameNames([
        'Garena Free Fire',
        'Minecraft',
        'Fortnite',
      ]);

      const topGamingStreams = await youtubeController.getTopGamingStreams({
        streamCount: 1,
      });

      expect(topGamingStreams).toMatchObject(topGamingStreamsMock);
    });

    test('Number of streams on each topGamingStreams should match the streamCount param', async () => {
      const allStreamsHaveALengthOf = (
        topGamingStreams: Array<{ game: string; streams: Array<any> }>,
        streamCount: number,
      ) => {
        return topGamingStreams.every(
          (gamingStream) => gamingStream.streams.length === streamCount,
        );
      };

      const streamCount = 5;

      const topGamingStreamsDefaultStreamCount =
        await youtubeController.getTopGamingStreams({});

      const topGamingStreams = await youtubeController.getTopGamingStreams({
        streamCount,
      });

      expect(
        allStreamsHaveALengthOf(topGamingStreamsDefaultStreamCount, 8),
      ).toBe(true);

      expect(allStreamsHaveALengthOf(topGamingStreams, streamCount)).toBe(true);
    });
  });

  describe('- getSearchResults()', () => {
    test('Should return search results of channels and streams & suggestions of live/not live channels', async () => {
      const searchResults = await youtubeController.getSearchResults({
        query: 'test channel',
        searchResultsCount: 4,
        searchSuggestionsCount: 2,
      });

      expect(searchResults).toMatchObject(searchResultsMock);
    });
  });
});
