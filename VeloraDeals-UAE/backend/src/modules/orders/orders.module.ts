import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Address } from '../addresses/entities/address.entity';
import { OrdersService } from './orders.service';
import { OrdersController, OrdersAdminController } from './orders.controller';
import { CartModule } from '../cart/cart.module';
import { ProductsModule } from '../products/products.module';
import { TaxModule } from '../tax/tax.module';
import { ShippingModule } from '../shipping/shipping.module';
import { PaymentMethodsModule } from '../payment-methods/payment-methods.module';
import { SettingsModule } from '../settings/settings.module';
import { DiscountsModule } from '../discounts/discounts.module';
import { CouponsModule } from '../coupons/coupons.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Address]),
    CartModule,
    ProductsModule,
    TaxModule,
    ShippingModule,
    PaymentMethodsModule,
    SettingsModule,
    DiscountsModule,
    CouponsModule,
  ],
  controllers: [OrdersController, OrdersAdminController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
