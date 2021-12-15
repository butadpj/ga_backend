import { Injectable, NotFoundException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { UsersService } from '@users/users.service';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from './constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreException: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: any) {
    const { email } = payload;

    const user = await this.usersService.findUser({ email });

    if (!user) {
      throw new NotFoundException(
        {
          statusCode: 404,
          message: `User doesn't exist`,
          error: 'Not found exception',
        },
        'User not found',
      );
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
}
