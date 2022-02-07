import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '@users/entity/user.entity';

import { UsersController } from './users.controller';

import { UsersService } from './services/users.service';
import { UsersTwitchDataService } from './services/users-twitch-data.service';

import { UserTwitchData } from '@twitch/entity/user-twitch-data';
import { UserTwitchSubscribers } from '@twitch/entity/user-twitch-subscribers';
import { UserTwitchVideo } from '@twitch/entity/user-twitch-video.entity';

import { UserYoutubeData } from '@youtube/entity/user-youtube-data';
import { UserYoutubeSubscribers } from '@youtube/entity/user-youtube-subscribers';
import { UserYoutubeVideo } from '@youtube/entity/user-youtube-video.entity';
import { HttpModule } from '@nestjs/axios';
import { UsersYoutubeDataService } from './services/users-youtube-data.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    TypeOrmModule.forFeature([
      User,
      UserTwitchData,
      UserTwitchSubscribers,
      UserTwitchVideo,
      UserYoutubeData,
      UserYoutubeSubscribers,
      UserYoutubeVideo,
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersTwitchDataService, UsersYoutubeDataService],
  exports: [UsersService, UsersTwitchDataService, UsersYoutubeDataService],
})
export class UsersModule {}
