import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentMethod } from './entities/payment-method.entity';
import { PaymentMethodsService } from './payment-methods.service';
import {
  PaymentMethodsPublicController,
  PaymentMethodsAdminController,
} from './payment-methods.controller';
import { CodProvider } from './providers/cod.provider';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentMethod])],
  controllers: [PaymentMethodsPublicController, PaymentMethodsAdminController],
  providers: [PaymentMethodsService, CodProvider],
  exports: [PaymentMethodsService],
})
export class PaymentMethodsModule {}
