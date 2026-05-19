import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService
  ) {}

  async findAll(page?: number, limit?: number) {
    if (page && limit) {
      const skip = (Number(page) - 1) * Number(limit);
      const [data, total] = await Promise.all([
        this.prisma.task.findMany({
          include: {
            assignee: { select: { name: true } },
            creator: { select: { name: true } },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: Number(limit),
        }),
        this.prisma.task.count(),
      ]);
      return {
        data,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      };
    }
    return this.prisma.task.findMany({
      include: {
        assignee: { select: { name: true } },
        creator: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.task.findUnique({
      where: { id },
      include: {
        assignee: { select: { name: true } },
        creator: { select: { name: true } },
      },
    });
  }

  async create(data: Prisma.TaskCreateInput) {
    const task = await this.prisma.task.create({
      data,
      include: {
        assignee: { select: { name: true } },
        creator: { select: { name: true } },
      },
    });

    if (task.assigneeId) {
      await this.notificationsService.create({
        title: 'New Task Assigned',
        message: `You have been assigned a new task: "${task.title}".`,
        type: 'WARNING',
        userId: task.assigneeId,
        link: '/tasks'
      });
    }

    return task;
  }

  async update(id: string, data: Prisma.TaskUpdateInput) {
    return this.prisma.task.update({
      where: { id },
      data,
      include: {
        assignee: { select: { name: true } },
        creator: { select: { name: true } },
      },
    });
  }

  async remove(id: string) {
    return this.prisma.task.delete({
      where: { id },
    });
  }
}
