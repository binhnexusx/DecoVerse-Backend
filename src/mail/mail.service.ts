import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }
  async sendInviteEmail(
    toEmail: string,
    projectName: string,
    projectId: string,
    ownerName: string,
  ) {
    const inviteLink = `${process.env.FRONTEND_URL}/projects/${projectId}`;

    try {
      await this.resend.emails.send({
        from: 'DecoVerse <onboarding@resend.dev>',
        to: toEmail,
        subject: `🎨 ${ownerName} invited you to view the design "${projectName}"`,
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #0891b2; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">DecoVerse</h1>
            </div>
            <div style="padding: 24px; color: #1e293b;">
              <p>Hello,</p>
              <p><strong>${ownerName}</strong> has shared a 3D interior design <strong>"${projectName}"</strong> with you.</p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${inviteLink}" style="background-color: #0891b2; color: white; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                  View design now
                </a>
              </div>
              <p style="font-size: 13px; color: #64748b;">This link requires you to log in with the email ${toEmail} to access.</p>
            </div>
          </div>
        `,
      });
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
}
