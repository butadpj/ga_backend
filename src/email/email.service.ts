import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { createTransport } from 'nodemailer';
import * as Mail from 'nodemailer/lib/mailer';

@Injectable()
export class EmailService {
  private nodemailerTransport: Mail;

  private clientId = process.env.GOOGLE_CLIENT_ID;
  private clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  private refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  private OAuth2Client = new google.auth.OAuth2({
    clientId: this.clientId,
    clientSecret: this.clientSecret,
    redirectUri: process.env.HOST,
  });

  constructor() {
    this.OAuth2Client.setCredentials({ refresh_token: this.refreshToken });
  }

  async sendMail(options: Mail.Options) {
    const { token } = await this.OAuth2Client.getAccessToken();

    this.nodemailerTransport = createTransport({
      // supported services https://nodemailer.com/smtp/well-known/
      service: process.env.EMAIL_SERVICE,
      auth: {
        type: 'OAuth2',
        clientId: this.clientId,
        clientSecret: this.clientSecret,
        user: process.env.EMAIL_USER,
        accessToken: token,
        refreshToken: this.refreshToken,
      },
    });

    return this.nodemailerTransport.sendMail(options);
  }
}
