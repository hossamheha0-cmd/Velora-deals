import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { User, UserStatus } from '../users/entities/user.entity';
import { OtpCode, OtpChannel, OtpPurpose } from './entities/otp-code.entity';
import { RegisterWithEmailDto, LoginWithEmailDto } from './dto/email-auth.dto';
import { SMS_PROVIDER, EMAIL_PROVIDER } from './auth.constants';
import { SmsProvider } from './providers/sms-provider.interface';
import { EmailProvider } from './providers/email-provider.interface';

const SALT_ROUNDS = 10; // مطابق للمواصفة الفنية المعتمدة (bcrypt saltRounds = 10)

// نتيجة التسجيل/الدخول - قد ترجع توكنات فعلية (نجاح كامل) أو حالة "OTP مطلوب" (تفعيل إلزامي)
export interface AuthOutcome {
  requiresOtpVerification: boolean;
  accessToken?: string;
  refreshToken?: string;
  userId?: string;
  termsAccepted?: boolean;
  message?: string;
}

@Injectable()
export class AuthService {
  private readonly googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  private readonly appleJwks = createRemoteJWKSet(new URL('https://appleid.apple.com/auth/keys'));

  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    @InjectRepository(OtpCode) private readonly otpRepo: Repository<OtpCode>,
    private readonly jwtService: JwtService,
    @Inject(SMS_PROVIDER) private readonly smsProvider: SmsProvider,
    @Inject(EMAIL_PROVIDER) private readonly emailProvider: EmailProvider,
  ) {}

  // ================= Email + Password =================
  // التسجيل بالبريد لا يُصدر توكنات فورًا - يُنشئ الحساب بحالة غير مُفعَّل ويرسل OTP إلزاميًا،
  // ولا يحصل العميل على جلسة فعلية إلا بعد التحقق من الكود (verifyOtp) - "OTP إلزامي لتفعيل الحساب"

  async registerWithEmail(dto: RegisterWithEmailDto): Promise<AuthOutcome> {
    const existing = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('يوجد حساب مسجل بهذا البريد الإلكتروني بالفعل');
    }
    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = this.usersRepo.create({
      email: dto.email,
      passwordHash,
      fullName: dto.fullName ?? null,
      emailVerified: false,
    });
    await this.usersRepo.save(user);

    await this.sendOtpInternal(dto.email, OtpChannel.EMAIL, OtpPurpose.REGISTER);

    return {
      requiresOtpVerification: true,
      message: 'تم إنشاء الحساب. برجاء إدخال رمز التحقق المُرسَل إلى بريدك الإلكتروني لتفعيله.',
    };
  }

  async loginWithEmail(dto: LoginWithEmailDto): Promise<AuthOutcome> {
    const user = await this.usersRepo
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email: dto.email })
      .getOne();

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('بيانات الدخول غير صحيحة');
    }
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('هذا الحساب غير نشط حاليًا');
    }
    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('بيانات الدخول غير صحيحة');
    }

    // لو الحساب لسه ما فعّلش بريده (لم يكمل OTP وقت التسجيل) - نرسل كود جديد ونطلب التفعيل
    // بدل ما نرجع خطأ غامض، حتى العميل يقدر يكمل التفعيل من نفس نقطة الدخول
    if (!user.emailVerified) {
      await this.sendOtpInternal(user.email!, OtpChannel.EMAIL, OtpPurpose.REGISTER);
      return {
        requiresOtpVerification: true,
        message: 'حسابك غير مفعّل بعد. تم إرسال رمز تحقق جديد إلى بريدك الإلكتروني.',
      };
    }

    const tokens = await this.issueTokensForCustomer(user.id);
    return { requiresOtpVerification: false, ...tokens, termsAccepted: user.termsAcceptedAt !== null };
  }

  // ================= Phone / Email + OTP (موحّد) =================

  async requestOtp(dto: { phoneNumber?: string; email?: string; purpose?: string }) {
    const purpose = this.mapPurpose(dto.purpose);
    if (dto.phoneNumber) {
      return this.sendOtpInternal(dto.phoneNumber, OtpChannel.SMS, purpose);
    }
    if (dto.email) {
      return this.sendOtpInternal(dto.email, OtpChannel.EMAIL, purpose);
    }
    throw new BadRequestException('يجب إدخال رقم هاتف أو بريد إلكتروني');
  }

  private async sendOtpInternal(target: string, channel: OtpChannel, purpose: OtpPurpose) {
    const otpLength = parseInt(process.env.OTP_LENGTH || '6', 10);
    const expiresInSeconds = parseInt(process.env.OTP_EXPIRES_IN_SECONDS || '300', 10);

    const code = randomInt(0, 10 ** otpLength).toString().padStart(otpLength, '0');
    const codeHash = await bcrypt.hash(code, 10);

    const otp = this.otpRepo.create({ target, channel, codeHash, purpose, expiresAt: new Date(Date.now() + expiresInSeconds * 1000) });
    await this.otpRepo.save(otp);

    if (channel === OtpChannel.SMS) {
      await this.smsProvider.sendOtp(target, code);
    } else {
      await this.emailProvider.sendOtp(target, code);
    }

    return { message: 'تم إرسال رمز التحقق', expiresInSeconds };
  }

  // يتحقق من الكود، ثم:
  // - لو channel=phone: يُسجّل دخول/ينشئ حساب تلقائيًا (نفس السلوك القديم)
  // - لو channel=email: يفعّل حساب موجود بالفعل (اتسجل بباسورد) ويُصدر توكنات
  async verifyOtp(dto: { phoneNumber?: string; email?: string; code: string }): Promise<AuthOutcome> {
    const target = dto.phoneNumber ?? dto.email;
    const channel = dto.phoneNumber ? OtpChannel.SMS : OtpChannel.EMAIL;
    if (!target) throw new BadRequestException('يجب إدخال رقم هاتف أو بريد إلكتروني');

    const otp = await this.otpRepo.findOne({
      where: { target, channel, consumed: false },
      order: { createdAt: 'DESC' },
    });
    if (!otp) throw new BadRequestException('لا يوجد رمز تحقق صالح، برجاء طلب رمز جديد');
    if (otp.expiresAt < new Date()) throw new BadRequestException('انتهت صلاحية رمز التحقق، برجاء طلب رمز جديد');
    if (otp.attempts >= 5) throw new BadRequestException('تم تجاوز عدد المحاولات المسموح، برجاء طلب رمز جديد');

    const isValid = await bcrypt.compare(dto.code, otp.codeHash);
    if (!isValid) {
      otp.attempts += 1;
      await this.otpRepo.save(otp);
      throw new BadRequestException('رمز التحقق غير صحيح');
    }
    otp.consumed = true;
    await this.otpRepo.save(otp);

    if (channel === OtpChannel.SMS) {
      let user = await this.usersRepo.findOne({ where: { phoneNumber: target } });
      if (!user) {
        user = this.usersRepo.create({ phoneNumber: target, phoneVerified: true });
        await this.usersRepo.save(user);
      } else if (!user.phoneVerified) {
        user.phoneVerified = true;
        await this.usersRepo.save(user);
      }
      const tokens = await this.issueTokensForCustomer(user.id);
      return { requiresOtpVerification: false, ...tokens, termsAccepted: user.termsAcceptedAt !== null };
    }

    // channel === EMAIL: الحساب لازم يكون موجود بالفعل (اتسجل بباسورد سابقًا)
    const user = await this.usersRepo.findOne({ where: { email: target } });
    if (!user) throw new BadRequestException('لا يوجد حساب مرتبط بهذا البريد الإلكتروني');
    user.emailVerified = true;
    await this.usersRepo.save(user);
    const tokens = await this.issueTokensForCustomer(user.id);
    return { requiresOtpVerification: false, ...tokens, termsAccepted: user.termsAcceptedAt !== null };
  }

  private mapPurpose(p?: string): OtpPurpose {
    switch (p) {
      case 'register': return OtpPurpose.REGISTER;
      case 'reset_password': return OtpPurpose.RESET_PASSWORD;
      default: return OtpPurpose.LOGIN;
    }
  }

  // ================= Social Login: Google =================
  // ملاحظة: التحقق الفعلي من التوكن يتطلب اتصال شبكة حقيقي بخوادم Google (لجلب مفاتيحهم العامة)
  // ووجود GOOGLE_CLIENT_ID حقيقي في .env يطابق مشروع Google Cloud الفعلي - لا يعمل بدونهما.
  async loginWithGoogle(idToken: string): Promise<AuthOutcome> {
    if (!process.env.GOOGLE_CLIENT_ID) {
      throw new BadRequestException('تسجيل الدخول بـ Google غير مُفعَّل - GOOGLE_CLIENT_ID غير مضبوط في الخادم');
    }
    let payload;
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch {
      throw new UnauthorizedException('توكن Google غير صالح');
    }
    if (!payload?.sub || !payload.email) {
      throw new UnauthorizedException('توكن Google لا يحتوي على بيانات كافية');
    }

    let user = await this.usersRepo.findOne({ where: { googleId: payload.sub } });
    if (!user) {
      user = await this.usersRepo.findOne({ where: { email: payload.email } });
      if (user) {
        user.googleId = payload.sub;
      } else {
        user = this.usersRepo.create({
          email: payload.email,
          googleId: payload.sub,
          emailVerified: true, // Google بالفعل تحقق من ملكية البريد
          fullName: payload.name ?? null,
        });
      }
      await this.usersRepo.save(user);
    }

    const tokens = await this.issueTokensForCustomer(user.id);
    return { requiresOtpVerification: false, ...tokens, termsAccepted: user.termsAcceptedAt !== null };
  }

  // ================= Social Login: Apple =================
  // نفس الملاحظة: يتطلب اتصال شبكة حقيقي بـ appleid.apple.com/auth/keys ووجود APPLE_CLIENT_ID
  // (Service ID/Bundle ID الحقيقي) - لا يعمل داخل بيئة معزولة عن الإنترنت.
  async loginWithApple(idToken: string, fullName?: string): Promise<AuthOutcome> {
    if (!process.env.APPLE_CLIENT_ID) {
      throw new BadRequestException('تسجيل الدخول بـ Apple غير مُفعَّل - APPLE_CLIENT_ID غير مضبوط في الخادم');
    }
    let sub: string, email: string | undefined;
    try {
      const { payload } = await jwtVerify(idToken, this.appleJwks, {
        issuer: 'https://appleid.apple.com',
        audience: process.env.APPLE_CLIENT_ID,
      });
      sub = payload.sub as string;
      email = payload.email as string | undefined;
    } catch {
      throw new UnauthorizedException('توكن Apple غير صالح');
    }
    if (!sub) throw new UnauthorizedException('توكن Apple لا يحتوي على بيانات كافية');

    let user = await this.usersRepo.findOne({ where: { appleId: sub } });
    if (!user) {
      user = email ? await this.usersRepo.findOne({ where: { email } }) : null;
      if (user) {
        user.appleId = sub;
      } else {
        user = this.usersRepo.create({
          email: email ?? null,
          appleId: sub,
          emailVerified: !!email, // Apple تحقق من ملكية البريد لو أرسلته
          fullName: fullName ?? null,
        });
      }
      await this.usersRepo.save(user);
    }

    const tokens = await this.issueTokensForCustomer(user.id);
    return { requiresOtpVerification: false, ...tokens, termsAccepted: user.termsAcceptedAt !== null };
  }

  // ================= Terms & Conditions =================
  async acceptTerms(userId: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('المستخدم غير موجود');
    user.termsAcceptedAt = new Date();
    await this.usersRepo.save(user);
    return { termsAccepted: true, termsAcceptedAt: user.termsAcceptedAt };
  }

  // ================= Shared token issuance =================

  private async issueTokensForCustomer(userId: string) {
    const accessToken = this.jwtService.sign(
      { sub: userId, type: 'customer' },
      { secret: process.env.JWT_ACCESS_SECRET, expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || '15m') as any },
    );
    const refreshToken = this.jwtService.sign(
      { sub: userId, type: 'customer' },
      { secret: process.env.JWT_REFRESH_SECRET, expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '30d') as any },
    );
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.usersRepo.update(userId, { refreshTokenHash });
    return { accessToken, refreshToken, userId };
  }

  async refreshCustomerToken(refreshToken: string) {
    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken, { secret: process.env.JWT_REFRESH_SECRET });
    } catch {
      throw new UnauthorizedException('Refresh token غير صالح أو منتهي');
    }
    const user = await this.usersRepo
      .createQueryBuilder('user')
      .addSelect('user.refreshTokenHash')
      .where('user.id = :id', { id: payload.sub })
      .getOne();
    if (!user || !user.refreshTokenHash) throw new UnauthorizedException('Refresh token غير صالح');
    const matches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!matches) throw new UnauthorizedException('Refresh token غير صالح');
    return this.issueTokensForCustomer(user.id);
  }

  async logout(userId: string) {
    await this.usersRepo.update(userId, { refreshTokenHash: null });
    return { message: 'تم تسجيل الخروج بنجاح' };
  }
}
