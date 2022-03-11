import { Controller, Get, Query, Redirect } from '@nestjs/common';
import { YoutubeService } from './services/youtube.service';

@Controller('youtube')
export class YoutubeController {
  constructor(private youtubeService: YoutubeService) {}

  private api_key = process.env.GOOGLE_API_KEY;

  @Redirect(`${process.env.CLIENT_HOST}/youtube-gaming`)
  @Get('/auth')
  processTwitchAuth(
    @Query() { code, scope, state }: any,
  ): any | { message: string } {
    if (code && scope && state) {
      // extract the email from the state
      // email is always between ":email" and ":"
      // Ex. dsgSAw1esdojxzMSsxna:emailthisismyemail@sample.com:
      // return "thisismyemail@sample.com"
      const pattern = /(?<=:email\s*).*?(?=\s*\:)/;
      const email = state.match(pattern)[0];
      return this.youtubeService.processYoutubeAuth(code, email);
    }
    return { message: `Server didn't return anything` };
  }

  @Get('/gaming-streams')
  getTopGamingStreams() {
    return this.youtubeService.processTopGamingStreams(this.api_key);
  }

  @Get('/search-streams')
  getSearchStreams(@Query() { query }: any) {
    return this.youtubeService.processSearchedStreams(query, this.api_key);
  }
}
