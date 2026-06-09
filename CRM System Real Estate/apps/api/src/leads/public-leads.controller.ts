import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { LeadsService } from './leads.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('public')
export class PublicLeadsController {
  constructor(
    private readonly leadsService: LeadsService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * POST /api/public/leads
   * Unauthenticated endpoint — accessible from the public lead capture form.
   * Protected by a honeypot field and server-side input validation.
   */
  @Post('leads')
  async createPublicLead(@Body() data: any) {
    // 1. Honeypot check — if filled, it's a bot; silently succeed
    if (data.honey && String(data.honey).trim() !== '') {
      return { success: true, leadId: 'mock-bot-blocked' };
    }

    // 2. Required field validation
    if (!data.name || String(data.name).trim() === '') {
      throw new BadRequestException('Full name is required.');
    }
    if (!data.phone || String(data.phone).trim() === '') {
      throw new BadRequestException('Phone number is required.');
    }

    // 3. Phone format validation (international E.164 compatible)
    const phoneClean = String(data.phone).replace(/[\s\-()]/g, '');
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneClean) || phoneClean.length < 8) {
      throw new BadRequestException('Please provide a valid phone number.');
    }

    // 4. Email format validation (if provided)
    if (data.email && String(data.email).trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(String(data.email).trim())) {
        throw new BadRequestException('Please provide a valid email address.');
      }
    }

    // 5. Create lead in the database
    const lead = await this.prisma.lead.create({
      data: {
        name: String(data.name).trim(),
        email: data.email ? String(data.email).trim() : null,
        phone: phoneClean,
        source: data.source || 'CRM Ad Form',
        status: 'NEW',
        budget: data.budget ? parseFloat(data.budget) : null,
        notes: data.notes ? String(data.notes).trim() : null,
        propertyType: data.propertyType || null,
        bhk: data.bhk || null,
        purpose: data.purpose || null,
        timeline: data.timeline || null,
        requiresLoan: data.requiresLoan === true || data.requiresLoan === 'true',
      },
    });

    // 6. Link lead to Campaign if campaignId was passed in the URL params
    if (data.campaignId) {
      const campaignExists = await this.prisma.campaign.findUnique({
        where: { id: data.campaignId },
      });
      if (campaignExists) {
        await this.prisma.campaignLead.create({
          data: {
            campaignId: data.campaignId,
            leadId: lead.id,
            sentAt: new Date(),
          },
        });
      }
    }

    // 7. Emit LEAD_CREATED event to trigger automation (tasks, notifications, etc.)
    this.leadsService.emitLeadCreatedEvent(lead);

    return { success: true, leadId: lead.id };
  }

  /**
   * GET /api/public/properties/:id
   * Fetch basic, safe public details for a property to display on the form header.
   */
  @Get('properties/:id')
  async getPublicProperty(@Param('id') id: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      select: { title: true, price: true, city: true, state: true, images: true, type: true },
    });
    
    if (!property) {
      throw new NotFoundException('Property not found');
    }
    
    return property;
  }

  /**
   * POST /api/public/campaigns/:id/click
   * Record a click/view for a campaign, grouped by source.
   */
  @Post('campaigns/:id/click')
  async trackCampaignClick(
    @Param('id') id: string,
    @Body('source') source: string,
  ) {
    if (!source) source = 'CRM Ad Form';

    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      select: { clicksBySource: true },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    const clicksObj = (campaign.clicksBySource as any) || {};
    clicksObj[source] = (clicksObj[source] || 0) + 1;

    await this.prisma.campaign.update({
      where: { id },
      data: { clicksBySource: clicksObj },
    });

    return { success: true };
  }
}
