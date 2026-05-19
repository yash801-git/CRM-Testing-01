import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Request } from '@nestjs/common';
import { FollowUpsService } from './follow-ups.service';
import { Prisma, FollowUpStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('follow-ups')
@UseGuards(JwtAuthGuard)
export class FollowUpsController {
  constructor(private readonly followUpsService: FollowUpsService) {}

  @Post()
  create(@Request() req: any, @Body() data: Prisma.FollowUpUncheckedCreateInput) {
    // Ensure agentId is set to the current user if not provided
    return this.followUpsService.create({
      ...data,
      agentId: req.user.id,
    });
  }

  @Get()
  findAll(
    @Query('leadId') leadId?: string,
    @Query('dealId') dealId?: string,
    @Query('agentId') agentId?: string,
    @Query('status') status?: FollowUpStatus,
  ) {
    return this.followUpsService.findAll({ leadId, dealId, agentId, status });
  }

  @Get('me')
  findMyFollowUps(@Request() req: any, @Query('status') status?: FollowUpStatus) {
    return this.followUpsService.findAll({ agentId: req.user.id, status });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.followUpsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: Prisma.FollowUpUpdateInput) {
    return this.followUpsService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.followUpsService.remove(id);
  }
}
