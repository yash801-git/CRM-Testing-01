import { Controller, Get, Post, Patch, Body, UseGuards, Request, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import * as bcrypt from 'bcrypt';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    const users = await this.usersService.findAll();
    return users.map(user => {
      const { passwordHash, ...result } = user as any;
      return result;
    });
  }

  @Get('me')
  async getProfile(@Request() req: any) {
    // Note: JwtStrategy returns { id: payload.sub, ... }
    const user = await this.usersService.findById(req.user.id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { passwordHash, ...result } = user as any;
    return result;
  }

  @Patch('me')
  async updateProfile(@Request() req: any, @Body() data: any) {
    const user = await this.usersService.update(req.user.id, data);
    const { passwordHash, ...result } = user as any;
    return result;
  }

  @Post()
  async create(@Body() data: any) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.usersService.create({
      email: data.email,
      name: data.name,
      passwordHash: hashedPassword,
      role: data.role || 'AGENT',
      phone: data.phone,
    });
    const { passwordHash, ...result } = user as any;
    return result;
  }
}
