import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDTO, UserDTO } from './dto';
import { User } from '@users/entity/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async allUsers(): Promise<UserDTO[]> {
    return await this.usersRepository.find();
  }

  async findUser(email: string): Promise<UserDTO | undefined> {
    return await this.usersRepository.findOne({ where: { email: email } });
  }

  async hashPassword(password: string): Promise<string> {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
  }

  async createUser(credentials: CreateUserDTO): Promise<any> {
    let user = await this.findUser(credentials.email);

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

  async createTwitchUserData({
    user_email,
    twitch_user_id,
    twitch_display_name,
    twitch_email,
    twitch_display_picture,
  }): Promise<any> {
    const user = await this.findUser(user_email);

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

    this.usersRepository.update(
      { email: user_email },
      {
        twitch_user_id,
        twitch_display_name,
        twitch_email,
        twitch_display_picture,
      },
    );

    return await this.findUser(user_email);
  }
}
