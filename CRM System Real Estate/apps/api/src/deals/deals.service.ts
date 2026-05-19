import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ActivityService } from '../activity/activity.service';
import { validateTransition } from '../common/status-transition.validator';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CRM_EVENTS, DealStatusChangedEvent } from '../common/events/events';

@Injectable()
export class DealsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private activityService: ActivityService,
    private eventEmitter: EventEmitter2,
  ) {}

  private readonly include = {
    lead: { select: { name: true } },
    property: { select: { title: true } },
    owner: { select: { name: true } },
  };

  async findAll(requestingUser: { id: string; role: string }) {
    const where = requestingUser.role === 'AGENT' ? { ownerId: requestingUser.id } : {};
    return this.prisma.deal.findMany({
      where,
      include: this.include,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.deal.findUnique({ where: { id }, include: this.include });
  }

  async create(data: any, requestingUser: { id: string; role: string }) {
    const { leadId, propertyId, ownerId, ...rest } = data;

    const finalOwnerId =
      requestingUser.role === 'AGENT'
        ? requestingUser.id
        : ownerId || (await this.prisma.user.findFirst())?.id;

    const deal = await this.prisma.deal.create({
      data: {
        ...rest,
        lead: leadId ? { connect: { id: leadId } } : undefined,
        property: propertyId ? { connect: { id: propertyId } } : undefined,
        owner: finalOwnerId ? { connect: { id: finalOwnerId } } : undefined,
      },
      include: this.include,
    });

    await this.activityService.log({
      userId: requestingUser.id,
      action: 'CREATED',
      entityType: 'Deal',
      entityId: deal.id,
      entityTitle: deal.title,
    });

    if (deal.ownerId) {
      await this.notificationsService.create({
        title: 'New Deal Created',
        message: `A new deal "${deal.title}" has been added to your pipeline.`,
        type: 'SUCCESS',
        userId: deal.ownerId,
        link: '/deals',
      });
    }

    return deal;
  }

  async update(id: string, data: any, requestingUser: { id: string; role: string }) {
    const existing = await this.prisma.deal.findUnique({ where: { id } });

    if (requestingUser.role === 'AGENT' && existing?.ownerId !== requestingUser.id) {
      throw new ForbiddenException('You can only update your own deals.');
    }

    // Validate stage transition
    const newStage = data.stage;
    if (newStage && existing?.stage && newStage !== existing.stage) {
      validateTransition('Deal', String(existing.stage), String(newStage));
      await this.activityService.log({
        userId: requestingUser.id,
        action: 'STATUS_CHANGED',
        entityType: 'Deal',
        entityId: id,
        entityTitle: existing.title,
        oldValue: existing.stage,
        newValue: String(newStage),
      });

      this.eventEmitter.emit(
        CRM_EVENTS.DEAL_STATUS_CHANGED,
        new DealStatusChangedEvent(
          id, 
          existing.ownerId || requestingUser.id, 
          String(existing.stage), 
          String(newStage), 
          existing.leadId || undefined, 
          existing.propertyId || undefined
        )
      );
    }

    return this.prisma.deal.update({ where: { id }, data, include: this.include });
  }

  async remove(id: string, requestingUser: { id: string; role: string }) {
    if (requestingUser.role === 'AGENT') {
      throw new ForbiddenException('Agents cannot delete deals.');
    }
    const existing = await this.prisma.deal.findUnique({ where: { id } });
    await this.activityService.log({
      userId: requestingUser.id,
      action: 'RECORD_DELETED',
      entityType: 'Deal',
      entityId: id,
      entityTitle: existing?.title,
    });
    return this.prisma.deal.delete({ where: { id } });
  }
}
