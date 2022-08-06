import { Controller, Get, Query, Res } from '@nestjs/common';
import { extractFromState } from '@utils/index';
import { Response } from 'express';
import { TwitchService } from './services/twitch.service';

@Controller('twitch')
export class TwitchController {
  constructor(private twitchService: TwitchService) {}

  @Get('/auth')
  async processTwitchAuth(
    @Res() res: Response | any,
    @Query() { code, scope, state }: any,
  ): Promise<any> {
    try {
      if (code && scope && state) {
        /**
         *  state value should be in between :stateName and :
         *
         *  Ex. you want to pass an email and redirect_page to the state
         *  - the value of the email should be in between of :email and :
         *  - the value of the redirect_page should be in between of :redirect_page and :
         *
         *   if state === sAD!02d760&7s@0o3sd:emailmyemail@mail.com:redirect_page/home:
         *      - email === myemail@mail.com
         *      - redirect_page === /home
         *
         */
        const { email, redirect_page: redirectPage } = extractFromState(state, [
          'email',
          'redirect_page',
        ]);

        await this.twitchService.processTwitchAuth(code, email);

        res.redirect(`${process.env.CLIENT_HOST}${redirectPage}`);
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
