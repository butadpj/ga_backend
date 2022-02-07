import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { UsersModule } from '@users/users.module';
import { YoutubeController } from './youtube.controller';
import { YoutubeService } from './services/youtube.service';
import { YoutubeFetchService } from './services/youtube-fetch.service';

@Module({
  imports: [
    UsersModule,
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  controllers: [YoutubeController],
  providers: [YoutubeService, YoutubeFetchService],
})
export class YoutubeModule {}
