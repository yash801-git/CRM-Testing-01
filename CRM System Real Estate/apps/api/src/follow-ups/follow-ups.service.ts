import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, FollowUpStatus } from '@prisma/client';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class FollowUpsService {
  private readonly logger = new Logger(FollowUpsService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(query: { leadId?: string; dealId?: string; agentId?: string; status?: FollowUpStatus }) {
    return this.prisma.followUp.findMany({
      where: {
        leadId: query.leadId,
        dealId: query.dealId,
        agentId: query.agentId,
        status: query.status,
      },
      include: {
        lead: { select: { name: true, email: true } },
        deal: { select: { title: true } },
        agent: { select: { name: true } },
      },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.followUp.findUnique({
      where: { id },
      include: {
        lead: true,
        deal: true,
        agent: { select: { name: true } },
      },
    });
  }

  async create(data: Prisma.FollowUpUncheckedCreateInput) {
    return this.prisma.followUp.create({
      data,
    });
  }

  async update(id: string, data: Prisma.FollowUpUpdateInput) {
    return this.prisma.followUp.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.followUp.delete({
      where: { id },
    });
  }

  // Automation: Mark missed follow-ups every hour
  @Cron(CronExpression.EVERY_HOUR)
  async handleMissedFollowUps() {
    this.logger.log('Checking for missed follow-ups...');
    const now = new Date();
    
    const result = await this.prisma.followUp.updateMany({
      where: {
        status: FollowUpStatus.PENDING,
        scheduledAt: { lt: now },
      },
      data: {
        status: FollowUpStatus.MISSED,
      },
    });

    if (result.count > 0) {
      this.logger.log(`Marked ${result.count} follow-ups as MISSED.`);
    }
  }
}
