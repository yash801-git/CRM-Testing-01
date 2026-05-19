import { Controller, Get, Post, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { IntegrationsService } from './integrations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IntegrationProvider } from '@prisma/client';

@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getIntegrations(@Request() req: any) {
    return this.integrationsService.getIntegrations(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':provider')
  saveIntegration(
    @Request() req: any,
    @Param('provider') provider: IntegrationProvider,
    @Body() config: any
  ) {
    return this.integrationsService.saveIntegration(req.user.id, provider, config);
  }

  @Get('webhooks/meta')
  verifyMetaWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ) {
    return this.integrationsService.verifyMetaWebhook(mode, token, challenge);
  }

  @Post('webhooks/meta')
  handleMetaWebhookPayload(@Body() body: any) {
    return this.integrationsService.handleMetaWebhookPayload(body);
  }
}
