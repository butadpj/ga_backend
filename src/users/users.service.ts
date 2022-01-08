import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDTO, UserDTO } from './dto';
import { User } from '@users/entity/user.entity';
import * as bcrypt from 'bcrypt';
import { UserTwitchVideo } from './entity/user-twitch-video.entity';
import { UserTwitchSubscribers } from './entity/user-twitch-subscribers';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserTwitchVideo)
    private userTwitchVideosRepository: Repository<UserTwitchVideo>,
    @InjectRepository(UserTwitchSubscribers)
    private userTwitchSubscribersRepository: Repository<UserTwitchSubscribers>,
  ) {}

  async allUsers(): Promise<UserDTO[]> {
    return await this.usersRepository.find();
  }

  async findUser({ id, email }: any): Promise<UserDTO | undefined> {
    if (email) return await this.usersRepository.findOne({ where: { email } });
    return await this.usersRepository.findOne({ where: { id } });
  }

  async hashPassword(password: string): Promise<string> {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
  }

  async createUser(credentials: CreateUserDTO): Promise<any> {
    let user = await this.findUser({ email: credentials.email });

    if (user) {
      throw new UnprocessableEntityException(
        {
          statusCode: 422,
          message: 'User already exist',
          error: 'Unprocessable Entity',
        },
        'Duplicate email not allowed',
      );
    }

    user = this.usersRepository.create({
      email: credentials.email,
      password: await this.hashPassword(credentials.password),
    });

    const result = await this.usersRepository.save({
      email: user.email,
      password: user.password,
    });

    return { id: result.id, email: result.email };
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

  async getUserTwitchVideos(userId: number): Promise<any> {
    const user = await this.findUser({ id: userId });

    if (!user) {
      throw new UnprocessableEntityException(
        {
          statusCode: 422,
          message: `Cannot find user with an id of ${userId}`,
          error: 'Unprocessable Entity',
        },
        `User doesn't exist`,
      );
    }

    return this.userTwitchVideosRepository.find({ where: { user: userId } });
  }

  async getUserTwitchSubscribers(userId: number): Promise<any> {
    const user = await this.findUser({ id: userId });

    if (!user) {
      throw new UnprocessableEntityException(
        {
          statusCode: 422,
          message: `Cannot find user with an id of ${userId}`,
          error: 'Unprocessable Entity',
        },
        `User doesn't exist`,
      );
    }

    return this.userTwitchSubscribersRepository.find({
      where: { user: userId },
    });
  }

  async createTwitchVideo(
    email: string,
    {
      twitch_id,
      twitch_stream_id,
      title,
      description,
      url,
      thumbnail_url,
      viewable,
      view_count,
      type,
      duration,
      created_at,
      published_at,
    },
  ): Promise<any> {
    const user = await this.findUser({ email });

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

    const twitchVideo = this.userTwitchVideosRepository.create({
      twitch_id,
      twitch_stream_id,
      title,
      description,
      url,
      thumbnail_url,
      viewable,
      view_count,
      type,
      duration,
      created_at,
      published_at,
    });

    await this.userTwitchVideosRepository.save(twitchVideo);

    user.twitch_videos = [twitchVideo];

    return this.usersRepository.save(user);
  }

  async createTwitchSubscriber(
    email: string,
    {
      twitch_id,
      subscriber_id,
      subscriber_name,
      subscriber_display_picture,
      is_gift,
    },
  ): Promise<any> {
    const user = await this.findUser({ email });

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

    const twitchSubscriber = this.userTwitchSubscribersRepository.create({
      twitch_id,
      subscriber_id,
      subscriber_name,
      subscriber_display_picture,
      is_gift,
    });

    await this.userTwitchSubscribersRepository.save(twitchSubscriber);

    user.twitch_subscribers = [twitchSubscriber];

    return this.usersRepository.save(user);
  }

  async updateTwitchUserData(data: any): Promise<any> {
    const user = await this.findUser({ email: data.user_email });
    const { user_email, ...update_fields } = data;

    if (!user) {
      throw new UnprocessableEntityException(
        {
          statusCode: 422,
          message: `Cannot find user with an email of ${data.user_email}`,
          error: 'Unprocessable Entity',
        },
        `User doesn't exist`,
      );
    }

    await this.usersRepository.update(
      { email: data.user_email },
      update_fields,
    );

    return await this.findUser({ email: user_email });
  }

  async unlinkTwitchUserData(userId: number): Promise<any> {
    const user = await this.findUser({ id: userId });

    if (!user) {
      throw new UnprocessableEntityException(
        {
          statusCode: 422,
          message: `Cannot find user with an id of ${userId}`,
          error: 'Unprocessable Entity',
        },
        `User doesn't exist`,
      );
    }

    await this.usersRepository.update(
      { id: userId },
      {
        twitch_user_id: null,
        twitch_display_name: null,
        twitch_email: null,
        twitch_display_picture: null,
        twitch_followers_count: null,
        twitch_subscribers_count: null,
      },
    );

    const userTwitchVideos = await this.getUserTwitchVideos(userId);

    if (userTwitchVideos.length > 0) {
      userTwitchVideos.map((video: any) => {
        this.userTwitchVideosRepository.delete(video);
      });
    }

    const userTwitchSubscribers = await this.getUserTwitchSubscribers(userId);

    if (userTwitchSubscribers.length > 0) {
      userTwitchSubscribers.map((subscriber: any) => {
        this.userTwitchSubscribersRepository.delete(subscriber);
      });
    }

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

  hasExistingTwitchAccount(loggedInUser: UserDTO): boolean {
    if (loggedInUser.twitch_user_id) return true;
    return false;
  }
}
