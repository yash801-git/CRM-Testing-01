import { Module } from '@nestjs/common';
import { SiteVisitsService } from './site-visits.service';
import { SiteVisitsController } from './site-visits.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  providers: [SiteVisitsService],
  controllers: [SiteVisitsController]
})
export class SiteVisitsModule {}
