import { Injectable, NotFoundException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { UsersService } from '@users/services/users.service';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from '../constants';

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
    const { userId } = payload;

    const user = await this.usersService.findUser({ id: userId });

    if (!user)
      throw new NotFoundException(
        `User with a user id of ${userId} (from token payload)  doesn't exist`,
      );

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
}
