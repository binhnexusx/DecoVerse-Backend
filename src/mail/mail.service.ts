import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly resend: Resend;
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.resend = new Resend(apiKey);
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

      await this.resend.emails.send({
        from: 'DecoVerse <onboarding@resend.dev>',
        to: toEmail,
        subject: `🎨 ${ownerName} invited you to view "${projectName}"`,
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px;">
            <div style="background: #0891b2; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">DecoVerse</h1>
            </div>
            <div style="padding: 24px;">
              <p><strong>${ownerName}</strong> shared "${projectName}" with you.</p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${inviteLink}" style="background: #0891b2; color: white; padding: 12px 32px; border-radius: 6px; text-decoration: none;">
                  View Design
                </a>
              </div>
              <p style="color: #64748b; font-size: 13px;">Login with ${toEmail} to access</p>
            </div>
          </div>
        `,
      });

      this.logger.log(`Email sent to ${toEmail}`);
    } catch (error) {
      this.logger.error('Send email failed:', error);
      throw error;
    }
  }
}
