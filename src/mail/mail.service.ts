import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      },
    });
  }

  async sendInviteEmail(
    toEmail: string,
    projectName: string,
    projectId: string,
    ownerName: string,
  ): Promise<void> {
    try {
      const frontendUrl =
        this.configService.get<string>('FRONTEND_URL') ||
        process.env.FRONTEND_URL;

      const inviteLink = `${frontendUrl}/projects/${projectId}`;
      const mailUser = this.configService.get<string>('MAIL_USER');

      await this.transporter.sendMail({
        from: `"DecoVerse" <${mailUser}>`,
        to: toEmail,
        subject: `🎨 ${ownerName} invited you to view "${projectName}"`,
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background: #0891b2; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">DecoVerse</h1>
            </div>
            <div style="padding: 24px;">
              <p style="color: #1e293b;"><strong>${ownerName}</strong> shared "${projectName}" with you.</p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${inviteLink}" style="background: #0891b2; color: white; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
                  View Design
                </a>
              </div>
              <p style="color: #64748b; font-size: 13px;">Login with ${toEmail} to access</p>
            </div>
          </div>
        `,
      });

      this.logger.log(`Email sent successfully to ${toEmail}`);
    } catch (error) {
      this.logger.error('Send email failed:', error);
      throw error;
    }
  }
}
