import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AdminUser } from './entities/admin-user.entity';
import { LoginWithEmailDto } from './dto/login-with-email.dto';
import { SeedAdminDto } from './dto/seed-admin.dto';

const SALT_ROUNDS = 10;

@Injectable()
export class AdminAuthService {
  constructor(
    @InjectRepository(AdminUser)
    private readonly adminRepository: Repository<AdminUser>,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginWithEmailDto) {
    const admin = await this.adminRepository
      .createQueryBuilder('admin')
      .addSelect('admin.password')
      .where('admin.email = :email', { email: dto.email })
      .getOne();

    if (!admin || !admin.password) {
      throw new ConflictException('بيانات الدخول غير صحيحة');
    }

    const isValid = await bcrypt.compare(dto.password, admin.password);
    if (!isValid) {
      throw new ConflictException('بيانات الدخول غير صحيحة');
    }

    const accessToken = this.jwtService.sign(
      { sub: admin.id, email: admin.email, role: admin.role },
      { secret: process.env.JWT_SECRET || 'super-secret', expiresIn: '1d' },
    );

    const refreshToken = this.jwtService.sign(
      { sub: admin.id },
      { secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret', expiresIn: '7d' },
    );

    return {
      accessToken,
      refreshToken,
      admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
    };
  }

  async seedFirstAdmin() {
    const defaultEmail = 'veloradeals.uae@gmail.com';
    const defaultPassword = 'Heha@0100';

    const existingEmail = await this.adminRepository.findOne({ where: { email: defaultEmail } });
    if (existingEmail) {
      throw new ConflictException('هذا البريد مسجل بالفعل');
    }

    const hashedPassword = await bcrypt.hash(defaultPassword, SALT_ROUNDS);
    const admin = await this.adminRepository.save({
      email: defaultEmail,
      password: hashedPassword,
      name: 'Velora Super Admin',
      role: 'superadmin',
    });

    return { id: admin.id, email: admin.email };
  }
}
