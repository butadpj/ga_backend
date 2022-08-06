import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDTO, UserDTO } from '../dto';
import { User } from '@users/entity/user.entity';
import * as bcrypt from 'bcrypt';
import { UpdateUserDTO } from '@users/dto/update-user.dto';
import { FilesService } from '@files/files.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private filesService: FilesService,
  ) {}

  async allUsers(): Promise<UserDTO[]> {
    return await this.usersRepository.find();
  }

  async findUser({
    id,
    email,
  }: {
    id?: number;
    email?: string;
  }): Promise<UserDTO | null> {
    // Find by email
    if (email) {
      const user = await this.usersRepository.findOne({
        where: { email },
      });

      if (!user) {
        return null;
      }

      return user;
    }

    // Find by id
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      return null;
    }

    return user;
  }

  async hashPassword(password: string): Promise<string> {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
  }

  async createUser(credentials: CreateUserDTO): Promise<any> {
    const user = await this.findUser({ email: credentials.email });

    if (user)
      throw new UnprocessableEntityException(
        'User with that email already exists',
      );

    const createdUser = this.usersRepository.create({
      email: credentials.email,
      password: await this.hashPassword(credentials.password),
    });

    return await this.usersRepository.save(createdUser);
  }

  // Critical  info can't be updated by this function
  async updateUserInfo(
    userId: number,
    updateFields: UpdateUserDTO,
  ): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { email, password, role, isEmailConfirmed, ...exceptCriticalInfo } =
      updateFields;

    // If picture is not coming from Object Storage (without key)
    if (
      exceptCriticalInfo.profilePicture &&
      !exceptCriticalInfo.profilePicture.key
    ) {
      const user = await this.findUser({ id: userId });

      if (!user)
        throw new NotFoundException(
          "Error updating user's information. User doesn't exist",
        );

      if (user.profilePicture) {
        await this.usersRepository.update(
          { id: userId },
          { profilePicture: null },
        );

        if (user.profilePicture.key) {
          await this.filesService.deletePublicFile(user.profilePicture.id);
        } else {
          await this.filesService.deletePublicFile(
            user.profilePicture.id,
            false,
          );
        }
      }

      const createdProfilePicture =
        await this.filesService.createProfilePicture({
          url: exceptCriticalInfo.profilePicture.url,
          key: null,
        });

      await this.usersRepository.update(
        { id: userId },
        {
          displayName: exceptCriticalInfo.displayName,
          profilePicture: createdProfilePicture,
        },
      );

      return exceptCriticalInfo;
    }

    await this.usersRepository.update({ id: userId }, exceptCriticalInfo);
    return exceptCriticalInfo;
  }

  async deleteUser(userId: number): Promise<any> {
    const user = await this.findUser({ id: userId });

    if (!user) {
      throw new NotFoundException(`Error deleting user. User doesn't exist`);
    }

    await this.usersRepository.delete({ id: user.id });

    return {
      message: `Good bye ${user.email} 👋. Till we meet again!`,
    };
  }

  async markEmailAsConfirmed(email: string) {
    await this.usersRepository.update(
      { email },
      {
        isEmailConfirmed: true,
      },
    );

    return await this.findUser({ email });
  }

  async uploadProfilePicture(
    userId: number,
    imageFile: { buffer: Buffer; fileName: string; contentType: string },
  ): Promise<any> {
    const user = await this.findUser({ id: userId });

    if (!user)
      throw new NotFoundException(
        "Error uploading user's profile picture subscribers. User doesn't exist",
      );

    const uploadedPicture = await this.filesService.uploadFileToS3(
      imageFile.buffer,
      imageFile.fileName,
      imageFile.contentType,
    );

    // Delete previous profile picture, if there's an existing one
    if (user.profilePicture) {
      await this.updateUserInfo(userId, { profilePicture: null });

      if (user.profilePicture.key) {
        await this.filesService.deletePublicFile(user.profilePicture.id);
      } else {
        await this.filesService.deletePublicFile(user.profilePicture.id, false);
      }
    }

    const profilePicture = await this.filesService.createProfilePicture({
      key: uploadedPicture.Key,
      url: uploadedPicture.Location,
    });

    await this.updateUserInfo(userId, { profilePicture });

    return profilePicture;
  }

  async deleteProfilePicture(userId: number) {
    const user = await this.findUser({ id: userId });

    if (!user)
      throw new NotFoundException(
        "Error deleting user's profile picture. User doesn't exist",
      );

    if (user.profilePicture) {
      await this.updateUserInfo(userId, {
        profilePicture: null,
      });

      if (user.profilePicture.key) {
        await this.filesService.deletePublicFile(user.profilePicture.id);
      } else {
        await this.filesService.deletePublicFile(user.profilePicture.id, false);
      }

      return { message: `User's profile picture deleted` };
    }

    throw new UnprocessableEntityException(
      {
        statusCode: 422,
        message: `User doesn't have any profile picture`,
        error: 'Unprocessable Entity',
      },
      `User profile picture empty`,
    );
  }
}
