import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { TasksService } from '../tasks/tasks.service';
import { NotificationsService } from '../notifications/notifications.service';
import { DealsService } from '../deals/deals.service';
import { CRM_EVENTS, LeadCreatedEvent, DealStatusChangedEvent, SiteVisitStatusEvent, LeadStatusChangedEvent } from '../common/events/events';

@Injectable()
export class AutomationListener {
  private readonly logger = new Logger(AutomationListener.name);

  constructor(
    private prisma: PrismaService,
    private tasksService: TasksService,
    private notificationsService: NotificationsService,
    private dealsService: DealsService,
  ) {}

  @OnEvent(CRM_EVENTS.LEAD_CREATED)
  async handleLeadCreated(event: LeadCreatedEvent) {
    try {
      this.logger.log(`Handling ${CRM_EVENTS.LEAD_CREATED} for lead ${event.leadId}`);
      
      // Fallback creator/assignee if ownerId is empty (e.g. Meta Ads lead)
      let ownerId: string | undefined = event.ownerId || undefined;
      if (!ownerId) {
        const broker = await this.prisma.user.findFirst({ where: { role: 'BROKER' } });
        ownerId = broker?.id || undefined;
      }

      // Auto-create Welcome Call task
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      await this.tasksService.create({
        title: `Welcome Call: ${event.leadName}`,
        description: 'Initial contact to verify requirements and introduce services.',
        status: 'PENDING',
        priority: 'HIGH',
        dueDate: tomorrow.toISOString(),
        assignee: ownerId ? { connect: { id: ownerId } } : undefined,
        relatedType: event.leadId ? 'LEAD' : undefined,
        relatedId: event.leadId || undefined,
        creator: ownerId ? { connect: { id: ownerId } } : undefined,
      });

      // Send Notification
      if (ownerId) {
        await this.notificationsService.create({
          title: 'New Lead Auto-Task',
          message: `A Welcome Call task has been scheduled for ${event.leadName}.`,
          type: 'INFO',
          userId: ownerId,
          link: '/tasks'
        });
      }
      this.logger.log(`Successfully handled ${CRM_EVENTS.LEAD_CREATED}`);
    } catch (error) {
      this.logger.error(`Error in handleLeadCreated: ${error.message}`, error.stack);
    }
  }

  @OnEvent(CRM_EVENTS.LEAD_CREATED)
  async handleNewLeadMarketingEnrollment(event: LeadCreatedEvent) {
    try {
      this.logger.log(`Checking automated marketing campaign enrollment for lead: ${event.leadId}`);

      const lead = await this.prisma.lead.findUnique({
        where: { id: event.leadId },
        include: { campaignLeads: true },
      });

      if (!lead) return;

      // Skip if lead is already linked to a campaign (e.g. via the public form URL with campaignId)
      if (lead.campaignLeads && lead.campaignLeads.length > 0) {
        this.logger.log(`Lead ${lead.name} is already enrolled in a campaign, skipping auto-enroll.`);
        return;
      }

      // Fallback: find the latest active campaign and enroll the lead
      const targetCampaign = await this.prisma.campaign.findFirst({
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
      });

      if (targetCampaign) {
        await this.prisma.campaignLead.create({
          data: {
            campaignId: targetCampaign.id,
            leadId: lead.id,
            sentAt: new Date(),
          },
        });
        this.logger.log(`Auto-enrolled lead ${lead.name} into campaign ${targetCampaign.title}`);

        // Notify the campaign creator or first broker
        let notificationUserId = event.ownerId || targetCampaign.createdById;
        if (!notificationUserId) {
          const broker = await this.prisma.user.findFirst({ where: { role: 'BROKER' } });
          notificationUserId = broker?.id || '';
        }

        if (notificationUserId) {
          await this.notificationsService.create({
            title: 'New Lead Auto-Enrolled',
            message: `Lead "${lead.name}" was automatically enrolled in campaign "${targetCampaign.title}".`,
            type: 'SUCCESS',
            userId: notificationUserId,
            link: '/marketing',
          });
        }
      } else {
        this.logger.log(`No active marketing campaigns found to enroll lead ${lead.name}`);
      }
    } catch (error) {
      this.logger.error(`Failed to auto-enroll lead: ${error.message}`, error.stack);
    }
  }

  @OnEvent(CRM_EVENTS.SITE_VISIT_COMPLETED)
  async handleVisitCompleted(event: SiteVisitStatusEvent) {
    try {
      this.logger.log(`Handling ${CRM_EVENTS.SITE_VISIT_COMPLETED} for visit ${event.visitId}`);
      
      // Auto-create Feedback task
      const today = new Date();
      today.setHours(today.getHours() + 2); // Due in 2 hours

      await this.tasksService.create({
        title: `Collect Feedback`,
        description: 'Follow up after the site visit to gauge interest.',
        status: 'PENDING',
        priority: 'MEDIUM',
        dueDate: today.toISOString(),
        assignee: event.agentId ? { connect: { id: event.agentId } } : undefined,
        relatedType: event.leadId ? 'LEAD' : (event.propertyId ? 'PROPERTY' : undefined),
        relatedId: event.leadId || event.propertyId || undefined,
        creator: event.agentId ? { connect: { id: event.agentId } } : undefined,
      });
      this.logger.log(`Successfully handled ${CRM_EVENTS.SITE_VISIT_COMPLETED}`);
    } catch (error) {
      this.logger.error(`Error in handleVisitCompleted: ${error.message}`, error.stack);
    }
  }

  @OnEvent(CRM_EVENTS.SITE_VISIT_NO_SHOW)
  async handleVisitNoShow(event: SiteVisitStatusEvent) {
    try {
      this.logger.log(`Handling ${CRM_EVENTS.SITE_VISIT_NO_SHOW} for visit ${event.visitId}`);
      
      // Auto-create Reschedule task
      const today = new Date();
      today.setHours(today.getHours() + 24);

      await this.tasksService.create({
        title: `Reschedule Visit`,
        description: 'Client was a no-show. Attempt to reschedule.',
        status: 'PENDING',
        priority: 'HIGH',
        dueDate: today.toISOString(),
        assignee: event.agentId ? { connect: { id: event.agentId } } : undefined,
        relatedType: event.leadId ? 'LEAD' : (event.propertyId ? 'PROPERTY' : undefined),
        relatedId: event.leadId || event.propertyId || undefined,
        creator: event.agentId ? { connect: { id: event.agentId } } : undefined,
      });
      this.logger.log(`Successfully handled ${CRM_EVENTS.SITE_VISIT_NO_SHOW}`);
    } catch (error) {
      this.logger.error(`Error in handleVisitNoShow: ${error.message}`, error.stack);
    }
  }

  @OnEvent(CRM_EVENTS.LEAD_STATUS_CHANGED)
  async handleLeadStatusChanged(event: LeadStatusChangedEvent) {
    try {
      this.logger.log(`Handling ${CRM_EVENTS.LEAD_STATUS_CHANGED} for lead ${event.leadId} (${event.oldStatus} -> ${event.newStatus})`);

      if (event.newStatus === 'INTERESTED') {
        // Auto-create a Deal
        await this.dealsService.create({
          title: `Deal: ${event.leadName}`,
          value: event.budget || 0, // Use lead budget if available
          stage: 'INQUIRY',
          leadId: event.leadId,
          ownerId: event.ownerId,
        }, { id: event.ownerId, role: 'SYSTEM' });

        await this.notificationsService.create({
          title: 'New Deal Generated!',
          message: `A potential deal for "${event.leadName}" has been automatically added to your pipeline.`,
          type: 'SUCCESS',
          userId: event.ownerId,
          link: '/pipeline'
        });
      }
      this.logger.log(`Successfully handled ${CRM_EVENTS.LEAD_STATUS_CHANGED}`);
    } catch (error) {
      this.logger.error(`Error in handleLeadStatusChanged: ${error.message}`, error.stack);
    }
  }

  @OnEvent(CRM_EVENTS.DEAL_STATUS_CHANGED)
  async handleDealStatusChanged(event: DealStatusChangedEvent) {
    try {
      this.logger.log(`Handling ${CRM_EVENTS.DEAL_STATUS_CHANGED} for deal ${event.dealId} (Stage: ${event.newStatus})`);

      if (event.newStatus === 'NEGOTIATION' && event.propertyId) {
        // Auto-update property to UNDER_OFFER
        await this.prisma.property.update({
          where: { id: event.propertyId },
          data: { status: 'UNDER_OFFER' }
        });
        
        await this.notificationsService.create({
          title: 'Property Status Updated',
          message: `Property has been automatically moved to Under Offer due to active negotiation.`,
          type: 'INFO',
          userId: event.ownerId,
          link: `/properties/${event.propertyId}`
        });
      }

      if (event.newStatus === 'CLOSED_WON') {
        // Auto-update lead and property
        if (event.leadId) {
          await this.prisma.lead.update({
            where: { id: event.leadId },
            data: { status: 'CONVERTED' }
          });
        }

        if (event.propertyId) {
          await this.prisma.property.update({
            where: { id: event.propertyId },
            data: { status: 'SOLD' }
          });
        }

        // Notify Broker
        const broker = await this.prisma.user.findFirst({ where: { role: 'BROKER' } });
        if (broker) {
          await this.notificationsService.create({
            title: 'Deal Closed Won! 🎉',
            message: `A deal has been successfully closed.`,
            type: 'SUCCESS',
            userId: broker.id,
            link: `/pipeline/${event.dealId}`
          });
        }
      }
      this.logger.log(`Successfully handled ${CRM_EVENTS.DEAL_STATUS_CHANGED}`);
    } catch (error) {
      this.logger.error(`Error in handleDealStatusChanged: ${error.message}`, error.stack);
    }
  }
}
