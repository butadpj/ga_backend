import { HttpModule } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { separateByComma } from '@utils/separateByComma';
import { YoutubeFetchService } from '@youtube/services/youtube-fetch.service';

describe('Youtube-fetch Service', () => {
  let youtubeFetchService: YoutubeFetchService;
  const apiKey = process.env.GOOGLE_API_KEY;
  const invalidApiKey = 'asd1@!$rsdoiajoasdsa#';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        HttpModule.register({
          timeout: 5000,
          maxRedirects: 5,
        }),
      ],
      providers: [YoutubeFetchService],
    }).compile();

    youtubeFetchService = module.get<YoutubeFetchService>(YoutubeFetchService);
  });

  describe('- Error handling,', () => {
    test('Should throw an Error if apiKey is not valid', () => {
      const searchStreamsError = async () =>
        youtubeFetchService.fetchStreamsBySearchQuery({
          apiKey: invalidApiKey,
          query: 'query',
          streamCount: 1,
        });

      const streamDetailsError = async () =>
        youtubeFetchService.fetchStreamDetailsById(invalidApiKey, 'video-id');

      const searchChannelsError = async () =>
        youtubeFetchService.fetchSearchChannels('query', invalidApiKey, 1);

      const streamByChannelError = async () =>
        youtubeFetchService.fetchStreamByChannel('channel-id', invalidApiKey);

      const channelTotalSubscribersError = async () =>
        youtubeFetchService.fetchChannelTotalSubscribers(
          'channel-id',
          invalidApiKey,
        );

      expect(searchStreamsError).rejects.toThrow('Api key is not valid');
      expect(streamDetailsError).rejects.toThrow('Api key is not valid');
      expect(searchChannelsError).rejects.toThrow('Api key is not valid');
      expect(streamByChannelError).rejects.toThrow('Api key is not valid');
      expect(channelTotalSubscribersError).rejects.toThrow(
        'Api key is not valid',
      );
    });
  });

  describe('- fetchStreamsBySearchQuery()', () => {
    test('Search streams should have needed properties', async () => {
      const resultsCount = 5;

      const searchStreams = await youtubeFetchService.fetchStreamsBySearchQuery(
        {
          apiKey: apiKey,
          query: 'minecraft',
          streamCount: resultsCount,
        },
      );

      searchStreams.forEach((stream) => {
        expect(stream).toHaveProperty('id');
        expect(stream).toHaveProperty('channel_name');
      });

      expect(searchStreams.length).toEqual(resultsCount);
    });
  });

  // Not consistent (channel might not be streaming at the moment)
  describe('- fetchStreamDetailsById()', () => {
    test('Stream details should have needed properties', async () => {
      const streamIds = ['AgGI415l-xg', 'zNDGabJQ-YE'];

      const streamDetails = await youtubeFetchService.fetchStreamDetailsById(
        apiKey,
        separateByComma(streamIds),
      );

      streamDetails.forEach((stream) => {
        expect(stream).toHaveProperty('id');
        expect(stream).toHaveProperty('channel_name');
        expect(stream).toHaveProperty('channel_id');
        expect(stream).toHaveProperty('title');
        expect(stream).toHaveProperty('thumbnail_url');
        expect(stream).toHaveProperty('viewer_count');
      });

      expect(streamDetails.length).toEqual(streamIds.length);
    });
  });

  describe('- fetchSearchChannels()', () => {
    test('Search channels should have needed properties', async () => {
      const resultsCount = 20;

      const searchChannels = await youtubeFetchService.fetchSearchChannels(
        'minecraft',
        apiKey,
        resultsCount,
      );

      searchChannels.forEach((channel) => {
        expect(channel).toHaveProperty('id');
        expect(channel).toHaveProperty('title');
        expect(channel).toHaveProperty('is_live');
        expect(channel).toHaveProperty('thumbnail_url');
      });

      expect(searchChannels.length).toEqual(resultsCount);
    });
  });

  describe('- fetchStreamByChannel()', () => {
    test('Stream by channel should have needed properties', async () => {
      // If the test fails, change the channelId to the
      // ID of currently live streaming channel
      const liveStreamingChannelId = 'UCKdjZUNfcwnIevqy0YJkVrg';

      const streamByChannel = await youtubeFetchService.fetchStreamByChannel(
        liveStreamingChannelId,
        apiKey,
      );

      expect(streamByChannel).toHaveProperty('id');
      expect(streamByChannel).toHaveProperty('title');
      expect(streamByChannel).toHaveProperty('channel_name');
      expect(streamByChannel).toHaveProperty('thumbnail_url');
      expect(streamByChannel).toHaveProperty('viewer_count');
    });
  });

  describe('- fetchChannelTotalSubscribers()', () => {
    test('Channel total subscribers should have needed properties', async () => {
      const channelTotalSubscribers =
        await youtubeFetchService.fetchChannelTotalSubscribers(
          'UCPovnM0KxuyPOedwiDFsvOA',
          apiKey,
        );

      expect(channelTotalSubscribers).toHaveProperty('subscribersCount');
      expect(channelTotalSubscribers).toHaveProperty('subscribersAreHidden');
    });
  });
});
