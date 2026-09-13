import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly repo: Repository<Product>,
  ) {}

  findAllEnabled(categoryId?: string) {
    const where: any = { enabled: true };
    if (categoryId) where.categoryId = categoryId;
    return this.repo.find({ where, relations: { variants: true }, order: { createdAt: 'DESC' } });
  }

  findAllForAdmin() {
    return this.repo.find({ relations: { variants: true }, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    const product = await this.repo.findOne({ where: { id }, relations: { variants: true, category: true } });
    if (!product) throw new NotFoundException('المنتج غير موجود');
    return product;
  }

  create(dto: CreateProductDto) {
    const product = this.repo.create(dto);
    return this.repo.save(product);
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.findOne(id);
    Object.assign(product, dto);
    return this.repo.save(product);
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.repo.remove(product);
    return { message: 'تم حذف المنتج' };
  }

  // يُستخدم من OrdersService وقت إنشاء الطلب فقط - Backend هو المصدر الوحيد للتحقق من المخزون والسعر
  //
  // إصلاح مهم: يقبل الآن EntityManager اختياري - عند تمريره (من داخل Transaction في
  // OrdersService.createOrder)، الخصم من المخزون يصبح جزءًا فعليًا من نفس الـTransaction،
  // فيتراجع تلقائيًا (Rollback) لو أي خطوة تالية فشلت (مثل كوبون غير صالح) - بدل ما يبقى
  // الخصم مُنفَّذًا فعليًا رغم فشل الطلب بالكامل (باگ حقيقي كان موجودًا قبل هذا التعديل،
  // اكتُشف عبر اختبار حي: خصم مخزون فعلي حتى عند رفض الطلب بسبب كوبون غير صالح).
  async reserveStockOrThrow(productId: string, quantity: number, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(Product) : this.repo;
    const product = await repo.findOne({ where: { id: productId } });
    if (!product || !product.enabled) {
      throw new BadRequestException('المنتج غير متاح حاليًا');
    }
    if (product.stockQuantity < quantity) {
      throw new BadRequestException(`الكمية المطلوبة من "${product.nameAr}" غير متوفرة في المخزون`);
    }
    product.stockQuantity -= quantity;
    await repo.save(product);
    return product;
  }
}
