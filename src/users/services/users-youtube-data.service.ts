import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { UserYoutubeData } from '@youtube/entity/user-youtube-data';

import { UsersService } from './users.service';
import { UserYoutubeSubscribers } from '@youtube/entity/user-youtube-subscribers';

@Injectable()
export class UsersYoutubeDataService {
  constructor(
    private usersService: UsersService,
    @InjectRepository(UserYoutubeData)
    private userYoutubeDataRepository: Repository<UserYoutubeData>,
    @InjectRepository(UserYoutubeSubscribers)
    private userYoutubeSubscribersRepository: Repository<UserYoutubeSubscribers>,
  ) {}

  async getUserYoutubeData(userId: number): Promise<any> {
    const user = await this.usersService.findUser({ id: userId });

    const userYoutubeData = await this.userYoutubeDataRepository.findOne({
      where: { user: user.id },
    });

    if (!userYoutubeData) {
      throw new NotFoundException(
        {
          statusCode: 404,
          message: `No YouTube account linked to this user`,
        },
        `No YouTube account linked to the user`,
      );
    }

    return userYoutubeData;
  }

  async getUserYoutubeSubscribers(userId: number): Promise<any> {
    const user = await this.usersService.findUser({ id: userId });

    const userYoutubeData = await this.getUserYoutubeData(user.id);

    return this.userYoutubeSubscribersRepository.find({
      where: { youtube_data: userYoutubeData.id },
    });
  }

  async updateUserYoutubeData(userId: number, updateFields: any): Promise<any> {
    const userYoutubeData = await this.getUserYoutubeData(userId);

    await this.userYoutubeDataRepository.update(
      { id: userYoutubeData.id },
      updateFields,
    );

    return await this.usersService.findUser({ id: userId });
  }

  async linkUserYoutubeData(email: string, youtubeData: any): Promise<any> {
    const user = await this.usersService.findUser({ email });

    const newUserYoutubeData = this.userYoutubeDataRepository.create({
      user: user.id,
      ...youtubeData,
    });

    await this.userYoutubeDataRepository.save(newUserYoutubeData);

    return await this.getUserYoutubeData(user.id);
  }

  async deleteUserYoutubeData(userId: number): Promise<any> {
    const userYoutubeData = await this.getUserYoutubeData(userId);

    this.userYoutubeDataRepository.delete(userYoutubeData);

    return await this.usersService.findUser({ id: userId });
  }

  async autoUnlinkYoutubeAccount(email: string): Promise<any> {
    const { id } = await this.usersService.findUser({ email });

    setTimeout(async () => {
      const { email } = await this.deleteUserYoutubeData(id);
      console.log(
        `User-${email}'s youtube account has been automatically logged out`,
      );
    }, 1800000); // 30 mins
  }

  async saveYoutubeSubscribers(
    userId: number,
    subscribers: Array<any>,
  ): Promise<any> {
    const userYoutubeData = await this.getUserYoutubeData(userId);

    const createdSubscribers =
      this.userYoutubeSubscribersRepository.create(subscribers);

    await this.userYoutubeSubscribersRepository.insert(createdSubscribers);

    userYoutubeData.youtube_subscribers = createdSubscribers;

    await this.userYoutubeDataRepository.save(userYoutubeData);

    return await this.getUserYoutubeSubscribers(userId);
  }

  async hasExistingYoutubeAccount(userId: number): Promise<boolean> {
    return await this.getUserYoutubeData(userId)
      .then((data) => {
        return true;
      })
      .catch((error) => {
        return false;
      });
  }
}
