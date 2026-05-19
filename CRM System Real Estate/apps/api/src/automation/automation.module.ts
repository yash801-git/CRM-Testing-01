import { Module } from '@nestjs/common';
import { AutomationListener } from './automation.listener';
import { TasksModule } from '../tasks/tasks.module';
import { LeadsModule } from '../leads/leads.module';
import { PropertiesModule } from '../properties/properties.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PrismaModule } from '../prisma/prisma.module';
import { DealsModule } from '../deals/deals.module';

@Module({
  imports: [TasksModule, LeadsModule, PropertiesModule, NotificationsModule, PrismaModule, DealsModule],
  providers: [AutomationListener],
})
export class AutomationModule {}
