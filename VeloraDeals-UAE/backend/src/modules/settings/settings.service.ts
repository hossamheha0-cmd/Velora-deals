import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './entities/setting.entity';

// كل الإعدادات التشغيلية (Shipping Fee, VAT Rate, COD default status, Free Shipping...)
// تُقرأ من هنا ديناميكيًا - أي تعديل من Admin ينعكس فورًا بدون Deployment جديد.
@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private readonly settingsRepo: Repository<Setting>,
  ) {}

  async get(key: string): Promise<string | null> {
    const setting = await this.settingsRepo.findOne({ where: { key } });
    return setting ? setting.value : null;
  }

  async getNumber(key: string, fallback: number): Promise<number> {
    const value = await this.get(key);
    if (value === null) return fallback;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? fallback : parsed;
  }

  async getBoolean(key: string, fallback: boolean): Promise<boolean> {
    const value = await this.get(key);
    if (value === null) return fallback;
    return value === 'true';
  }

  async getString(key: string, fallback: string): Promise<string> {
    const value = await this.get(key);
    return value === null ? fallback : value;
  }

  async set(
    key: string,
    value: string,
    type: Setting['type'] = 'string',
    description?: string,
  ): Promise<Setting> {
    let setting = await this.settingsRepo.findOne({ where: { key } });
    if (!setting) {
      setting = this.settingsRepo.create({ key, value, type, description });
    } else {
      setting.value = value;
      if (description) setting.description = description;
    }
    return this.settingsRepo.save(setting);
  }

  async getAll(): Promise<Setting[]> {
    return this.settingsRepo.find({ order: { key: 'ASC' } });
  }
}
