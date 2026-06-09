import { Module } from '@nestjs/common';
import { MarketingService } from './marketing.service';
import { MarketingController } from './marketing.controller';
import { PrismaModule } from '../prisma/prisma.module';

import { MetaSyncService } from './meta-sync.service';

@Module({
  imports: [PrismaModule],
  controllers: [MarketingController],
  providers: [MarketingService, MetaSyncService],
  exports: [MarketingService, MetaSyncService],
})
export class MarketingModule {}
