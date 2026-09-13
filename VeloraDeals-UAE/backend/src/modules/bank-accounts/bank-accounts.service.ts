import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankAccount } from './entities/bank-account.entity';
import { CreateBankAccountDto } from './dto/bank-account.dto';

@Injectable()
export class BankAccountsService {
  constructor(@InjectRepository(BankAccount) private readonly repo: Repository<BankAccount>) {}

  findAll() {
    return this.repo.find({ order: { isActive: 'DESC', createdAt: 'DESC' } });
  }

  getActive() {
    return this.repo.findOne({ where: { isActive: true } });
  }

  async create(dto: CreateBankAccountDto) {
    // أول حساب بنكي يُضاف تلقائيًا يصبح النشط (Active) - أي حساب لاحق يُضاف معطّلًا حتى
    // يُفعّله الأدمن صراحة عبر "تبديل الحساب النشط" أدناه
    const existingCount = await this.repo.count();
    const account = this.repo.create({ ...dto, isActive: existingCount === 0 });
    return this.repo.save(account);
  }

  // "التبديل" الفعلي المطلوب: تفعيل حساب معيّن يُعطِّل كل الحسابات الأخرى تلقائيًا (نشط واحد فقط دائمًا)
  async activate(id: string) {
    const account = await this.repo.findOne({ where: { id } });
    if (!account) throw new NotFoundException('الحساب البنكي غير موجود');

    // ملاحظة: repo.update({}, ...) بمعايير فارغة يرفضه TypeORM عمدًا (حماية من تحديث الجدول
    // بالكامل بالغلط) - لازم QueryBuilder صريح لتحديث غير مشروط لكل الصفوف بأمان.
    await this.repo.createQueryBuilder().update(BankAccount).set({ isActive: false }).execute();
    account.isActive = true;
    await this.repo.save(account);
    return account;
  }

  async remove(id: string) {
    const account = await this.repo.findOne({ where: { id } });
    if (!account) throw new NotFoundException('الحساب البنكي غير موجود');
    await this.repo.remove(account);
    return { message: 'تم حذف الحساب البنكي' };
  }
}
