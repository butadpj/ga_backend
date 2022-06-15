export const searchResultsMock = {
  query: 'test channel',
  result: {
    streams: [
      {
        id: 'stream-id',
        title: 'stream-title',
        thumbnail_url: 'channel-thumbnail.jpg',
        channel_name: 'channel',
        channel_id: 'channel-id',
        viewer_count: 999,
      },
      {
        id: 'stream-id',
        title: 'stream-title',
        thumbnail_url: 'channel-thumbnail.jpg',
        channel_id: 'channel-id',
        channel_name: 'channel',
        viewer_count: 999,
      },
      {
        id: 'stream-id',
        title: 'stream-title',
        thumbnail_url: 'channel-thumbnail.jpg',
        channel_id: 'channel-id',
        channel_name: 'channel',
        viewer_count: 999,
      },
      {
        id: 'stream-id',
        title: 'stream-title',
        thumbnail_url: 'channel-thumbnail.jpg',
        channel_id: 'channel-id',
        channel_name: 'channel',
        viewer_count: 999,
      },
    ],
    channels: [
      {
        id: 'channel-id',
        thumbnail_url: 'channel-thumbnail.jpg',
        channel_name: 'channel',
        total_subscribers: 999,
        is_live: false,
      },
      {
        id: 'channel-id',
        thumbnail_url: 'channel-thumbnail.jpg',
        channel_name: 'channel',
        total_subscribers: 999,
        is_live: false,
      },
    ],
  },
  suggestions: {
    live: [
      {
        id: 'stream-id',
        thumbnail_url: 'channel-thumbnail.jpg',
        channel_name: 'channel',
        is_live: true,
      },
      {
        id: 'stream-id',
        thumbnail_url: 'channel-thumbnail.jpg',
        channel_name: 'channel',
        is_live: true,
      },
    ],
    not_live: [
      {
        id: 'channel-id',
        thumbnail_url: 'channel-thumbnail.jpg',
        channel_name: 'channel',
        is_live: false,
      },
      {
        id: 'channel-id',
        thumbnail_url: 'channel-thumbnail.jpg',
        channel_name: 'channel',
        is_live: false,
      },
    ],
  },
};
