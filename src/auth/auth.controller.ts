import {
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  Query,
  Redirect,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Request() req: any): any {
    return this.authService.login(req.user);
  }

  @Redirect('http://localhost:3000/')
  @Get('login')
  getUserTwitchAccessToken(
    @Query() { code, scope, state }: any,
  ): Promise<any> | { message: string } {
    if (code && scope && state) {
      // extract the email from the state
      // email is always between ":email" and ":"
      // Ex. dsgSAw1esdojxzMSsxna:emailthisismyemail@sample.com:
      // return "thisismyemail@sample.com"
      const pattern = /(?<=:email\s*).*?(?=\s*\:)/;
      const email = state.match(pattern)[0];
      return this.authService.getUserTwitchAccessToken(code, email);
    }
    return { message: `Server didn't return anything` };
  }
}
