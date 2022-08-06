import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Post,
  Put,
  Request,
  UnprocessableEntityException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '@auth/guard/jwt-auth.guard';
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
  @Get('/me')
  @Roles(Role.User, Role.Admin)
  async getUser(@Request() req: any): Promise<UserDTO> {
    const userId = req.user.id;

    const user = await this.usersService.findUser({
      id: userId,
    });

    if (!user)
      throw new NotFoundException(
        "Error retrieving user's data. User doesn't exist",
      );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...exceptPassword } = user;

    return exceptPassword;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put('/me/update-info')
  @Roles(Role.User, Role.Admin)
  @UseInterceptors(FileInterceptor('profilePicture'))
  async updateUserInfo(
    @Request() req: any,
    @Body() updateFields: UpdateUserInfoDTO,
  ): Promise<any> {
    const userId = req.user.id;

    if (!updateFields.displayName && !updateFields.profilePicture) return;
    return await this.usersService.updateUserInfo(userId, updateFields);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/me/upload-profile-picture')
  @Roles(Role.User, Role.Admin)
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfilePicture(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<any> {
    const userId = req.user.id;

    if (isValidImage(file)) {
      return await this.usersService.uploadProfilePicture(userId, {
        buffer: file.buffer,
        contentType: file.mimetype,
        fileName: file.originalname,
      });
    }

    throw new UnprocessableEntityException(
      `Uploaded file is not a valid image`,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('/me/delete-profile-picture')
  @Roles(Role.User, Role.Admin)
  async deleteProfilePicture(@Request() req: any): Promise<any> {
    const userId = req.user.id;

    return await this.usersService.deleteProfilePicture(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User, Role.Admin)
  @Delete('/me/delete-account')
  async deleteUser(@Request() req: any): Promise<any> {
    const userId = req.user.id;

    return this.usersService.deleteUser(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/me/twitch-data')
  @Roles(Role.User, Role.Admin)
  getUserTwitchData(@Request() req: any): Promise<UserDTO> {
    const userId = req.user.id;

    return this.usersTwitchDataService.getUserTwitchData(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/me/twitch-subscribers/')
  @Roles(Role.User, Role.Admin)
  getUserTwitchSubscribers(@Request() req: any): Promise<UserDTO> {
    const userId = req.user.id;

    return this.usersTwitchDataService.getUserTwitchSubscribers(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/me/unlink-twitch')
  @Roles(Role.User, Role.Admin)
  unLinkTwitchAccount(@Request() req: any): Promise<UserDTO> {
    const userId = req.user.id;

    return this.usersTwitchDataService.deleteUserTwitchData(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/me/youtube-data/')
  @Roles(Role.User, Role.Admin)
  getUserYoutubeData(@Request() req: any): Promise<UserDTO> {
    const userId = req.user.id;

    return this.usersYoutubeDataService.getUserYoutubeData(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/me/youtube-subscribers')
  @Roles(Role.User, Role.Admin)
  getUserYoutubeSubscribers(@Request() req: any): Promise<UserDTO> {
    const userId = req.user.id;

    return this.usersYoutubeDataService.getUserYoutubeSubscribers(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/me/unlink-youtube')
  @Roles(Role.User, Role.Admin)
  unLinkYoutubeAccount(@Request() req: any): Promise<UserDTO> {
    const userId = req.user.id;

    return this.usersYoutubeDataService.deleteUserYoutubeData(userId);
  }
}
