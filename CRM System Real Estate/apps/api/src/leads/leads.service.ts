import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ActivityService } from '../activity/activity.service';
import { validateTransition } from '../common/status-transition.validator';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CRM_EVENTS, LeadCreatedEvent, LeadStatusChangedEvent } from '../common/events/events';

@Injectable()
export class LeadsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private activityService: ActivityService,
    private eventEmitter: EventEmitter2,
  ) {}

  async findAll(requestingUser: { id: string; role: string }, page?: number, limit?: number) {
    const where = requestingUser.role === 'AGENT' ? { ownerId: requestingUser.id } : {};
    
    if (page && limit) {
      const skip = (Number(page) - 1) * Number(limit);
      const [data, total] = await Promise.all([
        this.prisma.lead.findMany({
          where,
          include: { owner: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
          skip,
          take: Number(limit),
        }),
        this.prisma.lead.count({ where }),
      ]);
      
      return {
        data,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      };
    }

    return this.prisma.lead.findMany({
      where,
      include: { owner: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.lead.findUnique({
      where: { id },
      include: { owner: { select: { name: true } } },
    });
  }

  async create(data: any, requestingUser: { id: string; role: string }) {
    // Agents always own their own leads
    if (requestingUser.role === 'AGENT') {
      data = { ...data, owner: { connect: { id: requestingUser.id } } };
      delete data.ownerId;
    } else if (data.ownerId) {
      const { ownerId, ...rest } = data;
      data = { ...rest, owner: { connect: { id: ownerId } } };
    }

    const lead = await this.prisma.lead.create({
      data,
      include: { owner: { select: { name: true } } },
    });

    await this.activityService.log({
      userId: requestingUser.id,
      action: 'CREATED',
      entityType: 'Lead',
      entityId: lead.id,
      entityTitle: lead.name,
    });

    this.eventEmitter.emit(
      CRM_EVENTS.LEAD_CREATED,
      new LeadCreatedEvent(lead.id, lead.ownerId || requestingUser.id, lead.name)
    );

    return lead;
  }

  async update(id: string, data: any, requestingUser: { id: string; role: string }) {
    const existing = await this.prisma.lead.findUnique({ where: { id } });

    // Agents can only update their own leads
    if (requestingUser.role === 'AGENT' && existing?.ownerId !== requestingUser.id) {
      throw new ForbiddenException('You can only update your own leads.');
    }

    // Validate status transition if status is changing
    if (data.status && existing?.status && data.status !== existing.status) {
      validateTransition('Lead', String(existing.status), String(data.status));

      await this.activityService.log({
        userId: requestingUser.id,
        action: 'STATUS_CHANGED',
        entityType: 'Lead',
        entityId: id,
        entityTitle: existing.name,
        oldValue: existing.status,
        newValue: String(data.status),
      });

      this.eventEmitter.emit(
        CRM_EVENTS.LEAD_STATUS_CHANGED,
        new LeadStatusChangedEvent(
          id,
          existing.ownerId || requestingUser.id,
          String(existing.status),
          String(data.status),
          existing.name,
          existing.budget ? Number(existing.budget) : undefined
        )
      );
    }

    // Log assignment changes
    if (data.ownerId && data.ownerId !== existing?.ownerId) {
      await this.activityService.log({
        userId: requestingUser.id,
        action: 'ASSIGNED',
        entityType: 'Lead',
        entityId: id,
        entityTitle: existing?.name,
        oldValue: existing?.ownerId ?? undefined,
        newValue: String(data.ownerId),
      });
    }

    return this.prisma.lead.update({
      where: { id },
      data,
      include: { owner: { select: { name: true } } },
    });
  }

  async remove(id: string, requestingUser: { id: string; role: string }) {
    if (requestingUser.role === 'AGENT') {
      throw new ForbiddenException('Agents cannot delete leads.');
    }
    const existing = await this.prisma.lead.findUnique({ where: { id } });
    await this.activityService.log({
      userId: requestingUser.id,
      action: 'RECORD_DELETED',
      entityType: 'Lead',
      entityId: id,
      entityTitle: existing?.name,
    });
    return this.prisma.lead.delete({ where: { id } });
  }
}
