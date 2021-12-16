import { Controller, Get, Query, Redirect } from '@nestjs/common';
import { TwitchService } from './twitch.service';

@Controller('twitch-auth')
export class TwitchController {
  constructor(private twitchService: TwitchService) {}

  @Redirect(process.env.CLIENT_HOST)
  @Get('/')
  processTwitchAuth(
    @Query() { code, scope, state }: any,
  ): Promise<any> | { message: string } {
    if (code && scope && state) {
      // extract the email from the state
      // email is always between ":email" and ":"
      // Ex. dsgSAw1esdojxzMSsxna:emailthisismyemail@sample.com:
      // return "thisismyemail@sample.com"
      const pattern = /(?<=:email\s*).*?(?=\s*\:)/;
      const email = state.match(pattern)[0];
      return this.twitchService.processTwitchAuth(code, email);
    }
    return { message: `Server didn't return anything` };
  }
}
