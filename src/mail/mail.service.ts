import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Mailjet from 'node-mailjet';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MailService {
  private mailjet: Mailjet.Client;

  constructor(private readonly configService: ConfigService) {
    this.mailjet = new Mailjet.Client({
      apiKey: this.configService.get<string>('MJ_APIKEY_PUBLIC'),
      apiSecret: this.configService.get<string>('MJ_APIKEY_PRIVATE'),
    });
  }

  async sendVerificationEmail(email: string, token: string) {
    const verificationLink = `${this.configService.get<string>('FRONTEND_URL')}/verify-email?token=${token}`;
    
    const templatePath = path.join(process.cwd(), 'src/mail/mail-templates/mail-verify.html');
    const htmlContent = fs.readFileSync(templatePath, 'utf8').replace('{{verification_link}}', verificationLink);

    return this.mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: this.configService.get<string>('MJ_SENDER_EMAIL'),
            Name: 'Vinyl Store',
          },
          To: [
            {
              Email: email,
            },
          ],
          Subject: 'Vérifiez votre adresse email',
          HTMLPart: htmlContent,
        },
      ],
    });
  }

  async sendResendVerificationEmail(email: string, token: string) {
    const verificationLink = `${this.configService.get<string>('FRONTEND_URL')}/verify-email?token=${token}`;
    
    const templatePath = path.join(process.cwd(), 'src/mail/mail-templates/mail-verify.html');
    const htmlContent = fs.readFileSync(templatePath, 'utf8').replace('{{verification_link}}', verificationLink);

    return this.mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: this.configService.get<string>('MJ_SENDER_EMAIL'),
            Name: 'Vinyl Store',
          },
          To: [
            {
              Email: email,
            },
          ],
          Subject: 'Votre nouveau lien de vérification',
          HTMLPart: htmlContent,
        },
      ],
    });
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const resetLink = `${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${token}`;

    const templatePath = path.join(process.cwd(), 'src/mail/mail-templates/mail-reset-password.html');
    const htmlContent = fs.readFileSync(templatePath, 'utf8')
      .replace('[RESET_LINK]', resetLink)
      .replace('[EMAIL]', email);

    return this.mailjet.post('send', { version: 'v3.1' }).request({
        Messages: [
            {
                From: {
                    Email: this.configService.get<string>('MJ_SENDER_EMAIL'),
                    Name: 'Vinyl Store',
                },
                To: [
                    {
                        Email: email,
                    },
                ],
                Subject: 'Réinitialisation de votre mot de passe',
                HTMLPart: htmlContent,
            },
        ],
    });
  }
} 