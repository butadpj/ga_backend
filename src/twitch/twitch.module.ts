import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '@users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { UserTwitchData } from './entity/user-twitch-data';
import { UserTwitchSubscribers } from './entity/user-twitch-subscribers';
import { UserTwitchVideo } from './entity/user-twitch-video.entity';
import { TwitchController } from './twitch.controller';
import { TwitchService } from './twitch.service';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    TypeOrmModule.forFeature([
      UserTwitchData,
      UserTwitchSubscribers,
      UserTwitchVideo,
    ]),
  ],
  controllers: [TwitchController],
  providers: [TwitchService],
})
export class TwitchModule {}
