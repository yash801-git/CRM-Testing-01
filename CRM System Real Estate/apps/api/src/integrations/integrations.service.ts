import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IntegrationProvider } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CRM_EVENTS, LeadCreatedEvent } from '../common/events/events';

@Injectable()
export class IntegrationsService {
  private readonly logger = new Logger(IntegrationsService.name);

  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async getIntegrations(userId: string) {
    return this.prisma.integration.findMany({
      where: { userId },
    });
  }

  async saveIntegration(userId: string, provider: IntegrationProvider, data: any) {
    const existing = await this.prisma.integration.findUnique({
      where: {
        provider_userId: { provider, userId },
      },
    });

    if (existing) {
      return this.prisma.integration.update({
        where: { id: existing.id },
        data: {
          config: data.config,
          isActive: data.isActive ?? true,
          webhookSecret: data.webhookSecret,
        },
      });
    }

    return this.prisma.integration.create({
      data: {
        userId,
        provider,
        config: data.config,
        isActive: data.isActive ?? true,
        webhookSecret: data.webhookSecret,
      },
    });
  }

  verifyMetaWebhook(mode: string, token: string, challenge: string) {
    if (mode === 'subscribe' && token) {
      this.logger.log('Meta Webhook Verified Successfully');
      return challenge;
    }
    throw new BadRequestException('Invalid verification request');
  }

  async handleMetaWebhookPayload(body: any) {
    this.logger.log(`Received Meta Webhook: ${JSON.stringify(body)}`);

    if (body.object === 'page') {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.field === 'leadgen') {
            await this.processMetaLead(change.value);
          }
        }
      }
    }
    return { success: true };
  }

  private async processMetaLead(leadgenValue: any) {
    try {
      const leadId = leadgenValue.leadgen_id;
      const formId = leadgenValue.form_id;
      this.logger.log(`Processing Meta Lead ID: ${leadId}, Form ID: ${formId}`);

      // Use Prisma directly to avoid userId foreign-key issues
      const lead = await this.prisma.lead.create({
        data: {
          name: `Meta Lead ${String(leadId).substring(0, 8)}`,
          phone: '0000000000',
          email: `lead_${leadId}@meta.com`,
          source: 'Meta Ads',
          status: 'NEW',
        },
      });

      this.logger.log(`Successfully created CRM lead from Meta`);

      // Emit event for auto-enrollment and auto-tasks
      this.eventEmitter.emit(
        CRM_EVENTS.LEAD_CREATED,
        new LeadCreatedEvent(lead.id, lead.ownerId || '', lead.name, formId)
      );
    } catch (error) {
      this.logger.error('Failed to process Meta lead', error);
    }
  }
}
