import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@users/services/users.service';
import { AuthService } from '@auth/auth.service';
import { jwtConstants } from '@auth/constants';
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

    const html = `
      <div style="padding: 2rem 5rem; background-color: #f5f5f7; color: #1e1e1e;">
        <img src="https://i.ibb.co/x1TBcSX/ga-logo.png"/>
        <br/>
        <h1>Welcome to Game-Antena!</h1>
        <br/>
        <h2>Just click the confirmation link below to login: </h2>
        <h3>${url}</h3>
      </div>
    `;

    return this.emailService.sendMail({
      from: 'Game-Antena',
      to: email,
      subject: `Confirm your account on Game-Antena`,
      html,
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
