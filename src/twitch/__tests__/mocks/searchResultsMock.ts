export const searchResultsMock = {
  query: 'test channel',
  result: {
    streams: [
      {
        id: 'stream-id',
        title: 'stream-title',
        thumbnail_url: 'stream-thumbnail url',
        user_name: 'channel1',
        viewer_count: 999,
      },
      {
        id: 'stream-id',
        title: 'stream-title',
        thumbnail_url: 'stream-thumbnail url',
        user_name: 'channel2',
        viewer_count: 999,
      },
    ],
    channels: [
      {
        id: 'channel-id',
        thumbnail_url: 'stream-thumbnail url',
        user_name: 'channel3',
        total_followers: 999,
        is_live: false,
      },
    ],
  },
  suggestions: {
    live: [
      {
        id: 'stream-id',
        thumbnail_url: 'stream-thumbnail url',
        user_name: 'channel1',
        is_live: true,
      },
      {
        id: 'stream-id',
        thumbnail_url: 'stream-thumbnail url',
        user_name: 'channel2',
        is_live: true,
      },
    ],
    not_live: [
      {
        id: 'channel-id',
        thumbnail_url: 'stream-thumbnail url',
        user_name: 'channel3',
        is_live: false,
      },
    ],
  },
};
