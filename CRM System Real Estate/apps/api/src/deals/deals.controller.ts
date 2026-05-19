import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { DealsService } from './deals.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('deals')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Post()
  create(@Body() data: any, @Request() req: any) {
    return this.dealsService.create(data, req.user);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.dealsService.findAll(req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dealsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any, @Request() req: any) {
    return this.dealsService.update(id, data, req.user);
  }

  @Delete(':id')
  @Roles('BROKER')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.dealsService.remove(id, req.user);
  }
}
