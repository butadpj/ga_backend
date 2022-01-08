import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { User } from '@users/entity/user.entity';
import { UsersService } from './users.service';
import { UserTwitchVideo } from '@users/entity/user-twitch-video.entity';
import { UserTwitchSubscribers } from './entity/user-twitch-subscribers';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserTwitchVideo, UserTwitchSubscribers]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
