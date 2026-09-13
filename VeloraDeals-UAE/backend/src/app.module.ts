import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { buildDatabaseConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AddressesModule } from './modules/addresses/addresses.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { CartModule } from './modules/cart/cart.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentMethodsModule } from './modules/payment-methods/payment-methods.module';
import { ShippingModule } from './modules/shipping/shipping.module';
import { TaxModule } from './modules/tax/tax.module';
import { SettingsModule } from './modules/settings/settings.module';
import { DiscountsModule } from './modules/discounts/discounts.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { BankAccountsModule } from './modules/bank-accounts/bank-accounts.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      ...buildDatabaseConfig(),
      autoLoadEntities: true,
      synchronize: false, // لا نستخدم Auto-sync أبدًا - كل تغيير Schema عبر Migration موثّق
      logging: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    } as any),

    AuthModule,
    UsersModule,
    AddressesModule,
    CategoriesModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    PaymentMethodsModule,
    ShippingModule,
    TaxModule,
    SettingsModule,
    DiscountsModule,
    CouponsModule,
    BankAccountsModule,
    NotificationsModule,
  ],
})
export class AppModule {}
