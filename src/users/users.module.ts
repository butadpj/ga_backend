import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { User } from '@users/entity/user.entity';
import { UsersService } from './users.service';
import { UserTwitchData } from '@twitch/entity/user-twitch-data';
import { UserTwitchSubscribers } from '@twitch/entity/user-twitch-subscribers';
import { UserTwitchVideo } from '@twitch/entity/user-twitch-video.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserTwitchData,
      UserTwitchSubscribers,
      UserTwitchVideo,
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
