import { Module } from '@nestjs/common';
import { MarketingService } from './marketing.service';
import { MarketingController } from './marketing.controller';
import { PrismaModule } from '../prisma/prisma.module';

import { MetaSyncService } from './meta-sync.service';
import { GoogleSyncService } from './google-sync.service';

@Module({
  imports: [PrismaModule],
  controllers: [MarketingController],
  providers: [MarketingService, MetaSyncService, GoogleSyncService],
  exports: [MarketingService, MetaSyncService, GoogleSyncService],
})
export class MarketingModule {}
