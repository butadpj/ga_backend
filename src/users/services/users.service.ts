import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDTO, UserDTO } from '../dto';
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

  async findUser({ id, email }: any): Promise<UserDTO> {
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
}
