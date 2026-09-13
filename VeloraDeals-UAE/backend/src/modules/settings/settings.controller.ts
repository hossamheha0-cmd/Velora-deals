import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminRole } from '../admin/entities/admin-user.entity';
import { UpdateSettingDto } from './dto/update-setting.dto';

// المفاتيح الآمنة فقط للعرض العام (تطبيق العميل) - بيانات تواصل واجتماعية وعملة، وليس أي شيء تشغيلي حساس
const PUBLIC_SETTING_KEYS = [
  'store_name',
  'default_currency',
  'contact_email',
  'contact_phone',
  'contact_whatsapp',
  'social_facebook',
  'social_instagram',
  'social_tiktok',
  'social_youtube',
  'official_website',
  'default_language',
];

@ApiTags('Public - Settings')
@Controller('settings')
export class SettingsPublicController {
  constructor(private readonly settingsService: SettingsService) {}

  // يستخدمه تطبيق الموبايل لجلب بيانات التواصل والعملة ديناميكيًا - بدون أي بيانات حساسة
  // ودون الحاجة لتوثيق، بحيث يقدر Super Admin يغيّرها من لوحة التحكم دون إصدار تحديث جديد للتطبيق
  @Get('public')
  async getPublicSettings() {
    const all = await this.settingsService.getAll();
    const result: Record<string, string> = {};
    for (const setting of all) {
      if (PUBLIC_SETTING_KEYS.includes(setting.key)) {
        result[setting.key] = setting.value;
      }
    }
    return result;
  }
}

@ApiTags('Admin - Settings')
@ApiBearerAuth()
@Controller('admin/settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // كل إعدادات المتجر (Shipping, VAT, COD status, Free Shipping, Contact...) في شاشة واحدة بالأدمن
  @Get()
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.MARKETING_MANAGER, AdminRole.ORDER_MANAGER)
  async getAll() {
    return this.settingsService.getAll();
  }

  @Put(':key')
  @Roles(AdminRole.SUPER_ADMIN)
  async update(@Param('key') key: string, @Body() dto: UpdateSettingDto) {
    return this.settingsService.set(key, dto.value, dto.type, dto.description);
  }
}

