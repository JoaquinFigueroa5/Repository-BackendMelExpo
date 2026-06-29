import { NotificationType } from '@prisma/client'
import { prisma } from '../lib/prisma'

export class NotificationService {
  async create(userId: number, title: string, message: string, type: NotificationType = 'INFO', link?: string) {
    return prisma.notification.create({
      data: { userId, title, message, type, link },
    })
  }

  async notifyUser(userId: number, title: string, message: string, link?: string) {
    return this.create(userId, title, message, 'INFO', link)
  }

  async notifyCoordinators(title: string, message: string, link?: string) {
    const coordinators = await prisma.user.findMany({
      where: {
        role: { in: ['COORDINATOR', 'ADMIN'] },
      },
    })

    for (const coord of coordinators) {
      await this.create(coord.id, title, message, 'ALERT', link)
    }
  }
}

export const notificationService = new NotificationService()
