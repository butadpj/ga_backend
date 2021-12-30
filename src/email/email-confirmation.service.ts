import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@users/users.service';
import { AuthService } from 'src/auth/auth.service';
import { jwtConstants } from 'src/auth/constants';
import { EmailService } from './email.service';

@Injectable()
export class EmailConfirmationService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private usersService: UsersService,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
  ) {}

  async sendVerificationLink(email: string) {
    const payload = { email };
    const token = this.jwtService.sign(payload);

    const url = `${process.env.CLIENT_HOST}/email-confirm?token=${token}`;

    const text = `Welcome to the application. To confirm the email address, click here: ${url}`;

    return this.emailService.sendMail({
      to: email,
      subject: 'Email confirmation',
      text,
    });
  }

  public async confirmEmail(email: string) {
    const user = await this.usersService.findUser({ email });

    if (user.isEmailConfirmed) {
      throw new BadRequestException('Email already confirmed');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    await this.usersService.markEmailAsConfirmed(email);

    const loggedInUser = await this.authService.login(user);

    return loggedInUser;
  }

  public async decodeConfirmationToken(token: string) {
    try {
      const payload = await this.jwtService.verify(token, {
        secret: jwtConstants.secret,
      });

      if (typeof payload === 'object' && 'email' in payload) {
        return payload.email;
      }
    } catch (error) {
      console.error(error);
      if (error?.name === 'TokenExpiredError') {
        throw new BadRequestException({
          message: 'Confirmation token has already expired',
        });
      }
      throw new BadRequestException({
        message: 'Bad confirmation token',
      });
    }
  }
}
