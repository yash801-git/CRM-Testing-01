import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PropertiesModule } from './properties/properties.module';
import { LeadsModule } from './leads/leads.module';
import { DealsModule } from './deals/deals.module';
import { SiteVisitsModule } from './site-visits/site-visits.module';
import { TasksModule } from './tasks/tasks.module';
import { UploadModule } from './upload/upload.module';
import { NotificationsModule } from './notifications/notifications.module';
import { FollowUpsModule } from './follow-ups/follow-ups.module';
import { MarketingModule } from './marketing/marketing.module';
import { ActivityModule } from './activity/activity.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { AutomationModule } from './automation/automation.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    PropertiesModule,
    LeadsModule,
    DealsModule,
    SiteVisitsModule,
    TasksModule,
    UploadModule,
    NotificationsModule,
    FollowUpsModule,
    MarketingModule,
    IntegrationsModule,
    ActivityModule,
    AutomationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
