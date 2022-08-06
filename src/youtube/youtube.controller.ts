import { Controller, Get, Query, Res } from '@nestjs/common';
import { extractFromState } from '@utils/extractFromState';
import { Response } from 'express';
import { YoutubeService } from './services/youtube.service';

@Controller('youtube')
export class YoutubeController {
  constructor(private youtubeService: YoutubeService) {}

  private apiKey = process.env.GOOGLE_API_KEY;

  private gameNames = [
    'Garena Free Fire',
    'Minecraft',
    'Apex Legends',
    'GTA V',
    'Mobile Legends: Bang Bang',
    'Pokémon Legends: Arceus',
    'Battlegrounds Mobile India',
    'Fortnite',
    'Roblox',
    'Lineage W',
    'Valorant',
    'Garena Free Fire MAX',
    'World of Tanks',
    'Gates of Olympus Slot Pragmatic',
    'Maple Story',
    'Scary Teacher 3D',
    'PUBG MOBILE',
  ];

  // gameNames setter for testing
  public setGameNames = (games: Array<string>) => {
    this.gameNames = games;
  };

  // apiKey setter for testing
  public setApiKey = (apiKey: string) => {
    this.apiKey = apiKey;
  };

  @Get('/auth')
  async processYoutubeAuth(
    @Res() res: Response | any,
    @Query()
    { code, scope, state }: { code: string; scope: string; state: string },
  ) {
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

        await this.youtubeService.processYoutubeAuth(code, email);

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
    try {
      return await this.youtubeService.processTopGamingStreams({
        apiKey: this.apiKey,
        games: this.gameNames,
        streamCount: streamCount || 8,
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @Get('/search')
  getSearchResults(
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
    try {
      return this.youtubeService.processSearchResults({
        apiKey: this.apiKey,
        query,
        searchResultsCount: searchResultsCount || 10,
        searchSuggestionsCount: searchSuggestionsCount || 6,
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
