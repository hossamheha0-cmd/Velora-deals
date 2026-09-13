import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Coupon, CouponType } from './entities/coupon.entity';
import { CreateCouponDto, UpdateCouponDto } from './dto/coupon.dto';

export interface CouponValidationResult {
  coupon: Coupon;
  discountAmount: number;
}

@Injectable()
export class CouponsService {
  constructor(@InjectRepository(Coupon) private readonly repo: Repository<Coupon>) {}

  // ================= Admin =================
  async create(dto: CreateCouponDto) {
    const code = dto.code.trim().toUpperCase();
    const existing = await this.repo.findOne({ where: { code } });
    if (existing) throw new BadRequestException('يوجد كوبون بنفس الكود بالفعل');

    const coupon = this.repo.create({
      code,
      type: dto.type,
      value: dto.value,
      usageLimit: dto.usageLimit ?? 1,
      minOrderAmount: dto.minOrderAmount ?? null,
      maxDiscountAmount: dto.maxDiscountAmount ?? null,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
    });
    return this.repo.save(coupon);
  }

  findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    const coupon = await this.repo.findOne({ where: { id } });
    if (!coupon) throw new NotFoundException('الكوبون غير موجود');
    return coupon;
  }

  async update(id: string, dto: UpdateCouponDto) {
    const coupon = await this.findOne(id);
    if (dto.value !== undefined) coupon.value = dto.value;
    if (dto.usageLimit !== undefined) coupon.usageLimit = dto.usageLimit;
    if (dto.minOrderAmount !== undefined) coupon.minOrderAmount = dto.minOrderAmount;
    if (dto.maxDiscountAmount !== undefined) coupon.maxDiscountAmount = dto.maxDiscountAmount;
    if (dto.enabled !== undefined) coupon.enabled = dto.enabled;
    if (dto.expiresAt !== undefined) coupon.expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;
    return this.repo.save(coupon);
  }

  async remove(id: string) {
    const coupon = await this.findOne(id);
    await this.repo.remove(coupon);
    return { message: 'تم حذف الكوبون' };
  }

  // ================= التحقق والحساب - يُستخدم من Checkout (Customer) ومن الأدمن للمعاينة =================
  async validateForSubtotal(rawCode: string, subtotal: number): Promise<CouponValidationResult> {
    const code = rawCode.trim().toUpperCase();
    const coupon = await this.repo.findOne({ where: { code } });

    if (!coupon) throw new BadRequestException('كود الكوبون غير صحيح');
    if (!coupon.enabled) throw new BadRequestException('هذا الكوبون غير مفعّل حاليًا');
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      throw new BadRequestException('انتهت صلاحية هذا الكوبون');
    }
    if (coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException('تم استخدام هذا الكوبون بالكامل ولا يمكن استخدامه مرة أخرى');
    }
    if (coupon.minOrderAmount && subtotal < Number(coupon.minOrderAmount)) {
      throw new BadRequestException(
        `هذا الكوبون يتطلب حدًا أدنى للطلب قيمته ${coupon.minOrderAmount} AED`,
      );
    }

    let discountAmount: number;
    if (coupon.type === CouponType.PERCENTAGE) {
      discountAmount = (subtotal * Number(coupon.value)) / 100;
      if (coupon.maxDiscountAmount && discountAmount > Number(coupon.maxDiscountAmount)) {
        discountAmount = Number(coupon.maxDiscountAmount);
      }
    } else {
      discountAmount = Number(coupon.value);
    }
    // الخصم لا يتجاوز أبدًا قيمة الطلب نفسه
    discountAmount = Math.min(discountAmount, subtotal);

    return { coupon, discountAmount: Math.round(discountAmount * 100) / 100 };
  }

  // يُستدعى فقط من داخل نفس الـTransaction اللي بتنشئ الطلب في OrdersService - يزيد العداد
  // بشكل ذري (Atomic) عبر EntityManager الممرَّر من الـTransaction، لمنع أي Race Condition
  // لو طلبين استخدموا نفس الكوبون في نفس اللحظة بالظبط.
  async consumeWithinTransaction(manager: EntityManager, couponId: string) {
    const result = await manager
      .createQueryBuilder()
      .update(Coupon)
      .set({ usedCount: () => '"usedCount" + 1' })
      .where('id = :id AND "usedCount" < "usageLimit"', { id: couponId })
      .execute();

    if (result.affected === 0) {
      // حصل Race Condition فعلي: كوبون استُهلك بالكامل بين لحظة التحقق ولحظة إنشاء الطلب
      throw new BadRequestException('تم استخدام هذا الكوبون بالكامل للتو، برجاء المحاولة بدونه');
    }
  }
}
