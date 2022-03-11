import { Controller, Get, Query, Redirect } from '@nestjs/common';
import { TwitchService } from './services/twitch.service';

@Controller('twitch')
export class TwitchController {
  constructor(private twitchService: TwitchService) {}

  private app_access_token = process.env.TWITCH_APP_ACCESS_TOKEN;

  @Redirect(`${process.env.CLIENT_HOST}/twitch-gaming`)
  @Get('/auth')
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

  @Get('/gaming-streams')
  getTopGamingStreams() {
    return this.twitchService.processTopGamingStreams(this.app_access_token);
  }

  @Get('/search-streams')
  getSearchStreams(@Query() { query }: any) {
    return this.twitchService.processSearchedStreams(
      query,
      this.app_access_token,
    );
  }
}
