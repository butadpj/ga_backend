import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDTO, UserDTO } from './dto';
import { User } from '@users/entity/user.entity';
import * as bcrypt from 'bcrypt';
import { UserTwitchVideo } from './entity/user-twitch-video.entity';
import { UserTwitchSubscribers } from './entity/user-twitch-subscribers';
import { UserTwitchData } from './entity/user-twitch-data';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserTwitchData)
    private userTwitchDataRepository: Repository<UserTwitchData>,
    @InjectRepository(UserTwitchVideo)
    private userTwitchVideosRepository: Repository<UserTwitchVideo>,
    @InjectRepository(UserTwitchSubscribers)
    private userTwitchSubscribersRepository: Repository<UserTwitchSubscribers>,
  ) {}

  async allUsers(): Promise<UserDTO[]> {
    return await this.usersRepository.find();
  }

  async findUser({ id, email }: any): Promise<UserDTO | undefined> {
    if (email) {
      const user = await this.usersRepository.findOne({ where: { email } });

      if (!user) {
        throw new UnprocessableEntityException(
          {
            statusCode: 422,
            message: `Cannot find user with an email of ${email}`,
            error: 'Unprocessable Entity',
          },
          `User doesn't exist`,
        );
      }

      return user;
    }
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new UnprocessableEntityException(
        {
          statusCode: 422,
          message: `Cannot find user with an id of ${id}`,
          error: 'Unprocessable Entity',
        },
        `User doesn't exist`,
      );
    }

    return user;
  }

  async hashPassword(password: string): Promise<string> {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
  }

  async createUser(credentials: CreateUserDTO): Promise<any> {
    /* 
      findUser() throws an error if user is not found.
      So we'll just use the catch() to create the user
      there, since we know that the user doesn't exist yet
    */

    return await this.findUser({ email: credentials.email })
      .then(() => {
        throw new UnprocessableEntityException(
          {
            statusCode: 422,
            message: 'User already exist',
            error: 'Unprocessable Entity',
          },
          'Duplicate email not allowed',
        );
      })
      .catch(async () => {
        const createdUser = this.usersRepository.create({
          email: credentials.email,
          password: await this.hashPassword(credentials.password),
        });

        return await this.usersRepository.save(createdUser);
      });
  }

  async markEmailAsConfirmed(email: string) {
    await this.usersRepository.update(
      { email },
      {
        isEmailConfirmed: true,
      },
    );

    return await this.findUser({ email: email });
  }

  async getUserTwitchData(userId: number): Promise<any> {
    const user = await this.findUser({ id: userId });

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
    const user = await this.findUser({ id: userId });

    const userTwitchData = await this.getUserTwitchData(user.id);

    return this.userTwitchVideosRepository.find({
      where: { twitch_data: userTwitchData.id },
    });
  }

  async getUserTwitchSubscribers(userId: number): Promise<any> {
    const user = await this.findUser({ id: userId });

    const userTwitchData = await this.getUserTwitchData(user.id);

    return this.userTwitchSubscribersRepository.find({
      where: { twitch_data: userTwitchData.id },
    });
  }

  async createTwitchVideos(
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

  async createTwitchSubscribers(
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

  async linkTwitchUserData(email: string, twitchData: any): Promise<any> {
    const user = await this.findUser({ email });

    const newUserTwitchData = this.userTwitchDataRepository.create({
      user: user.id,
      ...twitchData,
    });

    await this.userTwitchDataRepository.save(newUserTwitchData);

    return await this.getUserTwitchData(user.id);
  }

  async updateTwitchUserData(email: string, updateFields: any): Promise<any> {
    const user = await this.findUser({ email });

    const userTwitchData = await this.getUserTwitchData(user.id);

    await this.userTwitchDataRepository.update(
      { id: userTwitchData.id },
      updateFields,
    );

    return await this.findUser({ email });
  }

  async unlinkTwitchUserData(userId: number): Promise<any> {
    const userTwitchData = await this.getUserTwitchData(userId);

    this.userTwitchDataRepository.delete(userTwitchData);

    return await this.findUser({ id: userId });
  }

  async autoUnlinkTwitchAccount(email: string): Promise<any> {
    const { id } = await this.findUser({ email });

    setTimeout(async () => {
      const { email } = await this.unlinkTwitchUserData(id);
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
