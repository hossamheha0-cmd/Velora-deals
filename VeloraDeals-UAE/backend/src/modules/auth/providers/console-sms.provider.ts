import { Injectable, Logger } from '@nestjs/common';
import { SmsProvider } from './sms-provider.interface';

// Provider للتطوير المحلي فقط: يطبع الكود في الـLogs بدل إرساله فعليًا.
// عند توفر حساب Unifonic/Twilio حقيقي، يُستبدل هذا الـProvider بواحد فعلي يطبق نفس SmsProvider Interface
// عبر متغير البيئة SMS_PROVIDER، بدون أي تعديل في AuthService.
@Injectable()
export class ConsoleSmsProvider implements SmsProvider {
  private readonly logger = new Logger('SMS[console-dev]');

  async sendOtp(phoneNumber: string, code: string): Promise<void> {
    this.logger.warn(
      `[DEV ONLY] OTP for ${phoneNumber}: ${code} — لن يُرسل SMS حقيقي حتى يتم ربط مزود فعلي (Unifonic/Twilio).`,
    );
  }
}
