import { HttpService } from '@nestjs/axios';
import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { UsersService } from '@users/services/users.service';

import { UserTwitchData } from '@twitch/entity/user-twitch-data';
import { UserTwitchSubscribers } from '@twitch/entity/user-twitch-subscribers';
import { UserTwitchVideo } from '@twitch/entity/user-twitch-video.entity';

import { map } from 'rxjs';
import { Repository } from 'typeorm';

@Injectable()
export class UsersTwitchDataService {
  constructor(
    private usersService: UsersService,
    private httpService: HttpService,

    @InjectRepository(UserTwitchData)
    private userTwitchDataRepository: Repository<UserTwitchData>,
    @InjectRepository(UserTwitchVideo)
    private userTwitchVideosRepository: Repository<UserTwitchVideo>,
    @InjectRepository(UserTwitchSubscribers)
    private userTwitchSubscribersRepository: Repository<UserTwitchSubscribers>,
  ) {}

  async getUserTwitchData(userId: number): Promise<any> {
    const user = await this.usersService.findUser({ id: userId });

    const userTwitchData = await this.userTwitchDataRepository.findOne({
      where: { user: user.id },
    });

    if (!userTwitchData) {
      throw new UnprocessableEntityException(
        {
          statusCode: 422,
          message: `No twitch account linked to this user`,
          error: 'Unprocessable Entity',
        },
        `No twitch account linked to the user`,
      );
    }

    return userTwitchData;
  }

  async getUserTwitchVideos(userId: number): Promise<any> {
    const user = await this.usersService.findUser({ id: userId });

    const userTwitchData = await this.getUserTwitchData(user.id);

    return this.userTwitchVideosRepository.find({
      where: { twitch_data: userTwitchData.id },
    });
  }

  async getUserTwitchSubscribers(userId: number): Promise<any> {
    const user = await this.usersService.findUser({ id: userId });

    const userTwitchData = await this.getUserTwitchData(user.id);

    return this.userTwitchSubscribersRepository.find({
      where: { twitch_data: userTwitchData.id },
    });
  }

  async saveTwitchVideos(
    userId: number,
    twitch_videos: Array<any>,
  ): Promise<any> {
    const userTwitchData = await this.getUserTwitchData(userId);

    const twitchVideos = this.userTwitchVideosRepository.create(twitch_videos);

    await this.userTwitchVideosRepository.insert(twitchVideos);

    userTwitchData.twitch_videos = twitchVideos;

    await this.userTwitchDataRepository.save(userTwitchData);

    return await this.getUserTwitchVideos(userId);
  }

  async saveTwitchSubscribers(
    userId: number,
    subscribers: Array<any>,
  ): Promise<any> {
    const userTwitchData = await this.getUserTwitchData(userId);

    const createdSubscribers =
      this.userTwitchSubscribersRepository.create(subscribers);

    await this.userTwitchSubscribersRepository.insert(createdSubscribers);

    userTwitchData.twitch_subscribers = createdSubscribers;

    await this.userTwitchDataRepository.save(userTwitchData);

    return await this.getUserTwitchSubscribers(userId);
  }

  async updateUserTwitchData(email: string, updateFields: any): Promise<any> {
    const user = await this.usersService.findUser({ email });

    const userTwitchData = await this.getUserTwitchData(user.id);

    await this.userTwitchDataRepository.update(
      { id: userTwitchData.id },
      updateFields,
    );

    return await this.usersService.findUser({ email });
  }

  async linkUserTwitchData(email: string, twitchData: any): Promise<any> {
    const user = await this.usersService.findUser({ email });

    const newUserTwitchData = this.userTwitchDataRepository.create({
      user: user.id,
      ...twitchData,
    });

    await this.userTwitchDataRepository.save(newUserTwitchData);

    return await this.getUserTwitchData(user.id);
  }

  async unlinkUserTwitchData(userId: number): Promise<any> {
    const userTwitchData = await this.getUserTwitchData(userId);

    this.userTwitchDataRepository.delete(userTwitchData);

    return await this.usersService.findUser({ id: userId });
  }

  async autoUnlinkTwitchAccount(email: string): Promise<any> {
    const { id } = await this.usersService.findUser({ email });

    setTimeout(async () => {
      const { email } = await this.unlinkUserTwitchData(id);
      console.log(
        `User-${email}'s twitch account has been automatically logged out`,
      );
    }, 1800000); // 30 mins
  }

  async hasExistingTwitchAccount(userId: number): Promise<boolean> {
    return await this.getUserTwitchData(userId)
      .then((data) => {
        return true;
      })
      .catch((error) => {
        return false;
      });
  }
}
