import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('properties')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  create(@Body() data: any, @Request() req: any) {
    return this.propertiesService.create(data, req.user);
  }

  @Get()
  findAll(@Request() req: any, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.propertiesService.findAll(req.user, page, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.propertiesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any, @Request() req: any) {
    return this.propertiesService.update(id, data, req.user);
  }

  @Delete(':id')
  @Roles('BROKER')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.propertiesService.remove(id, req.user);
  }
}
