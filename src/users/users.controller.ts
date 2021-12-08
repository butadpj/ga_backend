import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateUserDTO, UserDTO } from './dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/')
  allUsers(): Promise<UserDTO[]> {
    return this.usersService.allUsers();
  }

  @Post('/')
  createUser(@Body() credentials: CreateUserDTO): Promise<any | TypeError> {
    return this.usersService.createUser(credentials);
  }

  // login(): LoginUserDTO {
  //   return
  // }
}
