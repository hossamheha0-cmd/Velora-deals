import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../orders/entities/order.entity';
import { DiscountsService } from './discounts.service';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order]), SettingsModule],
  providers: [DiscountsService],
  exports: [DiscountsService],
})
export class DiscountsModule {}
