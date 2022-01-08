import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserDTO } from './dto';
import { Role } from './roles/role.enum';
import { Roles } from './roles/roles.decorator';
import { RolesGuard } from './roles/roles.guard';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/')
  @Roles(Role.User, Role.Admin)
  allUsers(): Promise<UserDTO[]> {
    return this.usersService.allUsers();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  @Roles(Role.User, Role.Admin)
  getUser(@Param('id') id: string): Promise<UserDTO> {
    return this.usersService.findUser({ id: Number(id) });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/twitch-videos/:id')
  @Roles(Role.User, Role.Admin)
  getUserTwitchVideos(@Param('id') id: string): Promise<UserDTO> {
    return this.usersService.getUserTwitchVideos(Number(id));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/twitch-subscribers/:id')
  @Roles(Role.User, Role.Admin)
  getUserTwitchSubscribers(@Param('id') id: string): Promise<UserDTO> {
    return this.usersService.getUserTwitchSubscribers(Number(id));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/unlink-twitch/:id')
  @Roles(Role.User, Role.Admin)
  unLinkTwitchAccount(@Param('id') id: string): Promise<UserDTO> {
    return this.usersService.unlinkTwitchUserData(Number(id));
  }
}
