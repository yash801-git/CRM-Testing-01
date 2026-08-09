import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { MarketingService } from './marketing.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

import { MetaSyncService } from './meta-sync.service';
import { GoogleSyncService } from './google-sync.service';

@Controller('marketing')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MarketingController {
  constructor(
    private readonly marketingService: MarketingService,
    private readonly metaSyncService: MetaSyncService,
    private readonly googleSyncService: GoogleSyncService,
  ) {}

  @Get('stats')
  getStats() {
    return this.marketingService.getStats();
  }

  @Get()
  findAll() {
    return this.marketingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.marketingService.findOne(id);
  }

  @Post()
  @Roles('BROKER')
  create(@Body() data: any, @Request() req: any) {
    return this.marketingService.create(data, req.user.id);
  }

  @Patch(':id')
  @Roles('BROKER')
  update(@Param('id') id: string, @Body() data: any) {
    return this.marketingService.update(id, data);
  }

  @Delete(':id')
  @Roles('BROKER')
  remove(@Param('id') id: string) {
    return this.marketingService.remove(id);
  }

  @Patch(':campaignId/leads/:leadId/responded')
  markResponded(
    @Param('campaignId') campaignId: string,
    @Param('leadId') leadId: string,
  ) {
    return this.marketingService.markLeadResponded(campaignId, leadId);
  }

  @Get('test-sandbox-sync')
  @Roles('BROKER', 'ADMIN')
  async triggerTestSync() {
    return this.metaSyncService.triggerTestSimulation();
  }

  @Get('test-g-sandbox')
  @Roles('BROKER', 'ADMIN')
  async triggerGoogleTestSync() {
    return this.googleSyncService.triggerTestSimulation();
  }
}
