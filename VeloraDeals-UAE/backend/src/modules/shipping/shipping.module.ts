import { Module } from '@nestjs/common';
import { ShippingService } from './shipping.service';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [SettingsModule],
  providers: [ShippingService],
  exports: [ShippingService],
})
export class ShippingModule {}
