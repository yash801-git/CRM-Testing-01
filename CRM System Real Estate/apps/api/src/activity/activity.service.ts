import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface LogActivityDto {
  userId: string;
  action: 'STATUS_CHANGED' | 'RECORD_DELETED' | 'ASSIGNED' | 'CREATED' | 'UPDATED';
  entityType: string;
  entityId: string;
  entityTitle?: string;
  oldValue?: string;
  newValue?: string;
}

@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) {}

  async log(dto: LogActivityDto) {
    return this.prisma.activityLog.create({ data: dto });
  }

  async findByEntity(entityType: string, entityId: string) {
    return this.prisma.activityLog.findMany({
      where: { entityType, entityId },
      include: { user: { select: { name: true, role: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async findByUser(userId: string) {
    return this.prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
