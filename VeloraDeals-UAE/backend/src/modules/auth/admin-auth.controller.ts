import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminAuthService } from './admin-auth.service';
import { LoginWithEmailDto } from './dto/email-auth.dto';
import { SeedAdminDto } from './dto/seed-admin.dto';

@ApiTags('Admin - Auth')
@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post('login')
  login(@Body() dto: LoginWithEmailDto) {
    return this.adminAuthService.login(dto);
  }

  @Post('seed-admin')
  @ApiOperation({
    summary: 'إنشاء أول حساب Super Admin (Bootstrap) - يعمل مرة واحدة فقط',
    description:
      'يعمل فقط لو جدول admin_users فارغ تمامًا (أول تشغيل للمشروع). بعد أول نجاح، يُرفَض ' +
      'أي استدعاء لاحق بـ403 - وليس هذا Endpoint دائم لإنشاء حسابات أدمن، فقط للبداية.',
  })
  seedAdmin(@Body() dto: SeedAdminDto) {
    return this.adminAuthService.seedFirstAdmin(dto);
  }
}
