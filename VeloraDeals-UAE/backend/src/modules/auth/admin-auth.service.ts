import { ConflictException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AdminUser, AdminRole } from '../admin/entities/admin-user.entity';
import { LoginWithEmailDto } from './dto/email-auth.dto';
import { SeedAdminDto } from './dto/seed-admin.dto';

const SALT_ROUNDS = 10; // مطابق للمواصفة الفنية المعتمدة (bcrypt saltRounds = 10)

// منفصل تمامًا عن AuthService الخاص بالعميل — توكنات الأدمن تحمل role وتُستخدم فقط في مسارات /admin/*
@Injectable()
export class AdminAuthService {
  constructor(
    @InjectRepository(AdminUser) private readonly adminRepo: Repository<AdminUser>,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginWithEmailDto) {
    const admin = await this.adminRepo
      .createQueryBuilder('admin')
      .addSelect('admin.passwordHash')
      .where('admin.email = :email', { email: dto.email })
      .getOne();

    if (!admin || !admin.isActive) {
      throw new UnauthorizedException('بيانات دخول غير صحيحة أو حساب غير نشط');
    }
    const isValid = await bcrypt.compare(dto.password, admin.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('بيانات دخول غير صحيحة');
    }

    const accessToken = this.jwtService.sign(
      { sub: admin.id, type: 'admin', role: admin.role },
      {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || '15m') as any,
      },
    );
    const refreshToken = this.jwtService.sign(
      { sub: admin.id, type: 'admin', role: admin.role },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '30d') as any,
      },
    );
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.adminRepo.update(admin.id, { refreshTokenHash });

    return {
      accessToken,
      refreshToken,
      admin: { id: admin.id, email: admin.email, fullName: admin.fullName, role: admin.role },
    };
  }

  // يُستخدم فقط عبر Seed/CLI داخلي لإنشاء أول Super Admin - وليس عبر API عام مفتوح (أمان)
  async createAdmin(email: string, password: string, fullName: string, role: AdminUser['role']) {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const admin = this.adminRepo.create({ email, passwordHash, fullName, role });
    return this.adminRepo.save(admin);
  }

  // Bootstrap endpoint موثّق بـ Swagger لإنشاء أول Super Admin عبر HTTP بدلًا من CLI فقط.
  // آمن بتصميمه: يعمل فقط طالما جدول admin_users فارغ تمامًا (أول تشغيل للمشروع) - بعدها
  // يُرفَض دائمًا بـ403، فلا يصبح أبدًا بابًا مفتوحًا لإنشاء أدمن جدد لاحقًا بدون توثيق.
  async seedFirstAdmin(dto: SeedAdminDto) {
    const existingCount = await this.adminRepo.count();
    if (existingCount > 0) {
      throw new ForbiddenException(
        'تم زرع حساب أدمن بالفعل - هذا الـEndpoint يعمل مرة واحدة فقط عند أول تشغيل للمشروع. أنشئ حسابات أدمن إضافية من داخل لوحة التحكم.',
      );
    }
    const existingEmail = await this.adminRepo.findOne({ where: { email: dto.email } });
    if (existingEmail) {
      throw new ConflictException('يوجد حساب بهذا البريد الإلكتروني بالفعل');
    }
    const admin = await this.createAdmin(dto.email, dto.password, dto.fullName, AdminRole.SUPER_ADMIN);
    return { id: admin.id, email: admin.email, fullName: admin.fullName, role: admin.role };
  }
}
