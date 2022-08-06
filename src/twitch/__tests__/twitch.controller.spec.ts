/* eslint-disable @typescript-eslint/no-unused-vars */
import { TwitchService } from '../services/twitch.service';
import { TwitchFetchService } from '../services/twitch-fetch.service';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '@users/services/users.service';
import { UsersTwitchDataService } from '@users/services/users-twitch-data.service';
import { searchResultsMock } from './mocks/searchResultsMock';
import {
  TwitchFetchServiceMock,
  UsersServiceMock,
  UsersTwitchDataServiceMock,
} from './mocks/servicesMocks';
import { TwitchController } from '@twitch/twitch.controller';
import { topGamingStreamsMock } from './mocks/topGamingStreamsMock';

describe('Twitch Controller', () => {
  let twitchController: TwitchController;
  let twitchService: TwitchService;

  beforeEach(async () => {
    const TwitchFetchServiceProvider = {
      provide: TwitchFetchService,
      useClass: TwitchFetchServiceMock,
    };

    const UsersTwitchDataServiceProvider = {
      provide: UsersTwitchDataService,
      useClass: UsersTwitchDataServiceMock,
    };

    const UsersServiceProvider = {
      provide: UsersService,
      useClass: UsersServiceMock,
    };

    const module: TestingModule = await Test.createTestingModule({
      // imports: [HttpModule.register({})],
      controllers: [TwitchController],
      providers: [
        TwitchService,
        TwitchFetchServiceProvider,
        UsersTwitchDataServiceProvider,
        UsersServiceProvider,
      ],
    }).compile();

    twitchController = module.get<TwitchController>(TwitchController);
    twitchService = module.get<TwitchService>(TwitchService);
  });

  describe('- processTwitchAuth()', () => {
    test(`Should throw an Error if email can't be found in state`, () => {
      const noEmailError = async () => {
        await twitchController.processTwitchAuth(
          {
            redirect: () => {
              return;
            },
          },
          {
            code: 'valid-code',
            scope: 'scopes',
            state: 'no-email:redirect_page/my-profile:',
          },
        );
      };

      expect(noEmailError).rejects.toThrow(
        `No email can be found in state. email must be enclosed in ":email" and ":"`,
      );
    });

    test(`Should throw an Error if redirect_page can't be found in state`, () => {
      const noRedirectPageError = async () => {
        await twitchController.processTwitchAuth(
          {
            redirect: () => {
              return;
            },
          },
          {
            code: 'valid-code',
            scope: 'scopes',
            state: ':emailvalid-email@mail.com:no-redirect-page',
          },
        );
      };

      expect(noRedirectPageError).rejects.toThrow(
        `No redirect_page can be found in state. redirect_page must be enclosed in ":redirect_page" and ":"`,
      );
    });

    test('Should call processUserTwitchData()', async () => {
      const spyProcessUserTwitchData = jest.spyOn(
        twitchService,
        'processUserTwitchData',
      );

      await twitchController.processTwitchAuth(
        {
          redirect: () => {
            return;
          },
        },
        {
          code: 'valid-code',
          scope: 'scopes',
          state: ':emailvalid-email@mail.com:redirect_page/my-profile:',
        },
      );

      expect(spyProcessUserTwitchData).toHaveBeenCalled();
    });

    test('Should call processUserChannelInformation()', async () => {
      const spyProcessUserTwitchData = jest.spyOn(
        twitchService,
        'processUserChannelInformation',
      );

      await twitchController.processTwitchAuth(
        {
          redirect: () => {
            return;
          },
        },
        {
          code: 'valid-code',
          scope: 'scopes',
          state: ':emailvalid-email@mail.com:redirect_page/my-profile:',
        },
      );

      expect(spyProcessUserTwitchData).toHaveBeenCalled();
    });

    test('Should call autoUnlinkTwitchAccount()', async () => {
      const spyProcessUserTwitchData = jest.spyOn(
        twitchService.usersTwitchDataService,
        'autoUnlinkTwitchAccount',
      );

      await twitchController.processTwitchAuth(
        {
          redirect: () => {
            return;
          },
        },
        {
          code: 'valid-code',
          scope: 'scopes',
          state: ':emailvalid-email@mail.com:redirect_page/my-profile:',
        },
      );

      expect(spyProcessUserTwitchData).toHaveBeenCalled();
    });
  });

  describe('- getTopGamingStreams()', () => {
    test('top gaming streams should be based on top games from fetchTopGames()', async () => {
      const topGamingStreams = await twitchController.getTopGamingStreams({
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
        await twitchController.getTopGamingStreams({});

      const topGamingStreams = await twitchController.getTopGamingStreams({
        streamCount,
      });

      expect(
        allStreamsHaveALengthOf(topGamingStreamsDefaultStreamCount, 8),
      ).toBe(true);

      expect(allStreamsHaveALengthOf(topGamingStreams, streamCount)).toBe(true);
    });
  });

  describe('- getSearchChannels()', () => {
    test('Should return search results of channels and streams & suggestions of live/not live channels', async () => {
      const searchResults = await twitchController.getSearchResults({
        query: 'test channel',
        searchResultsCount: 4,
        searchSuggestionsCount: 2,
      });

      expect(searchResults).toMatchObject(searchResultsMock);
    });
  });
});
