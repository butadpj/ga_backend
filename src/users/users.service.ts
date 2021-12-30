import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDTO, UserDTO } from './dto';
import { User } from '@users/entity/user.entity';
import * as bcrypt from 'bcrypt';
import { UserTwitchVideo } from './entity/user-twitch-video.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserTwitchVideo)
    private userTwitchVideoRepository: Repository<UserTwitchVideo>,
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

  async getUserTwitchVideos(userId: string): Promise<any> {
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

    return this.userTwitchVideoRepository.find({ where: { user: userId } });
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

    const twitchVideo = this.userTwitchVideoRepository.create({
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

    await this.userTwitchVideoRepository.save(twitchVideo);

    user.twitch_videos = [twitchVideo];

    return this.usersRepository.save(user);
  }

  async updateTwitchUserData({
    user_email,
    twitch_user_id,
    twitch_display_name,
    twitch_email,
    twitch_display_picture,
  }): Promise<any> {
    const user = await this.findUser({ email: user_email });

    if (!user) {
      throw new UnprocessableEntityException(
        {
          statusCode: 422,
          message: `Cannot find user with an email of ${user_email}`,
          error: 'Unprocessable Entity',
        },
        `User doesn't exist`,
      );
    }

    await this.usersRepository.update(
      { email: user_email },
      {
        twitch_user_id,
        twitch_display_name,
        twitch_email,
        twitch_display_picture,
      },
    );

    return await this.findUser({ email: user_email });
  }

  async unlinkTwitchUserData(userId: string): Promise<any> {
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
      { id: Number(userId) },
      {
        twitch_user_id: null,
        twitch_display_name: null,
        twitch_email: null,
        twitch_display_picture: null,
      },
    );

    const userTwitchVideos = await this.getUserTwitchVideos(userId);

    if (userTwitchVideos.length > 0) {
      userTwitchVideos.map((video) => {
        this.userTwitchVideoRepository.delete(video);
      });
    }

    return await this.findUser({ id: userId });
  }
}
