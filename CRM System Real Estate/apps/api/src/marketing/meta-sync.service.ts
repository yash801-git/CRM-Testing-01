import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MetaSyncService {
  private readonly logger = new Logger(MetaSyncService.name);
  private readonly META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
  private readonly META_AD_ACCOUNT_ID = process.env.META_AD_ACCOUNT_ID;

  constructor(private readonly prisma: PrismaService) {}

  @Cron('*/5 * * * *') // Run every 5 minutes for testing
  async handleCron() {
    this.logger.debug('Running Automated Meta Ad Spend Sync...');

    if (!this.META_ACCESS_TOKEN || !this.META_AD_ACCOUNT_ID) {
      this.logger.warn('Meta credentials missing in .env. Skipping sync.');
      return;
    }

    try {
      // 1. Fetch all active campaigns from CRM that might have a link we can match
      const crmCampaigns = await this.prisma.campaign.findMany({
        select: { id: true, spent: true }
      });

      // 2. Fetch Active Ads from Meta Graph API
      // We need the Ad creative link_url and the spend insights
      const url = `https://graph.facebook.com/v19.0/${this.META_AD_ACCOUNT_ID}/ads?fields=creative{object_story_spec},insights{spend}&access_token=${this.META_ACCESS_TOKEN}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.error) {
        this.logger.error(`Meta API Error: ${data.error.message}`);
        return;
      }

      const ads = data.data || [];
      let matchedCount = 0;

      // 3. Automated Link Matching Logic
      for (const ad of ads) {
        // Extract destination URL from Ad Creative
        const linkUrl = ad.creative?.object_story_spec?.link_data?.link || '';
        
        // Extract Spend from Insights
        const spend = ad.insights?.data?.[0]?.spend || 0;

        if (linkUrl && spend > 0) {
          // Check if link contains our CRM campaignId
          const match = linkUrl.match(/campaignId=([^&]+)/);
          if (match && match[1]) {
            const crmCampaignId = match[1];

            // Verify campaign exists in CRM
            const crmCampaign = crmCampaigns.find(c => c.id === crmCampaignId);
            
            if (crmCampaign) {
              // Automatically sync the spend!
              await this.prisma.campaign.update({
                where: { id: crmCampaignId },
                data: { spent: parseFloat(spend) }
              });
              matchedCount++;
              this.logger.log(`Synced ₹${spend} for Campaign ${crmCampaignId}`);
            }
          }
        }
      }

      this.logger.debug(`Meta Sync Complete. Matched and updated ${matchedCount} campaigns.`);

    } catch (error) {
      this.logger.error('Failed to sync Meta spend', error);
    }
  }

  // Temporary endpoint method to simulate a fake ad being detected for Sandbox testing
  async triggerTestSimulation() {
    this.logger.log("Triggering Sandbox Simulation...");
    
    // Find the first CRM campaign to attach fake spend to
    const campaign = await this.prisma.campaign.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    if (campaign) {
      const fakeSpend = 5400 + Math.floor(Math.random() * 1000); // Random spend between 5400 and 6400
      
      await this.prisma.campaign.update({
        where: { id: campaign.id },
        data: { spent: fakeSpend }
      });
      
      this.logger.log(`[SIMULATION] Detected fake ad pointing to campaignId=${campaign.id}`);
      this.logger.log(`[SIMULATION] Synced ₹${fakeSpend} to Campaign ${campaign.id}`);
      return { success: true, simulatedCampaignId: campaign.id, fakeSpend };
    }
    return { success: false, message: 'No campaigns found to simulate' };
  }
}
