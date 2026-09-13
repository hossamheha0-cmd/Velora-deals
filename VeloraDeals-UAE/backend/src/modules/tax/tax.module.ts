import { Module } from '@nestjs/common';
import { TaxService } from './tax.service';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [SettingsModule],
  providers: [TaxService],
  exports: [TaxService],
})
export class TaxModule {}
