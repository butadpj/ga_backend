import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UnprocessableEntityException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '@auth/jwt-auth.guard';
import { isValidImage } from '@utils/index';
import { UserDTO } from './dto';
import { UpdateUserInfoDTO } from './dto/update-user-info.dto';
import { Role } from './roles/role.enum';
import { Roles } from './roles/roles.decorator';
import { RolesGuard } from './roles/roles.guard';
import { UsersTwitchDataService } from './services/users-twitch-data.service';
import { UsersYoutubeDataService } from './services/users-youtube-data.service';
import { UsersService } from './services/users.service';

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private usersTwitchDataService: UsersTwitchDataService,
    private usersYoutubeDataService: UsersYoutubeDataService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/')
  @Roles(Role.User, Role.Admin)
  allUsers(): Promise<UserDTO[]> {
    return this.usersService.allUsers();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  @Roles(Role.User, Role.Admin)
  async getUser(@Param('id') id: string): Promise<UserDTO> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = await this.usersService.findUser({
      id: Number(id),
    });

    return rest;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put('update-info/:id')
  @Roles(Role.User, Role.Admin)
  @UseInterceptors(FileInterceptor('profilePicture'))
  async updateUserInfo(
    @Param('id') id: string,
    @Body() updateFields: UpdateUserInfoDTO,
  ): Promise<any> {
    if (!updateFields.displayName && !updateFields.profilePicture) return;
    return await this.usersService.updateUserInfo(Number(id), updateFields);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/upload-profile-picture/:id')
  @Roles(Role.User, Role.Admin)
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfilePicture(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<any> {
    if (isValidImage(file)) {
      return await this.usersService.uploadProfilePicture(Number(id), {
        buffer: file.buffer,
        contentType: file.mimetype,
        fileName: file.originalname,
      });
    }
    throw new UnprocessableEntityException(
      {
        statusCode: 422,
        message: `Uploaded file is not a valid image`,
        error: 'Unprocessable Entity',
      },
      `File not a valid image`,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('/delete-profile-picture/:id')
  @Roles(Role.User, Role.Admin)
  async deleteProfilePicture(@Param('id') id: string): Promise<any> {
    return await this.usersService.deleteProfilePicture(Number(id));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User, Role.Admin)
  @Delete('/delete/:id')
  async deleteUser(@Param('id') id: string): Promise<any> {
    return this.usersService.deleteUser(Number(id));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/twitch-data/:id')
  @Roles(Role.User, Role.Admin)
  getUserTwitchData(@Param('id') id: string): Promise<UserDTO> {
    return this.usersTwitchDataService.getUserTwitchData(Number(id));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/twitch-videos/:id')
  @Roles(Role.User, Role.Admin)
  getUserTwitchVideos(@Param('id') id: string): Promise<UserDTO> {
    return this.usersTwitchDataService.getUserTwitchVideos(Number(id));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/twitch-subscribers/:id')
  @Roles(Role.User, Role.Admin)
  getUserTwitchSubscribers(@Param('id') id: string): Promise<UserDTO> {
    return this.usersTwitchDataService.getUserTwitchSubscribers(Number(id));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/unlink-twitch/:id')
  @Roles(Role.User, Role.Admin)
  unLinkTwitchAccount(@Param('id') id: string): Promise<UserDTO> {
    return this.usersTwitchDataService.deleteUserTwitchData(Number(id));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/youtube-data/:id')
  @Roles(Role.User, Role.Admin)
  getUserYoutubeData(@Param('id') id: string): Promise<UserDTO> {
    return this.usersYoutubeDataService.getUserYoutubeData(Number(id));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/youtube-subscribers/:id')
  @Roles(Role.User, Role.Admin)
  getUserYoutubeSubscribers(@Param('id') id: string): Promise<UserDTO> {
    return this.usersYoutubeDataService.getUserYoutubeSubscribers(Number(id));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/unlink-youtube/:id')
  @Roles(Role.User, Role.Admin)
  unLinkYoutubeAccount(@Param('id') id: string): Promise<UserDTO> {
    return this.usersYoutubeDataService.deleteUserYoutubeData(Number(id));
  }
}
