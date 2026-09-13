import { Injectable, Logger } from '@nestjs/common';
import { EmailProvider } from './email-provider.interface';

// Provider للتطوير المحلي فقط: يطبع كود الـOTP في الـLogs بدل إرساله فعليًا كبريد إلكتروني.
// عند توفر حساب مزود بريد حقيقي (SendGrid/SES/Postmark)، يُستبدل هذا الـProvider بواحد فعلي
// يطبّق نفس EmailProvider Interface عبر متغير البيئة EMAIL_PROVIDER، بدون تعديل AuthService.
@Injectable()
export class ConsoleEmailProvider implements EmailProvider {
  private readonly logger = new Logger('Email[console-dev]');

  async sendOtp(email: string, code: string): Promise<void> {
    this.logger.warn(
      `[DEV ONLY] OTP for ${email}: ${code} — لن يُرسل بريد حقيقي حتى يتم ربط مزود فعلي (SendGrid/SES).`,
    );
  }
}
