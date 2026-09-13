import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { User } from '../users/entities/user.entity';
import { OtpCode } from './entities/otp-code.entity';
import { AdminUser } from '../admin/entities/admin-user.entity';
import { AuthService } from './auth.service';
import { AdminAuthService } from './admin-auth.service';
import { AuthController } from './auth.controller';
import { AdminAuthController } from './admin-auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { SMS_PROVIDER, EMAIL_PROVIDER } from './auth.constants';
import { ConsoleSmsProvider } from './providers/console-sms.provider';
import { ConsoleEmailProvider } from './providers/console-email.provider';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, OtpCode, AdminUser]),
    PassportModule,
    JwtModule.register({}), // نمرر secret/expiresIn لكل sign() على حدة (access مختلف عن refresh)
  ],
  controllers: [AuthController, AdminAuthController],
  providers: [
    AuthService,
    AdminAuthService,
    JwtStrategy,
    {
      provide: SMS_PROVIDER,
      // اختيار مزود الـSMS الفعلي عبر متغير البيئة SMS_PROVIDER بدون تعديل أي كود آخر
      useFactory: () => {
        switch (process.env.SMS_PROVIDER) {
          // case 'unifonic': return new UnifonicSmsProvider();
          // case 'twilio': return new TwilioSmsProvider();
          default:
            return new ConsoleSmsProvider();
        }
      },
    },
    {
      provide: EMAIL_PROVIDER,
      // اختيار مزود البريد الفعلي عبر متغير البيئة EMAIL_PROVIDER بدون تعديل أي كود آخر
      useFactory: () => {
        switch (process.env.EMAIL_PROVIDER) {
          // case 'sendgrid': return new SendgridEmailProvider();
          // case 'ses': return new SesEmailProvider();
          default:
            return new ConsoleEmailProvider();
        }
      },
    },
  ],
  exports: [AuthService, AdminAuthService],
})
export class AuthModule {}
