import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { validateTransition } from '../common/status-transition.validator';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CRM_EVENTS, SiteVisitStatusEvent } from '../common/events/events';

@Injectable()
export class SiteVisitsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private eventEmitter: EventEmitter2,
  ) {}

  async findAll() {
    return this.prisma.siteVisit.findMany({
      include: {
        lead: { select: { name: true } },
        property: { select: { title: true, city: true } },
        agent: { select: { name: true } },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.siteVisit.findUnique({
      where: { id },
      include: {
        lead: { select: { name: true } },
        property: { select: { title: true, city: true } },
        agent: { select: { name: true } },
      },
    });
  }

  async create(data: any) {
    const { leadId, propertyId, agentId, ...rest } = data;

    // Connect to first user if agentId is missing
    let finalAgentId = agentId;
    if (!finalAgentId) {
      const firstUser = await this.prisma.user.findFirst();
      finalAgentId = firstUser?.id;
    }

    const visit = await this.prisma.siteVisit.create({
      data: {
        ...rest,
        lead: leadId ? { connect: { id: leadId } } : undefined,
        property: propertyId ? { connect: { id: propertyId } } : undefined,
        agent: finalAgentId ? { connect: { id: finalAgentId } } : undefined,
      },
      include: {
        lead: { select: { name: true } },
        property: { select: { title: true, city: true } },
        agent: { select: { name: true } },
      },
    });

    if (visit.agentId) {
      const propertyName = visit.property?.title || 'a property';
      await this.notificationsService.create({
        title: 'New Site Visit Scheduled',
        message: `You have a new site visit scheduled for ${propertyName}.`,
        type: 'INFO',
        userId: visit.agentId,
        link: '/site-visits'
      });
    }

    return visit;
  }

  async update(id: string, data: any) {
    if (data.status) {
      const currentVisit = await this.prisma.siteVisit.findUnique({ where: { id } });
      if (currentVisit) {
        validateTransition('SiteVisit', currentVisit.status, data.status);
      }
    }

    const updatedVisit = await this.prisma.siteVisit.update({
      where: { id },
      data,
    });

    if (data.status && data.status !== 'SCHEDULED') {
      const currentVisit = await this.prisma.siteVisit.findUnique({ where: { id } });
      if (currentVisit) {
        const agentId = currentVisit.agentId || '';
        const leadId = currentVisit.leadId || undefined;
        const propertyId = currentVisit.propertyId || undefined;
        if (data.status === 'COMPLETED') {
          this.eventEmitter.emit(CRM_EVENTS.SITE_VISIT_COMPLETED, new SiteVisitStatusEvent(id, agentId, leadId, propertyId));
        } else if (data.status === 'NO_SHOW') {
          this.eventEmitter.emit(CRM_EVENTS.SITE_VISIT_NO_SHOW, new SiteVisitStatusEvent(id, agentId, leadId, propertyId));
        }
      }
    }

    return updatedVisit;
  }

  async remove(id: string) {
    return this.prisma.siteVisit.delete({
      where: { id },
    });
  }
}
