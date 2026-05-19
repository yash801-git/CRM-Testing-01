import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ActivityService } from '../activity/activity.service';
import { validateTransition } from '../common/status-transition.validator';

@Injectable()
export class PropertiesService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private activityService: ActivityService,
  ) {}

  async findAll(requestingUser: { id: string; role: string }, page?: number, limit?: number) {
    const where = requestingUser.role === 'AGENT' ? { ownerId: requestingUser.id } : {};
    
    if (page && limit) {
      const skip = (Number(page) - 1) * Number(limit);
      const [data, total] = await Promise.all([
        this.prisma.property.findMany({
          where,
          include: { owner: { select: { name: true, email: true } } },
          orderBy: { createdAt: 'desc' },
          skip,
          take: Number(limit),
        }),
        this.prisma.property.count({ where }),
      ]);
      
      return {
        data,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      };
    }

    return this.prisma.property.findMany({
      where,
      include: { owner: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.property.findUnique({
      where: { id },
      include: { owner: { select: { name: true, email: true } } },
    });
  }

  async create(data: any, requestingUser: { id: string; role: string }) {
    if (requestingUser.role === 'AGENT') {
      data = { ...data, owner: { connect: { id: requestingUser.id } } };
      delete data.ownerId;
    } else if (data.ownerId) {
      const { ownerId, ...rest } = data;
      data = { ...rest, owner: { connect: { id: ownerId } } };
    }

    const property = await this.prisma.property.create({
      data,
      include: { owner: { select: { name: true, email: true } } },
    });

    await this.activityService.log({
      userId: requestingUser.id,
      action: 'CREATED',
      entityType: 'Property',
      entityId: property.id,
      entityTitle: property.title,
    });

    if (property.ownerId) {
      await this.notificationsService.create({
        title: 'New Property Added',
        message: `Property "${property.title}" has been added to your inventory.`,
        type: 'SUCCESS',
        userId: property.ownerId,
        link: '/properties',
      });
    }

    return property;
  }

  async update(id: string, data: any, requestingUser: { id: string; role: string }) {
    const existing = await this.prisma.property.findUnique({ where: { id } });

    if (requestingUser.role === 'AGENT' && existing?.ownerId !== requestingUser.id) {
      throw new ForbiddenException('You can only update your own properties.');
    }

    if (data.status && existing?.status && data.status !== existing.status) {
      validateTransition('Property', String(existing.status), String(data.status));
      await this.activityService.log({
        userId: requestingUser.id,
        action: 'STATUS_CHANGED',
        entityType: 'Property',
        entityId: id,
        entityTitle: existing.title,
        oldValue: existing.status,
        newValue: String(data.status),
      });
    }

    return this.prisma.property.update({
      where: { id },
      data,
      include: { owner: { select: { name: true, email: true } } },
    });
  }

  async remove(id: string, requestingUser: { id: string; role: string }) {
    if (requestingUser.role === 'AGENT') {
      throw new ForbiddenException('Agents cannot delete properties.');
    }
    const existing = await this.prisma.property.findUnique({ where: { id } });
    await this.activityService.log({
      userId: requestingUser.id,
      action: 'RECORD_DELETED',
      entityType: 'Property',
      entityId: id,
      entityTitle: existing?.title,
    });
    return this.prisma.property.delete({ where: { id } });
  }
}
