import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Redirect,
} from '@nestjs/common';
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

  @Redirect(`${process.env.CLIENT_HOST}/youtube-gaming`)
  @Get('/auth')
  processYoutubeAuth(
    @Query()
    { code, scope, state }: { code: string; scope: string; state: string },
  ) {
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
        return this.youtubeService.processYoutubeAuth(code, email);
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
