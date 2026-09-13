import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';

@Injectable()
export class AddressesService {
  constructor(@InjectRepository(Address) private readonly repo: Repository<Address>) {}

  findAllForUser(userId: string) {
    return this.repo.find({ where: { userId }, order: { isDefault: 'DESC', createdAt: 'DESC' } });
  }

  async findOneForUser(userId: string, id: string) {
    const address = await this.repo.findOne({ where: { id, userId } });
    if (!address) throw new NotFoundException('العنوان غير موجود');
    return address;
  }

  async create(userId: string, dto: CreateAddressDto) {
    if (dto.isDefault) {
      await this.repo.update({ userId }, { isDefault: false });
    }
    const address = this.repo.create({ ...dto, userId });
    return this.repo.save(address);
  }

  async update(userId: string, id: string, dto: UpdateAddressDto) {
    const address = await this.findOneForUser(userId, id);
    if (dto.isDefault) {
      await this.repo.update({ userId }, { isDefault: false });
    }
    Object.assign(address, dto);
    return this.repo.save(address);
  }

  async remove(userId: string, id: string) {
    const address = await this.findOneForUser(userId, id);
    await this.repo.remove(address);
    return { message: 'تم حذف العنوان' };
  }
}
