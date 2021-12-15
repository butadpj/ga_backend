import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { User } from '@users/entity/user.entity';
import { UsersService } from './users.service';
import { UserTwitchVideo } from '@users/entity/user-twitch-video.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserTwitchVideo])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
