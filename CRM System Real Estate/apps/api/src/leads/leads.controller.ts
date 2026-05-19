import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('leads')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  create(@Body() data: any, @Request() req: any) {
    return this.leadsService.create(data, req.user);
  }

  @Get()
  findAll(@Request() req: any, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.leadsService.findAll(req.user, page, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leadsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any, @Request() req: any) {
    return this.leadsService.update(id, data, req.user);
  }

  @Delete(':id')
  @Roles('BROKER')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.leadsService.remove(id, req.user);
  }
}
