import 'dotenv/config';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { TwitchModule } from './twitch/twitch.module';

@Module({
  imports: [TypeOrmModule.forRoot(), UsersModule, AuthModule, TwitchModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
