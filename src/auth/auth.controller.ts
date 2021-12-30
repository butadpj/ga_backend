import {
  Controller,
  Post,
  UseGuards,
  Request,
  Body,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { CreateUserDTO } from '@users/dto';
import { EmailConfirmationService } from '../email/email-confirmation.service';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';

@Controller()
export class AuthController {
  constructor(
    private authService: AuthService,
    @Inject(forwardRef(() => EmailConfirmationService))
    private emailConfirmationService: EmailConfirmationService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Request() req: any): any {
    return this.authService.login(req.user);
  }

  @Post('register')
  async register(@Body() credentials: CreateUserDTO): Promise<any> {
    const user = await this.authService.register(credentials);
    await this.emailConfirmationService.sendVerificationLink(user.email);
    return user;
  }
}
