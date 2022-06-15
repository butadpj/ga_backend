import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Redirect,
} from '@nestjs/common';
import { TwitchService } from './services/twitch.service';

@Controller('twitch')
export class TwitchController {
  constructor(private twitchService: TwitchService) {}

  @Redirect(`${process.env.CLIENT_HOST}/twitch-gaming`)
  @Get('/auth')
  processTwitchAuth(
    @Query() { code, scope, state }: any,
  ): Promise<any> | { message: string } {
    try {
      if (code && scope && state) {
        // extract the email from the state
        // email is always between ":email" and ":"
        // Ex. dsgSAw1esdojxzMSsxna:emailthisismyemail@sample.com:
        // return "thisismyemail@sample.com"
        const pattern = /(?<=:email\s*).*?(?=\s*\:)/;

        if (state.match(pattern) === null) {
          throw new BadRequestException(
            `No email can be found in state. Email must be enclosed in ":email" and ":"`,
          );
        }

        const email = state.match(pattern)[0];

        return this.twitchService.processTwitchAuth(code, email);
      }
      return { message: `Server didn't return anything` };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @Get('/gaming-streams')
  async getTopGamingStreams(
    @Query() { streamCount }: { streamCount?: number },
  ) {
    const app_access_token = await this.twitchService.getAppAccessToken();

    return this.twitchService.processTopGamingStreams({
      access_token: app_access_token,
      streamCount: streamCount || 8,
    });
  }

  @Get('/search')
  async getSearchResults(
    @Query()
    {
      query,
      searchResultsCount,
      searchSuggestionsCount,
    }: {
      query: string;
      searchResultsCount?: number;
      searchSuggestionsCount?: number;
    },
  ) {
    const app_access_token = await this.twitchService.getAppAccessToken();

    return this.twitchService.processSearchResults({
      query,
      access_token: app_access_token,
      searchResultsCount: searchResultsCount || 10,
      searchSuggestionsCount: searchSuggestionsCount || 5,
    });
  }
}
