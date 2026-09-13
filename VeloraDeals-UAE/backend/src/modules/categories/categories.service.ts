import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category) private readonly repo: Repository<Category>,
  ) {}

  // للعميل: فقط الفئات المفعّلة، مرتبة
  findAllEnabled() {
    return this.repo.find({
      where: { enabled: true },
      order: { sortOrder: 'ASC' },
      relations: { children: true },
    });
  }

  // للأدمن: كل الفئات بصرف النظر عن الحالة
  findAllForAdmin() {
    return this.repo.find({ order: { sortOrder: 'ASC' } });
  }

  async findOne(id: string) {
    const category = await this.repo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('الفئة غير موجودة');
    return category;
  }

  create(dto: CreateCategoryDto) {
    const category = this.repo.create(dto);
    return this.repo.save(category);
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.findOne(id);
    Object.assign(category, dto);
    return this.repo.save(category);
  }

  async remove(id: string) {
    const category = await this.findOne(id);
    await this.repo.remove(category);
    return { message: 'تم حذف الفئة' };
  }
}
