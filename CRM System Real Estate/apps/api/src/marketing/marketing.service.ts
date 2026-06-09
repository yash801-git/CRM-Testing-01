import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MarketingService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.campaign.findMany({
      include: {
        property: { select: { title: true, city: true } },
        createdBy: { select: { name: true } },
        leads: {
          include: {
            lead: { select: { name: true, phone: true, email: true, source: true } },
          },
        },
        _count: { select: { leads: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.campaign.findUnique({
      where: { id },
      include: {
        property: true,
        createdBy: { select: { name: true } },
        leads: {
          include: {
            lead: { select: { id: true, name: true, phone: true, email: true, status: true, source: true } },
          },
        },
      },
    });
  }

  async create(data: any, userId: string) {
    const { leadIds, ...rest } = data;

    const campaign = await this.prisma.campaign.create({
      data: {
        ...rest,
        budget: rest.budget ? parseFloat(rest.budget) : null,
        spent: rest.spent ? parseFloat(rest.spent) : 0,
        startDate: rest.startDate ? new Date(rest.startDate) : null,
        endDate: rest.endDate ? new Date(rest.endDate) : null,
        propertyId: rest.propertyId || null,
        createdById: userId,
      },
    });

    // If lead IDs were provided, link them to this campaign
    if (leadIds && leadIds.length > 0) {
      await this.prisma.campaignLead.createMany({
        data: leadIds.map((leadId: string) => ({
          campaignId: campaign.id,
          leadId,
        })),
        skipDuplicates: true,
      });
    }

    return this.findOne(campaign.id);
  }

  async update(id: string, data: any) {
    const { leadIds, ...rest } = data;

    const campaign = await this.prisma.campaign.update({
      where: { id },
      data: {
        ...rest,
        budget: rest.budget !== undefined ? parseFloat(rest.budget) : undefined,
        spent: rest.spent !== undefined ? parseFloat(rest.spent) : undefined,
        startDate: rest.startDate ? new Date(rest.startDate) : undefined,
        endDate: rest.endDate ? new Date(rest.endDate) : undefined,
        propertyId: rest.propertyId || null,
      },
    });

    // If leadIds are being updated, replace all existing links
    if (leadIds !== undefined) {
      await this.prisma.campaignLead.deleteMany({ where: { campaignId: id } });
      if (leadIds.length > 0) {
        await this.prisma.campaignLead.createMany({
          data: leadIds.map((leadId: string) => ({ campaignId: id, leadId })),
          skipDuplicates: true,
        });
      }
    }

    return this.findOne(campaign.id);
  }

  async remove(id: string) {
    return this.prisma.campaign.delete({ where: { id } });
  }

  async markLeadResponded(campaignId: string, leadId: string) {
    return this.prisma.campaignLead.update({
      where: { campaignId_leadId: { campaignId, leadId } },
      data: { responded: true, sentAt: new Date() },
    });
  }

  async getStats() {
    const [total, active, completed, totalLeadsReached] = await Promise.all([
      this.prisma.campaign.count(),
      this.prisma.campaign.count({ where: { status: 'ACTIVE' } }),
      this.prisma.campaign.count({ where: { status: 'COMPLETED' } }),
      this.prisma.campaignLead.count(),
    ]);
    return { total, active, completed, totalLeadsReached };
  }
}
