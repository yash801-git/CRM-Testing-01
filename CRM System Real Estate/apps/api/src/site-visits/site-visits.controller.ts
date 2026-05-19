import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SiteVisitsService } from './site-visits.service';
import { Prisma } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('site-visits')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SiteVisitsController {
  constructor(private readonly siteVisitsService: SiteVisitsService) {}

  @Post()
  create(@Body() data: Prisma.SiteVisitCreateInput) {
    return this.siteVisitsService.create(data);
  }

  @Get()
  findAll() {
    return this.siteVisitsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.siteVisitsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: Prisma.SiteVisitUpdateInput) {
    return this.siteVisitsService.update(id, data);
  }

  @Delete(':id')
  @Roles('BROKER')
  remove(@Param('id') id: string) {
    return this.siteVisitsService.remove(id);
  }
}
